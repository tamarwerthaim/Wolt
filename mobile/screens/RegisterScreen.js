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

  const [showEditOverlay, setShowEditOverlay] = useState(false);

  const handleFocus = (field) => {
    setFocusedField(field);
    setShowEditOverlay(false);
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

  const handleRegisterSubmit = () => {
    // Basic UI feedback for submit action (Task 3.2.2 will implement backend connection)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Registration Form Submitted!\nUsername: ${username}\nAdmin: ${isAdmin ? 'Yes' : 'No'}\nImage Chosen: ${imageUri ? 'Yes' : 'No'}`);
    }, 1500);
  };

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
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'username' && styles.inputActive
                    ]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    onFocus={() => handleFocus('username')}
                    onBlur={() => setFocusedField('')}
                  />
                </View>

                {/* Display Name Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Display Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'name' && styles.inputActive
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9ca3af"
                    onFocus={() => handleFocus('name')}
                    onBlur={() => setFocusedField('')}
                  />
                </View>

                {/* Phone Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'phone' && styles.inputActive
                    ]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => setFocusedField('')}
                  />
                </View>

                {/* Geolocation Row (Latitude & Longitude) */}
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Latitude</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'lat' && styles.inputActive
                      ]}
                      value={lat}
                      onChangeText={setLat}
                      placeholder="e.g. 32.0801"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      onFocus={() => handleFocus('lat')}
                      onBlur={() => setFocusedField('')}
                    />
                  </View>

                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.label}>Longitude</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'lng' && styles.inputActive
                      ]}
                      value={lng}
                      onChangeText={setLng}
                      placeholder="e.g. 34.7805"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      onFocus={() => handleFocus('lng')}
                      onBlur={() => setFocusedField('')}
                    />
                  </View>
                </View>

                {/* Password Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'password' && styles.inputActive
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    onFocus={() => handleFocus('password')}
                    onBlur={() => setFocusedField('')}
                  />
                </View>

                {/* Confirm Password Input Field */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'confirmPassword' && styles.inputActive
                    ]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                  />
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
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
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
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif',
  },
  inputActive: {
    borderColor: '#009DE0',
    backgroundColor: '#fff',
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
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
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
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
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
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
  },
});
