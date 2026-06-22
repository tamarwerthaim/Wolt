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
  ActivityIndicator
} from 'react-native';
import { API_BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // States to manage input focus visual feedback
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!username || !password) {
      setError('You must fill in all fields to connect');
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

      // Login success: Show the "Getting hungry?" splash screen
      setShowSplash(true);
      setLoading(false);

      // Simulate a 3-second splash transition before navigating to the main app dashboard
      setTimeout(() => {
        setShowSplash(false);
        navigation.navigate('Home');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Server connection error. Please try again later.');
      setLoading(false);
    }
  };

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
        {/* Wolt Logo Container */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/wolt_circle2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.heading}>Log in to Wolt</Text>

        <View style={styles.form}>
          {/* Username Input Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Enter your username</Text>
            <TextInput
              style={[styles.input, usernameFocused && styles.inputActive]}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
            />
          </View>

          {/* Password Input Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Enter your password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputActive]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={true}
              autoCapitalize="none"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 36,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
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
  },
  inputActive: {
    borderColor: '#009DE0',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
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
  },
});
