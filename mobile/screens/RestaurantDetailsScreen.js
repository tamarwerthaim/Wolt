import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  StatusBar,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import { useCart } from '../context/CartContext';
import CartModal from '../components/CartModal';
import ProductCard from '../components/ProductCard';

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

const { width } = Dimensions.get('window');

export default function RestaurantDetailsScreen({ route, navigation }) {
  const { id } = route.params || {};
  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    restaurantName: cartRestaurantName,
    restaurantId,
    cartCount,
    cartTotal
  } = useCart();

  const scrollY = React.useRef(new Animated.Value(0)).current;

  // State hooks for managing API server data
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Current user authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // States for managing rating interactions
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingStatus, setRatingStatus] = useState('');

  // States for managing product details modal (Task 4.2.3)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]);

  // States for managing Cart Modal and Theme
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch product-specific recommendations based on co-view logic
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isModalOpen || !selectedProduct) {
        setRecommendations([]);
        return;
      }
      try {
        const prodId = selectedProduct.id || selectedProduct._id;
        const token = await AsyncStorage.getItem('userToken');
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/restaurants/${id}/products/${prodId}/recommendations`, {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.warn('Error fetching product recommendations:', err);
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [isModalOpen, selectedProduct, id]);

  // Update user rating state when restaurant data or currentUser updates
  useEffect(() => {
    if (currentUser && restaurant && restaurant.ratings && typeof restaurant.ratings === 'object' && !Array.isArray(restaurant.ratings)) {
      const existingUserRating = restaurant.ratings[currentUser.id];
      if (existingUserRating) {
        setUserRating(existingUserRating);
      } else {
        setUserRating(0);
      }
    } else {
      setUserRating(0);
    }
  }, [restaurant, currentUser]);



  // Mock currentUser location for guest flow to calculate delivery times
  // In the future, this will be retrieved from the authentication state
  const mockUser = {
    id: 'guest_user_123',
    geolocation: { lat: 32.0853, lng: 34.7818 } // Standard Tel Aviv coordinates
  };

  // Fetch restaurant details and products from the server
  const fetchRestaurantAndProducts = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      setError('');

      // 1. Fetch general restaurant details
      const resResponse = await fetch(`${API_BASE_URL}/api/restaurants/${id}`);
      if (!resResponse.ok) {
        throw new Error('Failed to fetch restaurant details.');
      }
      const resData = await resResponse.json();
      setRestaurant(resData);

      // 2. Fetch all products (menu) for this restaurant
      const prodResponse = await fetch(`${API_BASE_URL}/api/restaurants/${id}/products`);
      if (!prodResponse.ok) {
        throw new Error('Failed to fetch menu products.');
      }
      const prodData = await prodResponse.json();
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurantAndProducts(true);
    }
  }, [id]);

  // Refresh data and load auth status on screen focus
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const payload = decodeJwt(token);
          setCurrentUser(payload);

          const profileRes = await fetch(`${API_BASE_URL}/api/users/${payload.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (profileRes.ok) {
            const data = await profileRes.json();
            setUserDetails(data);
          } else {
            setUserDetails(null);
          }
        } else {
          setCurrentUser(null);
          setUserDetails(null);
        }
      } catch (e) {
        console.error('Error checking login status:', e);
      }
    };

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
      checkLoginStatus();
      loadDarkMode();
      if (id) {
        fetchRestaurantAndProducts(false); // silently refresh menu on focus
      }
    });

    checkLoginStatus();
    loadDarkMode();
    return unsubscribe;
  }, [navigation, id]);

  // Calculate average rating score from the ratings dictionary
  const getAverageRating = () => {
    if (!restaurant || !restaurant.ratings) return '—';
    const scores = typeof restaurant.ratings === 'object' && !Array.isArray(restaurant.ratings)
      ? Object.values(restaurant.ratings)
      : restaurant.ratings;

    if (!scores || scores.length === 0) return '—';
    const sum = scores.reduce((total, score) => total + score, 0);
    return (sum / scores.length).toFixed(1);
  };

  // Get total number of ratings
  const getRatingsCount = () => {
    if (!restaurant || !restaurant.ratings) return 0;
    return typeof restaurant.ratings === 'object' && !Array.isArray(restaurant.ratings)
      ? Object.keys(restaurant.ratings).length
      : restaurant.ratings.length;
  };

  // Submit star rating to the backend
  const handleRate = async (score) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!currentUser || !token) {
      Alert.alert(
        'Login Required',
        'Please log in to rate this restaurant.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      setRatingStatus('Submitting rating...');

      const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      setRatingStatus('Thank you for rating!');
      setUserRating(score);

      // Refresh restaurant details to sync scores
      const resResponse = await fetch(`${API_BASE_URL}/api/restaurants/${id}`);
      if (resResponse.ok) {
        const resData = await resResponse.json();
        setRestaurant(resData);
      }
    } catch (err) {
      setRatingStatus(err.message || 'Error submitting rating.');
    }
  };

  // Open product details modal and send product view-track signal to backend (Task 4.2.3)
  const handleProductPress = async (product) => {
    const prodId = product.id || product._id;
    const cartItem = cartItems.find(item => item.productId === prodId);
    const currentQty = cartItem ? cartItem.quantity : 0;
    setSelectedProduct(product);
    setTempQuantity(currentQty > 0 ? currentQty : 1);
    setIsModalOpen(true);

    // Call view-tracking API endpoint: GET /api/restaurants/:id/products/:productId
    // Passes user-id header to let backend log views inside recommendation engine
    try {
      await fetch(`${API_BASE_URL}/api/restaurants/${id}/products/${product.id || product._id}`, {
        headers: {
          'user-id': currentUser ? currentUser.id : mockUser.id
        }
      });
    } catch (err) {
      console.warn('Could not register product view track:', err);
    }
  };

  // Straight-line distance calculation (in kilometers) between two coordinates
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

  // Compute delivery and pickup times
  const prepTime = restaurant?.prepTime || 15;
  const pickupStr = `Pickup ${prepTime}-${prepTime + 5} min`;

  let deliveryStr = 'Delivery 30-40 min';
  if (restaurant?.geolocation) {
    const userLat = userDetails?.geolocation?.lat !== undefined ? userDetails.geolocation.lat : mockUser.geolocation.lat;
    const userLng = userDetails?.geolocation?.lng !== undefined ? userDetails.geolocation.lng : mockUser.geolocation.lng;

    const distance = getDistance(
      userLat,
      userLng,
      restaurant.geolocation.lat,
      restaurant.geolocation.lng
    );
    if (distance !== null) {
      const travelTime = Math.round(distance * 3);
      const deliveryTime = travelTime + prepTime;
      deliveryStr = `Delivery ${deliveryTime}-${deliveryTime + 5} min`;
    }
  }

  // Get full image paths
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
    }
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#009DE0" />
        <Text style={styles.loadingText}>Loading restaurant profile & menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bannerUrl = restaurant?.image
    ? `${API_BASE_URL}${restaurant.image}`
    : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg';

  const showCartBar = cartCount > 0;

  const themeScreenBg = isDarkMode ? '#121212' : '#f3f4f6';
  const themeCardBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const themeTextColor = isDarkMode ? '#ffffff' : '#1f2937';
  const themeSubTextColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const themeBorderColor = isDarkMode ? '#2d2d2d' : '#f3f4f6';
  const themeRatingsCardBg = isDarkMode ? '#242424' : '#f9fafb';

  return (
    <View style={[styles.container, { backgroundColor: themeScreenBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#121212' : '#f3f4f6'} />

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, showCartBar && { paddingBottom: 110 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Animated.Image
            source={{ uri: bannerUrl }}
            style={[
              styles.bannerImage,
              {
                transform: [
                  {
                    scale: scrollY.interpolate({
                      inputRange: [-200, 0, 200],
                      outputRange: [1.5, 1, 0.85],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [-200, 0, 200],
                      outputRange: [0, 0, 80],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Info Header Card */}
        <View style={[styles.infoCard, { backgroundColor: themeCardBg }]}>
          <View style={styles.restaurantHeaderRow}>
            <Text style={[styles.restaurantName, { color: themeTextColor }]}>{restaurant?.name || 'Restaurant'}</Text>
            {currentUser?.isAdmin && restaurant?.ownerId === currentUser.id && (
              <TouchableOpacity
                style={styles.editRestaurantBtn}
                onPress={() => navigation.navigate('EditRestaurant', { restaurantId: id })}
                activeOpacity={0.8}
              >
                <Text style={styles.editRestaurantBtnText}>✎</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.restaurantLocation, { color: themeSubTextColor }]}>
            📍 {restaurant?.geolocation
              ? `Location: (${restaurant.geolocation.lat.toFixed(4)}, ${restaurant.geolocation.lng.toFixed(4)})`
              : 'Location unavailable'}
          </Text>

          {/* Pickup and Delivery Tags */}
          {currentUser && (
            <View style={styles.tagsRow}>
              <View style={[styles.tag, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f3f4f6' }]}>
                <Image source={require('../assets/Bike.png')} style={styles.tagImage} resizeMode="contain" />
                <Text style={[styles.tagText, { color: themeSubTextColor }]}>{deliveryStr}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f3f4f6' }]}>
                <Image source={require('../assets/bag.png')} style={styles.tagImage} resizeMode="contain" />
                <Text style={[styles.tagText, { color: themeSubTextColor }]}>{pickupStr}</Text>
              </View>
            </View>
          )}

          {/* Ratings Component Card */}
          <View style={[styles.ratingsCard, { backgroundColor: themeRatingsCardBg, borderColor: themeBorderColor }]}>
            <Text style={[styles.ratingsCardTitle, { color: themeTextColor }]}>Rating</Text>

            <View style={styles.ratingStatsRow}>
              <Text style={styles.averageRatingText}>{getAverageRating()}</Text>
              <View style={styles.ratingsCountContainer}>
                <Text style={styles.starIconLarge}>★</Text>
                <Text style={[styles.ratingsCountText, { color: themeSubTextColor }]}>({getRatingsCount()} ratings)</Text>
              </View>
            </View>

            {/* Star Picker Row */}
            <View style={styles.starRatingRow}>
              <Text style={[styles.rateUsLabel, { color: themeSubTextColor }]}>Tap to rate:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRate(star)}
                  onPressIn={() => setHoverRating(star)}
                  onPressOut={() => setHoverRating(0)}
                  style={styles.starButton}
                >
                  <Text style={[
                    styles.starText,
                    star <= (hoverRating || userRating) ? styles.starActive : styles.starInactive
                  ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {ratingStatus ? (
              <Text style={styles.ratingStatusText}>{ratingStatus}</Text>
            ) : null}
          </View>

          {/* Menu Products Section (Task 4.2.2) */}
          <View style={[styles.menuContainer, { borderTopColor: themeBorderColor }]}>
            <View style={styles.menuHeaderRow}>
              <Text style={[styles.menuSectionTitle, { color: themeTextColor }]}>The Entire Menu</Text>
              {currentUser?.isAdmin && restaurant?.ownerId === currentUser.id && (
                <TouchableOpacity
                  style={styles.addProductBtn}
                  onPress={() => navigation.navigate('AddProduct', { restaurantId: id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addProductBtnText}>+</Text>
                </TouchableOpacity>
              )}
            </View>

            {products.length === 0 ? (
              <Text style={[styles.emptyMenuText, { color: themeSubTextColor }]}>No items available on the menu yet.</Text>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  restaurant={restaurant}
                  currentUser={currentUser}
                  cartItems={cartItems}
                  cartRestaurantName={cartRestaurantName}
                  addToCart={addToCart}
                  isDarkMode={isDarkMode}
                  onPress={() => handleProductPress(product)}
                  navigation={navigation}
                />
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom Cart Bar */}
      {showCartBar && (
        <TouchableOpacity
          style={styles.stickyCartBar}
          activeOpacity={0.9}
          onPress={() => setIsCartOpen(true)}
        >
          <View style={styles.stickyCartLeftGroup}>
            <View style={styles.stickyCartBadge}>
              <Text style={styles.stickyCartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.stickyCartText}>Show Cart</Text>
          </View>
          <Text style={styles.stickyCartPrice}>₪{cartTotal.toFixed(2)}</Text>
        </TouchableOpacity>
      )}

      {/* Cart Drawer Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        isDarkMode={isDarkMode}
        navigation={navigation}
      />

      {/* Product Detail Modal Popup overlay (Task 4.2.3) */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: themeCardBg }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Scrollable Modal Content */}
            <ScrollView
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              alwaysBounceVertical={true}
              overScrollMode="always"
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                if (offsetY < -60) {
                  setIsModalOpen(false);
                }
              }}
              scrollEventThrottle={16}
            >
              {/* Modal Image */}
              <Image
                source={{ uri: getFullImageUrl(selectedProduct?.image) }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              <View style={styles.modalBody}>
                <Text style={[styles.modalTitle, { color: themeTextColor }]}>{selectedProduct?.name}</Text>
                <Text style={styles.modalPriceText}>₪{Number(selectedProduct?.price).toFixed(2)}</Text>

                {selectedProduct?.description ? (
                  <Text style={[styles.modalDescription, { color: themeSubTextColor }]}>{selectedProduct?.description}</Text>
                ) : (
                  <Text style={[styles.modalDescription, { color: themeSubTextColor }]}>No description available for this delicious dish.</Text>
                )}

                {/* Quantity Selector & Checkout Action Footer */}
                <View style={[styles.modalFooter, { borderTopColor: themeBorderColor }]}>
                  <View style={[styles.qtySelector, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f3f4f6' }]}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
                      onPress={() => setTempQuantity(q => Math.max(0, q - 1))}
                    >
                      <Text style={[styles.qtyBtnText, { color: themeTextColor }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyVal, { color: themeTextColor }]}>{tempQuantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
                      onPress={() => setTempQuantity(q => q + 1)}
                    >
                      <Text style={[styles.qtyBtnText, { color: themeTextColor }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={tempQuantity === 0 ? styles.removeFromCartBtn : styles.addToCartBtn}
                    onPress={async () => {
                      const token = await AsyncStorage.getItem('userToken');
                      if (!token) {
                        setIsModalOpen(false);
                        Alert.alert(
                          'Login Required',
                          'Please log in to add items to your cart.',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Log In',
                              onPress: () => navigation.navigate('Login'),
                            },
                          ]
                        );
                        return;
                      }

                      const prodId = selectedProduct?.id || selectedProduct?._id;
                      const cartItem = cartItems.find(item => item.productId === prodId);
                      const currentQty = cartItem ? cartItem.quantity : 0;
                      const currentRestaurantName = restaurant?.name || 'Restaurant';

                      if (tempQuantity === 0) {
                        for (let i = 0; i < currentQty; i++) {
                          removeFromCart(prodId);
                        }
                        setIsModalOpen(false);
                        // No alert
                      } else {
                        const diff = tempQuantity - currentQty;
                        if (diff > 0) {
                          const added = addToCart(selectedProduct, id, currentRestaurantName, diff);
                          if (added) {
                            setIsModalOpen(false);
                            // No alert
                          } else {
                            Alert.alert(
                              'Create a new cart?',
                              `Your cart contains items from "${cartRestaurantName || 'another restaurant'}". Do you want to clear your cart and start a new one from "${currentRestaurantName}"?`,
                              [
                                {
                                  text: 'Cancel',
                                  style: 'cancel',
                                },
                                {
                                  text: 'Create New Cart',
                                  onPress: () => {
                                    addToCart(selectedProduct, id, currentRestaurantName, diff, true);
                                    setIsModalOpen(false);
                                    // No alert
                                  },
                                },
                              ]
                            );
                          }
                        } else if (diff < 0) {
                          for (let i = 0; i < Math.abs(diff); i++) {
                            removeFromCart(prodId);
                          }
                          setIsModalOpen(false);
                          // No alert
                        } else {
                          setIsModalOpen(false);
                        }
                      }
                    }}
                  >
                    <Text style={styles.addToCartBtnText}>
                      {tempQuantity === 0
                        ? 'Remove from order'
                        : `Add to order • ₪${(selectedProduct?.price * tempQuantity).toFixed(2)}`}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                  <View style={[styles.recommendationsSection, { borderTopColor: themeBorderColor }]}>
                    <Text style={[styles.recommendationsTitle, { color: themeTextColor }]}>Maybe you want:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.recommendationsScroll}
                    >
                      {recommendations.map(item => (
                        <TouchableOpacity
                          key={item.id || item._id}
                          style={[styles.recCard, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb', borderColor: themeBorderColor }]}
                          onPress={async () => {
                            setSelectedProduct(item);
                            const cartItem = cartItems.find(c => c.productId === (item.id || item._id));
                            setTempQuantity(cartItem ? cartItem.quantity : 1);
                            
                            // Log product view track
                            try {
                              await fetch(`${API_BASE_URL}/api/restaurants/${id}/products/${item.id || item._id}`, {
                                headers: {
                                  'user-id': currentUser ? currentUser.id : mockUser.id
                                }
                              });
                            } catch (err) {
                              console.warn('Could not register product view track:', err);
                            }
                          }}
                        >
                          <Image source={{ uri: getFullImageUrl(item.image) }} style={styles.recCardImage} />
                          <Text style={[styles.recCardName, { color: themeTextColor }]} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.recCardPrice}>₪{Number(item.price).toFixed(2)}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    fontFamily: ROUNDED_FONT,
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  errorText: {
    fontFamily: ROUNDED_FONT,
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
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: -2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginTop: -30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  restaurantHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  restaurantName: {
    fontFamily: ROUNDED_FONT,
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  editRestaurantBtn: {
    backgroundColor: '#009DE0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editRestaurantBtnText: {
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  restaurantLocation: {
    fontFamily: ROUNDED_FONT,
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagImage: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  tagText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  ratingsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 28,
  },
  ratingsCardTitle: {
    fontFamily: ROUNDED_FONT,
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  ratingStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  averageRatingText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 48,
    fontWeight: '800',
    color: '#009DE0',
    marginRight: 16,
  },
  ratingsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconLarge: {
    fontSize: 20,
    color: '#ffc107',
    marginRight: 4,
    marginTop: -2,
  },
  ratingsCountText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  rateUsLabel: {
    fontFamily: ROUNDED_FONT,
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginRight: 12,
  },
  starButton: {
    paddingHorizontal: 6,
  },
  starText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 28,
  },
  starActive: {
    color: '#ffc107',
  },
  starInactive: {
    color: '#d1d5db',
  },
  ratingStatusText: {
    fontFamily: ROUNDED_FONT,
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'center',
  },
  menuContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 24,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontFamily: ROUNDED_FONT,
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 0,
  },
  addProductBtn: {
    backgroundColor: '#009DE0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addProductBtnText: {
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  emptyMenuText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  productTextWrapper: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'space-between',
  },
  productNameText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  editProductBadge: {
    backgroundColor: '#009DE0',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editProductBadgeText: {
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productDescText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  productPriceText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  productImageWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  productCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickAddButtonText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009DE0',
    marginTop: -2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalCloseButtonText: {
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: 240,
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    fontFamily: ROUNDED_FONT,
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  modalPriceText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 18,
    fontWeight: '700',
    color: '#009DE0',
    marginBottom: 16,
  },
  modalDescription: {
    fontFamily: ROUNDED_FONT,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 28,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 6,
    marginRight: 16,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtnText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: -2,
  },
  qtyVal: {
    fontFamily: ROUNDED_FONT,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 16,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#009DE0',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtnText: {
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  removeFromCartBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageQuantityBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#009DE0',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
    zIndex: 2,
  },
  imageQuantityBadgeText: {
    fontFamily: ROUNDED_FONT,
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  stickyCartBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#009DE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 900,
  },
  stickyCartLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyCartPrice: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  stickyCartText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 12,
    fontFamily: ROUNDED_FONT,
  },
  stickyCartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#092233',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyCartBadgeText: {
    color: '#009DE0',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  recommendationsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  recommendationsTitle: {
    fontFamily: ROUNDED_FONT,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  recommendationsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  recCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  recCardImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  recCardName: {
    fontFamily: ROUNDED_FONT,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
  },
  recCardPrice: {
    fontFamily: ROUNDED_FONT,
    fontSize: 13,
    fontWeight: '800',
    color: '#009DE0',
  },
});
