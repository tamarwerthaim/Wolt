import React, { useState } from 'react';
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
  TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, ROUNDED_FONT } from '../config';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [touchedFields, setTouchedFields] = useState({});
  const [error, setError] = useState('');

  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFocus = (field) => {
    setFocusedField(field);
    setShowEditOverlay(false);
  };

  const markAsTouched = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocusedField('');
    markAsTouched(field);
  };

  // Validation functions
  const validateUsername = (val) => val.trim().length > 0;
  const validateName = (val) => val.trim().length > 0;
  
  const validatePhone = (val) => {
    return /^05\d{8}$/.test(val);
  };

  const validateLat = (val) => {
    if (!val || isNaN(val)) return false;
    const num = parseFloat(val);
    return num >= -90 && num <= 90;
  };

  const validateLng = (val) => {
    if (!val || isNaN(val)) return false;
    const num = parseFloat(val);
    return num >= -180 && num <= 180;
  };

  const validatePassword = (val) => {
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    return val.length >= 8 && hasLetter && hasNumber;
  };

  const validateConfirmPassword = (val) => {
    return val === password && val.length > 0;
  };

  const validateField = (field, val) => {
    switch (field) {
      case 'username': return validateUsername(val);
      case 'name': return validateName(val);
      case 'phone': return validatePhone(val);
      case 'lat': return validateLat(val);
      case 'lng': return validateLng(val);
      case 'password': return validatePassword(val);
      case 'confirmPassword': return validateConfirmPassword(val);
      default: return true;
    }
  };

  const getFieldError = (field) => {
    switch (field) {
      case 'username': return 'Username is required';
      case 'name': return 'Display name is required';
      case 'phone': return 'Must be a valid Israeli phone number (e.g. 05XXXXXXXX)';
      case 'lat': return 'Latitude must be between -90 and 90';
      case 'lng': return 'Longitude must be between -180 and 180';
      case 'password': return 'Must be at least 8 characters with letters & numbers';
      case 'confirmPassword': return 'Passwords do not match';
      default: return '';
    }
  };

  const isFormValid = () => {
    return (
      validateUsername(username) &&
      validateName(name) &&
      validatePhone(phone) &&
      validateLat(lat) &&
      validateLng(lng) &&
      validatePassword(password) &&
      validateConfirmPassword(confirmPassword)
    );
  };

  const getInputStyle = (field, value) => {
    const isValid = validateField(field, value);
    const isTouched = touchedFields[field];
    
    if (focusedField === field) {
      return [styles.input, styles.inputActive];
    }
    if (isTouched && !isValid) {
      return [styles.input, styles.inputError];
    }
    if (value && isValid) {
      return [styles.input, styles.inputSuccess];
    }
    return styles.input;
  };

  const renderStatusIndicator = (field, value) => {
    const isValid = validateField(field, value);
    const isTouched = touchedFields[field];
    
    if (value && isValid) {
      return (
        <View style={styles.statusIndicator}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
      );
    }
    if (isTouched && !isValid) {
      return (
        <View style={styles.statusIndicator}>
          <Text style={styles.errorIcon}>✗</Text>
        </View>
      );
    }
    return null;
  };

  const renderErrorMessage = (field, value) => {
    const isValid = validateField(field, value);
    const isTouched = touchedFields[field];
    
    if (isTouched && !isValid) {
      return <Text style={styles.errorTextInline}>{getFieldError(field)}</Text>;
    }
    return null;
  };

  // Handle image picking
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
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
  };

  const handleImagePress = () => {
    if (!imageUri) {
      pickImage();
    } else {
      if (!showEditOverlay) {
        setShowEditOverlay(true);
      } else {
        pickImage();
      }
    }
  };

  const handleRegisterSubmit = async () => {
    setError('');

    if (!isFormValid()) {
      setTouchedFields({
        username: true,
        name: true,
        phone: true,
        lat: true,
        lng: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    if (!imageUri) {
      setError('Profile image is required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('displayName', name);
      formData.append('phone', phone);
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('isAdmin', isAdmin ? 'true' : 'false');

      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('profileImage', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        navigation.navigate('Login');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Server connection error. Please try again.');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/wolt_circle2.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <Text style={styles.splashText}>Welcome to Wolt Family!</Text>
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
                {/* Wolt Logo Container */}
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../assets/wolt_circle2.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.heading}>Sign up to Wolt</Text>

                {/* Username Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Username</Text>
                  <View style={{ position: 'relative', width: '100%' }}>
                    <TextInput
                      style={getInputStyle('username', username)}
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        if (touchedFields.username) markAsTouched('username');
                      }}
                      placeholder="Enter your username"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      onFocus={() => handleFocus('username')}
                      onBlur={() => handleBlur('username')}
                    />
                    {renderStatusIndicator('username', username)}
                  </View>
                  {renderErrorMessage('username', username)}
                </View>

                {/* Display Name Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Display Name</Text>
                  <View style={{ position: 'relative', width: '100%' }}>
                    <TextInput
                      style={getInputStyle('name', name)}
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (touchedFields.name) markAsTouched('name');
                      }}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9ca3af"
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                    />
                    {renderStatusIndicator('name', name)}
                  </View>
                  {renderErrorMessage('name', name)}
                </View>

                {/* Phone Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={{ position: 'relative', width: '100%' }}>
                    <TextInput
                      style={getInputStyle('phone', phone)}
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text);
                        if (touchedFields.phone) markAsTouched('phone');
                      }}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      onFocus={() => handleFocus('phone')}
                      onBlur={() => handleBlur('phone')}
                    />
                    {renderStatusIndicator('phone', phone)}
                  </View>
                  {renderErrorMessage('phone', phone)}
                </View>

                {/* Geolocation Row (Latitude & Longitude) */}
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Latitude</Text>
                    <View style={{ position: 'relative', width: '100%' }}>
                      <TextInput
                        style={getInputStyle('lat', lat)}
                        value={lat}
                        onChangeText={(text) => {
                          setLat(text);
                          if (touchedFields.lat) markAsTouched('lat');
                        }}
                        placeholder="e.g. 32.0801"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        onFocus={() => handleFocus('lat')}
                        onBlur={() => handleBlur('lat')}
                      />
                      {renderStatusIndicator('lat', lat)}
                    </View>
                    {renderErrorMessage('lat', lat)}
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.label}>Longitude</Text>
                    <View style={{ position: 'relative', width: '100%' }}>
                      <TextInput
                        style={getInputStyle('lng', lng)}
                        value={lng}
                        onChangeText={(text) => {
                          setLng(text);
                          if (touchedFields.lng) markAsTouched('lng');
                        }}
                        placeholder="e.g. 34.7805"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        onFocus={() => handleFocus('lng')}
                        onBlur={() => handleBlur('lng')}
                      />
                      {renderStatusIndicator('lng', lng)}
                    </View>
                    {renderErrorMessage('lng', lng)}
                  </View>
                </View>

                {/* Password Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Password</Text>
                  <View style={{ position: 'relative', width: '100%' }}>
                    <TextInput
                      style={getInputStyle('password', password)}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (touchedFields.password) markAsTouched('password');
                        if (touchedFields.confirmPassword) markAsTouched('confirmPassword');
                      }}
                      placeholder="Create a password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={true}
                      autoCapitalize="none"
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                    />
                    {renderStatusIndicator('password', password)}
                  </View>
                  {renderErrorMessage('password', password)}
                </View>

                {/* Confirm Password Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={{ position: 'relative', width: '100%' }}>
                    <TextInput
                      style={getInputStyle('confirmPassword', confirmPassword)}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (touchedFields.confirmPassword) markAsTouched('confirmPassword');
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={true}
                      autoCapitalize="none"
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                    />
                    {renderStatusIndicator('confirmPassword', confirmPassword)}
                  </View>
                  {renderErrorMessage('confirmPassword', confirmPassword)}
                </View>

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
                        {showEditOverlay && (
                          <View style={styles.editOverlay}>
                            <View style={styles.pencilBadge}>
                              <Text style={styles.editOverlayIcon}>✎</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={styles.imagePickerPlaceholder}>
                        <Text style={styles.imagePickerPlus}>+</Text>
                        <Text style={styles.imagePickerText}>Add Photo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Custom Checkbox (Owner Status) */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => {
                    setIsAdmin(!isAdmin);
                    setShowEditOverlay(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                    {isAdmin && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>I am a restaurant owner (Register as Admin)</Text>
                </TouchableOpacity>

                {/* General API Error Message */}
                {error ? <Text style={styles.errorTextGeneral}>{error}</Text> : null}

                {/* Register Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRegisterSubmit}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>

                {/* Back to Login option */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonText}>Already have an account? Log In</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  logo: {
    width: 125,
    height: 125,
    borderRadius: 50,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-condensed',
  },
  form: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  imagePickerWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePickerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pencilBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editOverlayIcon: {
    fontSize: 24,
    color: '#000',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerPlus: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: '700',
    lineHeight: 26,
  },
  imagePickerText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  inputWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 6,
    fontFamily: ROUNDED_FONT,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 40,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif',
  },
  inputActive: {
    borderColor: '#009DE0',
    backgroundColor: '#fff',
  },
  inputSuccess: {
    borderColor: '#22c55e',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff',
  },
  successIcon: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    right: 14,
    top: 13,
  },
  errorTextInline: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    paddingLeft: 4,
  },
  errorTextGeneral: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
    marginVertical: 12,
    textAlign: 'center',
    fontFamily: ROUNDED_FONT,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    width: '100%',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#009DE0',
    backgroundColor: '#009DE0',
  },
  checkboxCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    flex: 1,
    fontFamily: ROUNDED_FONT,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#009DE0',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#009DE0',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashImage: {
    width: 200,
    height: 200,
    marginBottom: 28,
    borderRadius: 100,
  },
  splashText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#009DE0',
    textAlign: 'center',
    fontFamily: ROUNDED_FONT,
  },
});
