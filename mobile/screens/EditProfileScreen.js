import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import { formStyle } from '../styles/formStyle';

export default function EditProfileScreen({ route, navigation }) {
  const { userId } = route.params || {};

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  const [showEditOverlay, setShowEditOverlay] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('Login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load user details.');
        }

        const data = await response.json();
        setName(data.name || '');
        setPhone(data.phone || '');
        if (data.geolocation) {
          setLat(String(data.geolocation.lat) || '');
          setLng(String(data.geolocation.lng) || '');
        }
        if (data.profileImage) {
          setImageUri(`${API_BASE_URL}/uploads/${data.profileImage}`);
        }
      } catch (err) {
        setError(err.message || 'Could not fetch profile details.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError('User ID not provided.');
      setLoading(false);
    }
  }, [userId, navigation]);

  const handleImagePress = () => {
    if (imageUri) {
      setShowEditOverlay(!showEditOverlay);
    } else {
      pickImage();
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to update your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setShowEditOverlay(false);
      }
    } catch (e) {
      console.error('Error selecting image:', e);
    }
  };

  const validate = () => {
    if (!name.trim()) return 'Display name is required.';
    if (!phone.trim()) return 'Phone number is required.';
    if (!/^05\d{8}$/.test(phone.trim())) return 'Invalid Israeli phone number (must be 05XXXXXXXX).';

    const latNum = parseFloat(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) return 'Latitude must be a valid number between -90 and 90.';

    const lngNum = parseFloat(lng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) return 'Longitude must be a valid number between -180 and 180.';

    if (!imageUri) return 'Profile image is required.';

    return null;
  };

  const handleSaveSubmit = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('displayName', name.trim());
      formData.append('phone', phone.trim());
      formData.append('lat', lat.trim());
      formData.append('lng', lng.trim());

      // Only attach image if it is a local file URI (from image picker)
      if (imageUri && !imageUri.startsWith('http')) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('profileImage', {
          uri: imageUri,
          name: filename,
          type,
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      let responseData = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update profile.');
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(err.message || 'An error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInputStyle = (field) => {
    return [
      styles.input,
      focusedField === field && styles.inputActive
    ];
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#009DE0" />
        <Text style={{ marginTop: 12, fontSize: 16, fontFamily: ROUNDED_FONT, color: '#6b7280' }}>
          Loading user details...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => setShowEditOverlay(false)}>
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableWithoutFeedback onPress={() => setShowEditOverlay(false)}>
              <View style={styles.form}>
                <Text style={styles.heading}>Edit Profile</Text>

                {error ? <Text style={styles.errorTextGeneral}>⚠️ {error}</Text> : null}

                {/* Profile Image Picker */}
                <View style={styles.imagePickerWrapper}>
                  <TouchableOpacity
                    onPress={handleImagePress}
                    style={[
                      styles.imagePickerCircle,
                      imageUri && { borderStyle: 'solid', borderColor: '#e5e7eb' }
                    ]}
                    activeOpacity={0.8}
                  >
                    {imageUri ? (
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                        {showEditOverlay ? (
                          <View style={styles.editOverlay}>
                            <TouchableOpacity onPress={pickImage} style={styles.pencilBadge}>
                              <Text style={styles.editOverlayIcon}>✎</Text>
                            </TouchableOpacity>
                          </View>
                        ) : null}
                      </View>
                    ) : (
                      <View style={styles.imagePickerPlaceholder}>
                        <Text style={styles.imagePickerPlus}>+</Text>
                        <Text style={styles.imagePickerText}>Add Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Display Name Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Display Name</Text>
                  <TextInput
                    style={getInputStyle('name')}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#9ca3af"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                  />
                </View>

                {/* Phone Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={getInputStyle('phone')}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. 05XXXXXXXX"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedField('phone')}
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
                      placeholder="e.g. 32.0801"
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
                      placeholder="e.g. 34.7805"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      onFocus={() => setFocusedField('lng')}
                      onBlur={() => setFocusedField('')}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSaveSubmit}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ...formStyle,
});
