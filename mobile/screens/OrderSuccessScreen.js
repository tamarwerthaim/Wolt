import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROUNDED_FONT } from '../config';

export default function OrderSuccessScreen({ route, navigation }) {
  const { restaurantName, cartTotal, cartItems } = route.params || {};
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Load Dark Mode setting to match Home screen styling
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
  }, []);

  // Timer to hide splash after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Theme styling configurations
  const containerBg = isDarkMode ? '#121212' : '#f3f4f6';
  const cardBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#6b7280';
  const borderCol = isDarkMode ? '#2d2d2d' : '#e5e7eb';

  if (showSplash) {
    return (
      <SafeAreaView style={[styles.splashContainer, { backgroundColor: containerBg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={containerBg} />
        <Image
          source={require('../assets/money.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <Text style={styles.splashText}>We are on the way!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={containerBg} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated-like checkmark and food illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/food.png')}
            style={styles.foodImage}
            resizeMode="contain"
          />
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>✓</Text>
          </View>
        </View>

        {/* Success message */}
        <Text style={[styles.title, { color: textColor }]}>Order Confirmed! 🎉</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          Your delicious dishes are being prepared.
        </Text>

        {/* Order Details Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Order Summary</Text>

          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: borderCol, paddingBottom: 12 }]}>
            <Text style={[styles.label, { color: subTextColor }]}>Restaurant:</Text>
            <Text style={[styles.value, { color: textColor }]}>{restaurantName || 'Wolt Restaurant'}</Text>
          </View>

          {/* Ordered items listing */}
          <View style={styles.itemsListContainer}>
            {cartItems && cartItems.map((item, index) => (
              <View key={`${item.productId}-${index}`} style={styles.itemRow}>
                <Text style={[styles.itemQtyText, { color: '#009DE0' }]}>{item.quantity}x</Text>
                <Text style={[styles.itemNameText, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemPriceText, { color: textColor }]}>
                  ₪{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: borderCol }]} />

          {/* Total Cost Row */}
          <View style={[styles.row, { marginTop: 4 }]}>
            <Text style={[styles.totalLabel, { color: textColor }]}>Total Paid</Text>
            <Text style={[styles.totalValue, { color: textColor }]}>₪{Number(cartTotal || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.homeButton}
          activeOpacity={0.8}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashCard: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  splashImage: {
    width: 500,
    height: 500,
    marginBottom: 8,
  },
  splashText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#009DE0',
    textAlign: 'center',
    fontFamily: ROUNDED_FONT,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    width: 312,
    height: 312,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodImage: {
    width: '130%',
    height: '130%',
  },
  successBadge: {
    position: 'absolute',
    bottom: 40,
    right: 37,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981', // green badge
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  successBadgeText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: ROUNDED_FONT,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    fontFamily: ROUNDED_FONT,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14.5,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  itemsListContainer: {
    paddingVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  itemQtyText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginRight: 8,
    minWidth: 24,
  },
  itemNameText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  itemPriceText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#009DE0',
  },
  homeButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#009DE0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
});
