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

export default function AddRestaurantScreen({ navigation }) {
  const [name, setName] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const value = await AsyncStorage.getItem('darkModeEnabled');
        if (value !== null) {
          setIsDarkMode(value === 'true');
        }
      } catch (e) {
        console.error('Error loading dark mode:', e);
      }
    };
    loadDarkMode();
    const unsubscribe = navigation.addListener('focus', loadDarkMode);
    return unsubscribe;
  }, [navigation]);

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
      isDarkMode && { backgroundColor: '#2d2d2d', color: '#ffffff', borderColor: '#2d2d2d' },
      focusedField === field && [
        styles.inputActive,
        isDarkMode && { backgroundColor: '#1e1e1e', borderColor: '#009DE0' }
      ]
    ];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDarkMode && { backgroundColor: '#121212' }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.form, isDarkMode && { backgroundColor: '#1e1e1e', borderColor: '#2d2d2d' }]}>
          <Text style={[styles.heading, isDarkMode && { color: '#ffffff' }]}>Add New Restaurant</Text>

          {error ? <Text style={styles.errorTextGeneral}>⚠️ {error}</Text> : null}

          {/* Image Picker */}
          <TouchableOpacity
            style={[styles.imagePicker, isDarkMode && { backgroundColor: '#2d2d2d', borderColor: '#4b5563' }]}
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
                <Text style={[styles.placeholderPlus, isDarkMode && { color: '#888888' }]}>+</Text>
                <Text style={[styles.placeholderText, isDarkMode && { color: '#d1d5db' }]}>Choose Restaurant Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, isDarkMode && { color: '#ffffff' }]}>Restaurant Name</Text>
            <TextInput
              style={getInputStyle('name')}
              value={name}
              onChangeText={setName}
              placeholder="e.g. McDonald's"
              placeholderTextColor={isDarkMode ? '#888888' : '#9ca3af'}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Prep Time Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, isDarkMode && { color: '#ffffff' }]}>Preparation Time (minutes)</Text>
            <TextInput
              style={getInputStyle('prepTime')}
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="e.g. 15"
              placeholderTextColor={isDarkMode ? '#888888' : '#9ca3af'}
              keyboardType="numeric"
              onFocus={() => setFocusedField('prepTime')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Geolocation Fields */}
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, isDarkMode && { color: '#ffffff' }]}>Latitude</Text>
              <TextInput
                style={getInputStyle('lat')}
                value={lat}
                onChangeText={setLat}
                placeholder="e.g. 32.08"
                placeholderTextColor={isDarkMode ? '#888888' : '#9ca3af'}
                keyboardType="numeric"
                onFocus={() => setFocusedField('lat')}
                onBlur={() => setFocusedField('')}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={[styles.label, isDarkMode && { color: '#ffffff' }]}>Longitude</Text>
              <TextInput
                style={getInputStyle('lng')}
                value={lng}
                onChangeText={setLng}
                placeholder="e.g. 34.78"
                placeholderTextColor={isDarkMode ? '#888888' : '#9ca3af'}
                keyboardType="numeric"
                onFocus={() => setFocusedField('lng')}
                onBlur={() => setFocusedField('')}
              />
            </View>
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
              <Text style={styles.submitButtonText}>Add Restaurant</Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
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
    width: '100%',
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
});
