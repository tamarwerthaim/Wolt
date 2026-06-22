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
  ActivityIndicator
} from 'react-native';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // States to manage input focus visual feedback
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // States to manage validation errors (Task 3.1.3)
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Check for stored token on mount (auto-login check)
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      } catch (err) {
        console.error('Error reading token from AsyncStorage:', err);
      } finally {
        setCheckingToken(false);
      }
    };
    checkToken();
  }, [navigation]);

  // Client-side validation logic
  const validateInputs = () => {
    let isValid = true;

    // Validate Username
    if (!username.trim()) {
      setUsernameError('Username is required');
      isValid = false;
    } else {
      setUsernameError('');
    }

    // Validate Password
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (!hasLetter || !hasNumber) {
      setPasswordError('Password must contain both letters and numbers');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    setError('');

    // Perform client-side validations
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Invalid username or password.');
      }

      // Save token in AsyncStorage (Task 3.1.4)
      await AsyncStorage.setItem('userToken', data.token);

      // Login success: Show the "Getting hungry?" splash screen
      setShowSplash(true);
      setLoading(false);

      // Simulate a 3-second splash transition before navigating to the main app dashboard
      setTimeout(() => {
        setShowSplash(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 3000);

    } catch (err) {
      setError(err.message || 'Server connection error. Please try again later.');
      setLoading(false);
    }
  };

  // Render loading state while verifying token
  if (checkingToken) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#009DE0" />
      </View>
    );
  }

  // Render Splash Screen if logged in successfully
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/food.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <Text style={styles.splashText}>Getting hungry?</Text>
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
          {/* Wolt Logo Container */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/wolt_circle2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.heading}>Log in to Wolt</Text>
          {/* Username Input Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Enter your username</Text>
            <TextInput
              style={[
                styles.input,
                usernameFocused && styles.inputActive,
                usernameError ? styles.inputError : null
              ]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (usernameError) setUsernameError('');
              }}
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
            />
            {usernameError ? <Text style={styles.errorTextInline}>{usernameError}</Text> : null}
          </View>

          {/* Password Input Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Enter your password</Text>
            <TextInput
              style={[
                styles.input,
                passwordFocused && styles.inputActive,
                passwordError ? styles.inputError : null
              ]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={true}
              autoCapitalize="none"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            {passwordError ? <Text style={styles.errorTextInline}>{passwordError}</Text> : null}
          </View>

          {/* General API Error Message */}
          {error ? <Text style={styles.errorTextGeneral}>{error}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Next</Text>
            )}
          </TouchableOpacity>

          {/* Skip option for quick verification */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip to Home</Text>
          </TouchableOpacity>

          {/* Registration Link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>New to Wolt? <Text style={styles.registerLinkHighlight}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light background to contrast with the card
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 75,
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
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: ROUNDED_FONT,
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
  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
  },
  helperText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif',
  },
  inputActive: {
    borderColor: '#009DE0',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff',
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
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#009DE0',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  registerLink: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  registerLinkText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: ROUNDED_FONT,
  },
  registerLinkHighlight: {
    color: '#009DE0',
    fontWeight: '700',
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
  },
  splashText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#009DE0',
    textAlign: 'center',
    fontFamily: ROUNDED_FONT,
  },
});
