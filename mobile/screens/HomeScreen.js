import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Easing
} from 'react-native';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base64 decoder helper for JWT tokens
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

// Custom Views-based Shopping Bag Icon (Wolt outline + smile)
const ShoppingBagIcon = ({ isDarkMode }) => (
  <View style={styles.bagIconContainer}>
    <View style={styles.bagHandle} />
    <View style={styles.bagBody}>
      <View style={[
        styles.bagSmile,
        {
          borderColor: isDarkMode ? '#009DE0' : '#202124',
          borderLeftColor: isDarkMode ? '#009DE0' : '#202124',
          borderRightColor: isDarkMode ? '#009DE0' : '#202124',
          borderBottomColor: isDarkMode ? '#009DE0' : '#202124',
        }
      ]} />
    </View>
  </View>
);

// Custom Views-based Search Icon (Magnifying Glass + 3 Speed Lines)
const SearchIconWithLines = () => (
  <View style={styles.searchIconContainer}>
    <View style={styles.lens} />
    <View style={styles.handle} />
    <View style={styles.speedLinesContainer}>
      <View style={styles.speedLine} />
      <View style={styles.speedLine} />
      <View style={styles.speedLine} />
    </View>
  </View>
);

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load Dark Mode preference from AsyncStorage on mount/focus
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
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadDarkMode();
    });
    loadDarkMode();
    return unsubscribe;
  }, [navigation]);

  // Save Dark Mode preference when it changes
  const handleToggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('darkModeEnabled', String(newValue));
    } catch (e) {
      console.error('Error saving dark mode:', e);
    }
  };

  // Splash Overlay Screen States
  const [showSplash, setShowSplash] = useState(true);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Personalized Recommendations States
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'recommended'
  const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Loop scroll anim for infinite marquee carousel
  const scrollAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (restaurants.length === 0) return;

    const cardWidth = 154; // 140 width + 14 margin
    const totalWidth = restaurants.length * cardWidth;

    const startAnimation = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: -totalWidth,
        duration: restaurants.length * 4500, // Speed control: 4.5 seconds per restaurant card
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          startAnimation();
        }
      });
    };

    startAnimation();

    return () => {
      scrollAnim.stopAnimation();
    };
  }, [restaurants, scrollAnim]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      if (token) {
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
          }
        }
      } else {
        setUserDetails(null);
      }
    } catch (e) {
      console.error('Error checking login status:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
      setUserDetails(null);
      setRecommendedRestaurants([]); // Clear recommendations on logout
      setActiveTab('all'); // Reset tab view to all restaurants
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  // Trigger splash slide down and unmount after 3 seconds (2.5s display + 500ms slide)
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [slideAnim]);

  // Fetch recommendations whenever activeTab is set to recommended and user is logged in
  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setError('');
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoadingRecommendations(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/restaurants/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recommended restaurants');
      }
      const data = await response.json();
      setRecommendedRestaurants(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommended' && isLoggedIn) {
      fetchRecommendations();
    }
  }, [activeTab, isLoggedIn]);

  // Check login status on focus to react to successful login redirects
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
    });
    checkLoginStatus(); // Run initial check
    return unsubscribe;
  }, [navigation]);

  // Fetch all restaurants from the database on mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${API_BASE_URL}/api/restaurants`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants.');
        }
        const data = await response.json();
        setRestaurants(data);
      } catch (err) {
        setError(err.message || 'Could not load restaurants.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Theme styling configurations
  const containerBg = isDarkMode ? '#121212' : '#f3f4f6';
  const headerBg = isDarkMode ? '#000000' : '#ffffff';
  const cardBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#6b7280';
  const borderCol = isDarkMode ? '#2d2d2d' : '#e5e7eb';

  // Dynamic logos and profile images
  const headerLogoSource = isDarkMode 
    ? require('../assets/wolt-dark-logo.jpg') 
    : require('../assets/wolt-delivery1310.logowik.com.png');

  const profileAvatarUri = (isLoggedIn && userDetails && userDetails.profileImage)
    ? `${API_BASE_URL}/uploads/${userDetails.profileImage}`
    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#121212' : '#fff'} />
        <ActivityIndicator size="large" color="#009DE0" />
        <Text style={[styles.infoText, { color: subTextColor }]}>Loading Wolt Restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#121212' : '#fff'} />
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError('');
            fetch(`${API_BASE_URL}/api/restaurants`)
              .then(res => res.json())
              .then(data => {
                setRestaurants(data);
                setLoading(false);
              })
              .catch(err => {
                setError(err.message);
                setLoading(false);
              });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCarousel = () => {
    if (restaurants.length === 0) return null;

    // Double the restaurants list to create a flawless infinite scroll marquee look
    const doubleRestaurants = [...restaurants, ...restaurants];

    return (
      <View style={styles.carouselSection}>
        <View style={styles.carouselContainer}>
          <Animated.View
            style={[
              styles.carouselTrack,
              {
                transform: [{ translateX: scrollAnim }],
                width: restaurants.length * 2 * 154,
              },
            ]}
          >
            {doubleRestaurants.map((restaurant, index) => {
              const imageUrl = restaurant.image
                ? `${API_BASE_URL}${restaurant.image}`
                : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg';

              return (
                <TouchableOpacity
                  key={`carousel-${restaurant.id}-${index}`}
                  style={[styles.carouselCard, { backgroundColor: cardBg }]}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('RestaurantDetails', { id: restaurant.id })}
                >
                  <Image source={{ uri: imageUrl }} style={styles.carouselCardImage} />
                  <View style={styles.carouselCardInfo}>
                    <Text style={[styles.carouselCardName, { color: textColor }]} numberOfLines={1}>
                      {restaurant.name}
                    </Text>
                    <Text style={styles.carouselCardDist} numberOfLines={1}>
                      🛵 {restaurant.prepTime + 15} min
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>

        {/* Floating plus button for admins */}
        {isLoggedIn && userDetails?.isAdmin && (
          <TouchableOpacity
            style={styles.addRestaurantFab}
            onPress={() => navigation.navigate('AddRestaurant')}
            activeOpacity={0.8}
          >
            <Text style={styles.addRestaurantFabText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />
      
      {/* Custom Sticky Header */}
      <View style={[styles.customHeader, { backgroundColor: headerBg, borderBottomColor: borderCol }]}>
        <Image 
          source={headerLogoSource} 
          style={styles.headerLogo} 
          resizeMode="contain" 
        />
        <TouchableOpacity 
          style={styles.profileBtn}
          onPress={() => setShowProfileMenu(!showProfileMenu)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: profileAvatarUri }} 
            style={styles.profileAvatar} 
          />
        </TouchableOpacity>
      </View>

      {/* Floating Dropdown Card Overlay */}
      {showProfileMenu && (
        <View style={[styles.profileDropdown, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.dropdownHeader}>
            <Text style={[styles.dropdownTitle, { color: textColor }]}>User Profile</Text>
            <TouchableOpacity onPress={() => setShowProfileMenu(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✖</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dropdownContent}>
            {isLoggedIn && userDetails ? (
              <View style={styles.dropdownSection}>
                <View style={styles.userProfileMeta}>
                  <Image source={{ uri: profileAvatarUri }} style={styles.dropdownUserAvatar} />
                  <View style={styles.dropdownUserTextWrapper}>
                    <Text style={[styles.welcomeUserText, { color: textColor }]}>{userDetails.name}</Text>
                    <Text style={[styles.usernameText, { color: subTextColor }]}>@{userDetails.username}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsList}>
                  <Text style={[styles.detailItemText, { color: textColor }]}>📞 Phone: {userDetails.phone}</Text>
                  <Text style={[styles.detailItemText, { color: textColor }]}>📍 Coords: {userDetails.lat}, {userDetails.lng}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.logoutBtn} 
                  onPress={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutBtnText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dropdownSection}>
                <Text style={[styles.guestText, { color: subTextColor }]}>Hello, Guest! Log in to place orders.</Text>
                <TouchableOpacity 
                  style={styles.loginBtn}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Login');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginBtnText}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={[styles.divider, { backgroundColor: borderCol }]} />
            
            {/* Theme Switch Row */}
            <View style={styles.themeRow}>
              <Text style={[styles.themeLabel, { color: textColor }]}>
                {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Text>
              <TouchableOpacity 
                style={[styles.themeToggleBtn, isDarkMode && styles.themeToggleBtnActive]}
                onPress={handleToggleDarkMode}
                activeOpacity={0.8}
              >
                <View style={[styles.themeToggleCircle, isDarkMode && styles.themeToggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Horizontal Restaurant Carousel highlight */}
      {renderCarousel()}

      {/* Main Content Layout */}
      {/* Tab Switcher */}
      <View style={[styles.tabsContainer, { borderBottomColor: borderCol }]}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'all' && styles.activeTabButton]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'all' ? styles.activeTabButtonText : styles.inactiveTabButtonText
          ]}>
            All Restaurants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'recommended' && styles.activeTabButton]}
          onPress={() => setActiveTab('recommended')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'recommended' ? styles.activeTabButtonText : styles.inactiveTabButtonText
          ]}>
            Especially for You
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render tab contents based on selected tab */}
      {activeTab === 'all' ? (
        restaurants.length === 0 ? (
          <Text style={[styles.emptyText, { color: subTextColor }]}>No restaurants found.</Text>
        ) : (
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const imageUrl = item.image
                ? `${API_BASE_URL}${item.image}`
                : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg';

              return (
                <TouchableOpacity
                  style={[styles.restaurantCard, { backgroundColor: cardBg }]}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('RestaurantDetails', { id: item.id })}
                >
                  <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: textColor }]}>{item.name}</Text>
                    <Text style={[styles.cardPrep, { color: subTextColor }]}>🛵 Delivery in {item.prepTime + 15} min</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : (
        recommendedRestaurants.length === 0 ? (
          <Text style={[styles.emptyText, { color: subTextColor }]}>No recommendations found.</Text>
        ) : (
          <FlatList
            data={recommendedRestaurants}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const imageUrl = item.image
                ? `${API_BASE_URL}${item.image}`
                : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg';

              return (
                <TouchableOpacity
                  style={[styles.restaurantCard, { backgroundColor: cardBg }]}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('RestaurantDetails', { id: item.id })}
                >
                  <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: textColor }]}>{item.name}</Text>
                    <Text style={[styles.cardPrep, { color: subTextColor }]}>🛵 Delivery in {item.prepTime + 15} min</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )
      )}

      {/* Floating Action Buttons (Cart & Search) at the bottom */}
      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity 
          style={[styles.floatingCartBtn, { backgroundColor: isDarkMode ? '#009DE0' : '#202124' }]} 
          activeOpacity={0.85}
        >
          <ShoppingBagIcon isDarkMode={isDarkMode} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.floatingSearchBtn, { backgroundColor: isDarkMode ? '#009DE0' : '#202124' }]} 
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.floatingSearchText}>Search</Text>
          <SearchIconWithLines />
        </TouchableOpacity>
      </View>

      {showSplash && (
        <Animated.View style={[styles.splashOverlay, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.splashTextLine1}>WHAT IS YOUR</Text>
          <Text style={styles.splashTextLine2}>DUDA?</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#009DE0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 100,
  },
  headerLogo: {
    width: 75,
    height: 28,
  },
  profileBtn: {
    padding: 2,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
  },
  profileDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 95 : 75,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dropdownContent: {
    alignItems: 'stretch',
  },
  dropdownSection: {
    marginBottom: 8,
  },
  userProfileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    marginRight: 10,
  },
  dropdownUserTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeUserText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  usernameText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  detailsList: {
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 8,
  },
  detailItemText: {
    fontSize: 12.5,
    fontWeight: '600',
    marginVertical: 3,
    fontFamily: ROUNDED_FONT,
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  guestText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
    marginBottom: 10,
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: '#009DE0',
    borderRadius: 20,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  themeToggleBtn: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    padding: 2,
    justifyContent: 'center',
  },
  themeToggleBtnActive: {
    backgroundColor: '#009DE0',
  },
  themeToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  themeToggleCircleActive: {
    alignSelf: 'flex-end',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90, // extra padding so list item isn't covered by floating bottom buttons
  },
  restaurantCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardInfo: {
    padding: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardPrep: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  floatingCartBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#202124',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginRight: 12,
  },
  floatingCartIcon: {
    fontSize: 20,
    color: '#fff',
  },
  floatingSearchBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#202124',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingSearchIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  floatingSearchText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
    marginRight: 8,
  },
  // Custom Shopping Bag Icon Styles
  bagIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagHandle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 1,
  },
  bagBody: {
    width: 20,
    height: 14,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    position: 'absolute',
    bottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bagSmile: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#202124',
    backgroundColor: 'transparent',
    marginTop: -5,
    borderTopColor: 'transparent',
    borderLeftColor: '#202124',
    borderRightColor: '#202124',
    borderBottomColor: '#202124',
  },
  // Custom Search Icon Styles
  searchIconContainer: {
    width: 32,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lens: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 2,
    top: 4,
  },
  handle: {
    width: 2,
    height: 6,
    backgroundColor: '#ffffff',
    position: 'absolute',
    left: 1,
    bottom: 2,
    transform: [{ rotate: '45deg' }],
  },
  speedLinesContainer: {
    position: 'absolute',
    right: 2,
    height: 10,
    justifyContent: 'space-between',
    width: 8,
  },
  speedLine: {
    height: 2,
    width: 8,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  // Recommendation Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#009DE0',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  activeTabButtonText: {
    color: '#009DE0',
  },
  inactiveTabButtonText: {
    color: '#9ca3af',
  },
  // Guest and Empty States Styles
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  guestLoginBtn: {
    backgroundColor: '#009DE0',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guestLoginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Local Slide Splash Styles
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#009DE0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashTextLine1: {
    fontFamily: ROUNDED_FONT,
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  splashTextLine2: {
    fontFamily: ROUNDED_FONT,
    fontSize: 90,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  // Carousel Highlights Styles
  carouselSection: {
    position: 'relative',
    width: '100%',
    marginVertical: 10,
  },
  carouselContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  carouselTrack: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  carouselCard: {
    width: 140,
    borderRadius: 14,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  carouselCardImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#e5e7eb',
  },
  carouselCardInfo: {
    padding: 10,
  },
  carouselCardName: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  carouselCardDist: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: 3,
    fontFamily: ROUNDED_FONT,
  },
  addRestaurantFab: {
    position: 'absolute',
    left: 10,
    top: '38%',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addRestaurantFabText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});
