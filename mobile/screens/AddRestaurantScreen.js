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

export default function AddRestaurantScreen({ navigation }) {
  const [name, setName] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload restaurant images.');
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
    if (!name.trim()) return 'Restaurant name is required.';
    if (!imageUri) return 'Please select an image for the restaurant.';
    
    const prep = parseInt(prepTime);
    if (isNaN(prep) || prep <= 0) return 'Prep time must be a positive number.';

    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) return 'Latitude must be between -90 and 90.';

    const lngNum = parseFloat(lng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) return 'Longitude must be between -180 and 180.';

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
        throw new Error('You must be logged in as an administrator.');
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('prepTime', prepTime.trim());
      formData.append('lat', lat.trim());
      formData.append('lng', lng.trim());

      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('restaurantImage', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
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
        throw new Error(responseData.error || 'Failed to create restaurant.');
      }

      Alert.alert('Success', 'Restaurant added successfully!', [
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
      focusedField === field && styles.inputFocused
    ];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.title}>Add New Restaurant</Text>

          {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

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
                <Text style={styles.placeholderText}>Choose Restaurant Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={getInputStyle('name')}
              value={name}
              onChangeText={setName}
              placeholder="e.g. McDonald's"
              placeholderTextColor="#9ca3af"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Prep Time Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Preparation Time (minutes)</Text>
            <TextInput
              style={getInputStyle('prepTime')}
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="e.g. 15"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              onFocus={() => setFocusedField('prepTime')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Geolocation Fields */}
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={getInputStyle('lat')}
                value={lat}
                onChangeText={setLat}
                placeholder="e.g. 32.08"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                onFocus={() => setFocusedField('lat')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={getInputStyle('lng')}
                value={lng}
                onChangeText={setLng}
                placeholder="e.g. 34.78"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                onFocus={() => setFocusedField('lng')}
                onBlur={() => setFocusedField('')}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Add Restaurant</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
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
  inputWrapper: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 6,
    fontFamily: ROUNDED_FONT,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    fontFamily: ROUNDED_FONT,
  },
  inputFocused: {
    borderColor: '#009DE0',
    backgroundColor: '#fff',
  },
  submitBtn: {
    height: 52,
    backgroundColor: '#009DE0',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
});
