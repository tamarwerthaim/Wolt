import React, { useState } from 'react';
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

export default function AddProductScreen({ route, navigation }) {
  const { restaurantId } = route.params || {};

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');

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
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('You must be logged in as an administrator to add products.');
      }

      const numPrice = parseFloat(price);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('price', numPrice.toString());
      formData.append('description', description.trim());

      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('productImage', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/products`, {
        method: 'POST',
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
        throw new Error(responseData.error || 'Failed to add product.');
      }

      Alert.alert('Success', 'Product added successfully to menu!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => {
    return [
      styles.input,
      focusedField === field && styles.inputActive
    ];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.heading}>Add New Product</Text>

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
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ...formStyle,

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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
});
