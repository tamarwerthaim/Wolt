import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import { formStyle } from '../styles/formStyle';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const customAtob = (input = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';
  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    let bc = 0, bs = 0, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      customAtob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

export default function EditProductScreen({ route, navigation }) {
  const { restaurantId, productId } = route.params || {};

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');

  // Fetch product and restaurant details to verify ownership on mount
  useEffect(() => {
    const fetchProductAndRestaurantDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('You must be logged in to edit a product.');
        }

        const payload = decodeJwt(token);
        if (!payload || !payload.isAdmin) {
          throw new Error('You must be an administrator to perform this action.');
        }

        // 1. Load restaurant details to check ownership
        const restResponse = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
        if (!restResponse.ok) {
          throw new Error('Failed to load restaurant details.');
        }
        const restData = await restResponse.json();

        // Enforce ownership check
        if (restData.ownerId !== payload.id) {
          throw new Error('You are not authorized to edit this product since you are not the owner of this restaurant.');
        }

        // 2. Load product details
        const prodResponse = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products/${productId}`);
        if (!prodResponse.ok) {
          throw new Error('Failed to load product details.');
        }
        const prodData = await prodResponse.json();

        setName(prodData.name || '');
        setPrice(prodData.price?.toString() || '');
        setDescription(prodData.description || '');
        if (prodData.image) {
          setExistingImage(prodData.image);
          setImageUri(prodData.image.startsWith('/uploads') ? `${API_BASE_URL}${prodData.image}` : prodData.image);
        }
      } catch (err) {
        setError(err.message || 'Error loading product details.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId && productId) {
      fetchProductAndRestaurantDetails();
    }
  }, [restaurantId, productId]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload product images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error selecting image:', e);
    }
  };

  const handleRevertImage = () => {
    if (existingImage) {
      setImageUri(existingImage.startsWith('/uploads') ? `${API_BASE_URL}${existingImage}` : existingImage);
    } else {
      setImageUri(null);
    }
  };

  const validate = () => {
    if (!name.trim()) return 'Product name is required.';
    
    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      return 'Price must be a valid positive number greater than 0.';
    }

    if (!description.trim()) return 'Product description is required.';
    if (!imageUri) return 'Please select an image for the product.';

    return null;
  };

  const handleSubmit = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('You must be logged in.');
      }

      const numPrice = parseFloat(price);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('price', numPrice.toString());
      formData.append('description', description.trim());

      // If a new local image is chosen, upload it
      if (imageUri && (imageUri.startsWith('file:') || imageUri.startsWith('content:') || imageUri.includes('ExponentExperienceData'))) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('productImage', {
          uri: imageUri,
          name: filename,
          type,
        });
      } else {
        formData.append('image', existingImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      let responseData = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update product.');
      }

      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      setError(e.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              const token = await AsyncStorage.getItem('userToken');
              if (!token) throw new Error('You must be logged in.');

              const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (!response.ok) {
                let errorMsg = 'Failed to delete product.';
                try {
                  const data = await response.json();
                  errorMsg = data.error || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
              }

              Alert.alert('Deleted', 'Product deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (e) {
              setError(e.message || 'An error occurred during deletion.');
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const getInputStyle = (field) => {
    return [
      styles.input,
      focusedField === field && styles.inputActive
    ];
  };

  if (loading) {
    return (
      <View style={formStyle.centerContainer}>
        <ActivityIndicator size="large" color="#009DE0" />
        <Text style={styles.loadingText}>Loading Product Details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.heading}>Edit Product</Text>

          {error ? <Text style={styles.errorTextGeneral}>⚠️ {error}</Text> : null}

          {/* Image Picker */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeIcon}>✎</Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderPlus}>+</Text>
                <Text style={styles.placeholderText}>Choose Product Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Revert image option if new image selected */}
          {imageUri && existingImage && imageUri !== (existingImage.startsWith('/uploads') ? `${API_BASE_URL}${existingImage}` : existingImage) && (
            <TouchableOpacity style={styles.revertBtn} onPress={handleRevertImage}>
              <Text style={styles.revertBtnText}>Revert to Original Image</Text>
            </TouchableOpacity>
          )}

          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={getInputStyle('name')}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Double Beef Burger"
              placeholderTextColor="#9ca3af"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Price Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Price (₪)</Text>
            <TextInput
              style={getInputStyle('price')}
              value={price}
              onChangeText={setPrice}
              placeholder="e.g. 45"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              onFocus={() => setFocusedField('price')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[getInputStyle('description'), styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the ingredients, size, and details of the dish..."
              placeholderTextColor="#9ca3af"
              multiline={true}
              numberOfLines={4}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.deleteBtnText}>Delete Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ...formStyle,

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
    fontFamily: ROUNDED_FONT,
  },
  imagePicker: {
    height: 150,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#009DE0',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  editBadgeIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderPlus: {
    fontSize: 32,
    color: '#9ca3af',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    fontFamily: ROUNDED_FONT,
  },
  revertBtn: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  revertBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  deleteBtn: {
    height: 52,
    backgroundColor: '#ef4444',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
});
