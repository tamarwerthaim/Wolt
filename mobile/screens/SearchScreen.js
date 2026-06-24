import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import RestaurantCard from '../components/RestaurantCard';

// Custom Custom Chevron Down Icon
const ChevronDownIcon = ({ isDarkMode }) => {
  const iconColor = isDarkMode ? '#009DE0' : '#202124';
  return (
    <View style={styles.chevronContainer}>
      <View style={[styles.chevronLine, { transform: [{ rotate: '45deg' }], backgroundColor: iconColor }]} />
      <View style={[styles.chevronLine, { transform: [{ rotate: '-45deg' }], marginLeft: -4, backgroundColor: iconColor }]} />
    </View>
  );
};

// Magnifying Glass Search Icon
const SearchLensIcon = ({ isDarkMode }) => {
  const iconColor = isDarkMode ? '#009DE0' : '#9ca3af';
  return (
    <View style={styles.searchLensContainer}>
      <View style={[styles.lensCircle, { borderColor: iconColor }]} />
      <View style={[styles.lensHandle, { backgroundColor: iconColor }]} />
    </View>
  );
};

// Custom Views-based Blue Scooter Icon (classic Vespa layout)
const BlueScooterIcon = () => (
  <Image
    source={require('../assets/Bike.png')}
    style={styles.scooterImage}
    resizeMode="contain"
  />
);

