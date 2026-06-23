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
import { formStyle } from '../styles/formStyle';
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
  ...formStyle,
  scrollContent: formStyle.scrollContentLogin,
  splashImage: formStyle.loginSplashImage,
  helperText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'ui-rounded' : 'sans-serif-medium',
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
});