// Base64 decoder helpers for JWT tokens
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const customAtob = (input = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';
  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    let bc = 0, bs = 0, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      customAtob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getDeliveryTimeStr = (restaurant, userDetails) => {
  const userLat = userDetails?.geolocation?.lat ?? 32.0853;
  const userLng = userDetails?.geolocation?.lng ?? 34.7818;
  const prepTime = restaurant?.prepTime || 15;

  if (restaurant?.geolocation) {
    const distance = getDistance(
      userLat,
      userLng,
      restaurant.geolocation.lat,
      restaurant.geolocation.lng
    );
    if (distance !== null) {
      const travelTime = Math.round(distance * 3);
      const deliveryTime = travelTime + prepTime;
      return `${deliveryTime}-${deliveryTime + 5} min`;
    }
  }
  return `${prepTime + 15}-${prepTime + 20} min`;
};

const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
  }
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return imagePath;
};

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ restaurants: [], products: [] });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'restaurants' | 'dishes'

  // Load dark mode preference and login status on mount/focus
  useEffect(() => {
    const loadDarkModeAndAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!token);
        if (!token) {
          setIsDarkMode(false);
          await AsyncStorage.setItem('darkModeEnabled', 'false');
          setUserDetails(null);
          return;
        }

        // Load Dark Mode
        const value = await AsyncStorage.getItem('darkModeEnabled');
        if (value !== null) {
          setIsDarkMode(value === 'true');
        }

        // Fetch User Details
        const payload = decodeJwt(token);
        if (payload && payload.id) {
          const res = await fetch(`${API_BASE_URL}/api/users/${payload.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUserDetails(data);
          } else {
            setUserDetails(null);
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.setItem('darkModeEnabled', 'false');
            setIsDarkMode(false);
            setIsLoggedIn(false);
          }
        }
      } catch (e) {
        console.error('Error loading config/auth in SearchScreen:', e);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadDarkModeAndAuth();
    });
    loadDarkModeAndAuth();
    return unsubscribe;
  }, [navigation]);

  // Debounced Search query
  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults({ restaurants: [], products: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/search/${encodeURIComponent(query.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          setResults({ restaurants: [], products: [] });
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults({ restaurants: [], products: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Styling helpers
  const bgTheme = isDarkMode ? '#121212' : '#ffffff';
  const textTheme = isDarkMode ? '#ffffff' : '#1f2937';
  const subTextTheme = isDarkMode ? '#a0a0a0' : '#6b7280';
  const borderTheme = isDarkMode ? '#2d2d2d' : '#e5e7eb';
  const cardBgTheme = isDarkMode ? '#1e1e1e' : '#f9fafb';
  const inputBgTheme = isDarkMode ? '#1e1e1e' : '#f3f4f6';

  // Filter conditions
  const filteredRestaurants = results.restaurants || [];
  const filteredProducts = results.products || [];

  const showRestaurants = activeFilter === 'all' || activeFilter === 'restaurants';
  const showDishes = activeFilter === 'all' || activeFilter === 'dishes';

  const hasResults = filteredRestaurants.length > 0 || filteredProducts.length > 0;
  const showEmptyIllustration = query.trim() !== '' && !loading && !hasResults;
  const showInitialIllustration = query.trim() === '';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgTheme }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={bgTheme} />

      {/* Search Header Bar */}
      <View style={[styles.headerContainer, { borderBottomColor: borderTheme }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronDownIcon isDarkMode={isDarkMode} />
        </TouchableOpacity>

        <View style={[styles.searchInputWrapper, { backgroundColor: inputBgTheme }]}>
          <SearchLensIcon isDarkMode={isDarkMode} />
          <TextInput
            style={[styles.searchInput, { color: textTheme }]}
            placeholder="What are you craving today?"
            placeholderTextColor={isDarkMode ? '#888888' : '#9ca3af'}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={[styles.clearBtnText, { color: subTextTheme }]}>✖</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Initial State: food.png */}
      {showInitialIllustration && (
        <View style={styles.centerContainer}>
          <Image
            source={require('../assets/food.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
          <Text style={[styles.illustrationTitle, { color: textTheme }]}>Let's find some food!</Text>
          <Text style={[styles.illustrationSubtitle, { color: subTextTheme }]}>Search for your favorite restaurants and dishes</Text>
        </View>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009DE0" />
          <Text style={[styles.loadingText, { color: subTextTheme }]}>Searching Wolt...</Text>
        </View>
      )}

      {/* Empty Result State: cry.png */}
      {showEmptyIllustration && (
        <View style={styles.centerContainer}>
          <Image
            source={require('../assets/cry.png')}
            style={[styles.illustrationImage, styles.cryIllustrationImage]}
            resizeMode="contain"
          />
          <Text style={[styles.illustrationTitle, { color: textTheme }]}>No results found</Text>
          <Text style={[styles.illustrationSubtitle, { color: subTextTheme }]}>We couldn't find anything matching "{query}"</Text>
        </View>
      )}

      {/* Search Results */}
      {!loading && hasResults && (
        <View style={{ flex: 1 }}>
          {/* Filters Pill Row */}
          <View style={[styles.filterRow, { borderBottomColor: borderTheme }]}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'all' ? styles.activeFilterPill : { backgroundColor: inputBgTheme }
              ]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterPillText,
                activeFilter === 'all' ? styles.activeFilterPillText : { color: textTheme }
              ]}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'restaurants' ? styles.activeFilterPill : { backgroundColor: inputBgTheme }
              ]}
              onPress={() => setActiveFilter('restaurants')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterPillText,
                activeFilter === 'restaurants' ? styles.activeFilterPillText : { color: textTheme }
              ]}>Restaurants ({filteredRestaurants.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'dishes' ? styles.activeFilterPill : { backgroundColor: inputBgTheme }
              ]}
              onPress={() => setActiveFilter('dishes')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterPillText,
                activeFilter === 'dishes' ? styles.activeFilterPillText : { color: textTheme }
              ]}>Dishes ({filteredProducts.length})</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* MATCHING RESTAURANTS SECTION */}
            {showRestaurants && filteredRestaurants.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: textTheme }]}>Restaurants</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filteredRestaurants}
                  keyExtractor={(item) => `restaurant-${item.id}`}
                  contentContainerStyle={styles.restaurantsHorizontalList}
                  renderItem={({ item }) => (
                    <RestaurantCard
                      item={item}
                      isLoggedIn={isLoggedIn}
                      isDarkMode={isDarkMode}
                      deliveryTimeStr={getDeliveryTimeStr(item, userDetails)}
                      isCarousel={true}
                      onPress={() => navigation.navigate('RestaurantDetails', { id: item.id })}
                    />
                  )}
                />
              </View>
            )}

            {/* MATCHING DISHES/PRODUCTS SECTION */}
            {showDishes && filteredProducts.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: textTheme }]}>Dishes</Text>
                {filteredProducts.map((product) => {
                  const imageUrl = getFullImageUrl(product.image);
                  return (
                    <TouchableOpacity
                      key={`product-${product.id}`}
                      style={[styles.dishCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}
                      onPress={() => navigation.navigate('RestaurantDetails', { id: product.restaurantId })}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: imageUrl }} style={styles.dishImage} />
                      <View style={styles.dishInfo}>
                        <View style={styles.dishNameRow}>
                          <Text style={[styles.dishName, { color: textTheme }]} numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text style={styles.dishPrice}>₪{product.price}</Text>
                        </View>
                        <Text style={[styles.dishDescription, { color: subTextTheme }]} numberOfLines={2}>
                          {product.description}
                        </Text>
                        <View style={styles.cardPrepRow}>
                          <BlueScooterIcon />
                          <Text style={styles.dishRestaurantBadge}>
                            from {product.restaurantName}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  chevronLine: {
    width: 10,
    height: 3,
    borderRadius: 2,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchLensContainer: {
    width: 20,
    height: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lensCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  lensHandle: {
    width: 2,
    height: 6,
    position: 'absolute',
    right: 3,
    bottom: 3,
    transform: [{ rotate: '-45deg' }],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: ROUNDED_FONT,
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150, // Centers the loading spinner above the keyboard
  },
  illustrationImage: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').width * 0.95,
    maxHeight: 315,
    maxWidth: 315,
    marginBottom: 5,
  },
  cryIllustrationImage: {
    transform: [{ scale: 1.12 }],
  },
  illustrationTitle: {
    fontSize: 30,
    fontWeight: '900',
    fontFamily: ROUNDED_FONT,
    textAlign: 'center',
    marginBottom: 6,
  },
  illustrationSubtitle: {
    fontSize: 20,
    fontFamily: ROUNDED_FONT,
    textAlign: 'center',
    lineHeight: 26,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: ROUNDED_FONT,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: '#009DE0',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  activeFilterPillText: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    marginBottom: 12,
  },
  restaurantsHorizontalList: {
    paddingBottom: 4,
  },
  restaurantCard: {
    width: 140,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  restaurantCardImage: {
    width: '100%',
    height: 90,
  },
  restaurantCardInfo: {
    padding: 8,
  },
  restaurantCardName: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  restaurantCardPrep: {
    fontSize: 11,
    color: '#009DE0',
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  cardPrepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scooterImage: {
    width: 14,
    height: 18,
    marginRight: 4,
  },
  dishCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    padding: 10,
    alignItems: 'center',
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  dishNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dishName: {
    fontSize: 14.5,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    flex: 1,
    marginRight: 8,
  },
  dishPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#009DE0',
    fontFamily: ROUNDED_FONT,
  },
  dishDescription: {
    fontSize: 12,
    fontFamily: ROUNDED_FONT,
    marginBottom: 4,
    lineHeight: 16,
  },
  dishRestaurantBadge: {
    fontSize: 11,
    color: '#009DE0',
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
});
