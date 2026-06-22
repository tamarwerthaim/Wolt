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
  Dimensions
} from 'react-native';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

export default function RestaurantDetailsScreen({ route, navigation }) {
  const { id } = route.params || {};

  // State hooks for managing API server data
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States for managing rating interactions
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingStatus, setRatingStatus] = useState('');

  // States for managing product details modal (Task 4.2.3)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);

  // Mock currentUser location for guest flow to calculate delivery times
  // In the future, this will be retrieved from the authentication state
  const mockUser = {
    id: 'guest_user_123',
    geolocation: { lat: 32.0853, lng: 34.7818 } // Standard Tel Aviv coordinates
  };

  // Fetch restaurant details and products from the server
  useEffect(() => {
    const fetchRestaurantAndProducts = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch general restaurant details
        const resResponse = await fetch(`${API_BASE_URL}/api/restaurants/${id}`);
        if (!resResponse.ok) {
          throw new Error('Failed to fetch restaurant details.');
        }
        const resData = await resResponse.json();
        setRestaurant(resData);

        // Sync rating if user has previously rated
        if (resData.ratings && resData.ratings[mockUser.id]) {
          setUserRating(resData.ratings[mockUser.id]);
        }

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
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantAndProducts();
    }
  }, [id]);

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
    try {
      setRatingStatus('Submitting rating...');
      
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer guest-simulated-token` 
        },
        body: JSON.stringify({ score })
      });

      // If unauthorized, simulate locally for guest UI purposes
      if (response.status === 401 || response.status === 403) {
        setTimeout(() => {
          setRatingStatus('Thank you for rating! (Simulated)');
          setUserRating(score);
          setRestaurant(prev => {
            const updatedRatings = { ...prev.ratings, [mockUser.id]: score };
            return { ...prev, ratings: updatedRatings };
          });
        }, 800);
        return;
      }

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
    setSelectedProduct(product);
    setTempQuantity(1);
    setIsModalOpen(true);

    // Call view-tracking API endpoint: GET /api/restaurants/:id/products/:productId
    // Passes user-id header to let backend log views inside recommendation engine
    try {
      await fetch(`${API_BASE_URL}/api/restaurants/${id}/products/${product.id || product._id}`, {
        headers: {
          'user-id': mockUser.id
        }
      });
      console.log(`Product view tracked successfully for: ${product.name}`);
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
    const distance = getDistance(
      mockUser.geolocation.lat,
      mockUser.geolocation.lng,
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

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: bannerUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Info Header Card */}
        <View style={styles.infoCard}>
          <Text style={styles.restaurantName}>{restaurant?.name || 'Restaurant'}</Text>
          
          <Text style={styles.restaurantLocation}>
            {restaurant?.geolocation
              ? `Coordinates: (${restaurant.geolocation.lat.toFixed(4)}, ${restaurant.geolocation.lng.toFixed(4)})`
              : 'Location unavailable'}
          </Text>

          {/* Pickup and Delivery Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🚴‍♂️ {deliveryStr}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🛍️ {pickupStr}</Text>
            </View>
          </View>

          {/* Ratings Component Card */}
          <View style={styles.ratingsCard}>
            <Text style={styles.ratingsCardTitle}>Rating & Reviews</Text>
            
            <View style={styles.ratingStatsRow}>
              <Text style={styles.averageRatingText}>{getAverageRating()}</Text>
              <View style={styles.ratingsCountContainer}>
                <Text style={styles.starIconLarge}>★</Text>
                <Text style={styles.ratingsCountText}>({getRatingsCount()} ratings)</Text>
              </View>
            </View>

            {/* Star Picker Row */}
            <View style={styles.starRatingRow}>
              <Text style={styles.rateUsLabel}>Tap to rate:</Text>
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
          <View style={styles.menuContainer}>
            <Text style={styles.menuSectionTitle}>The Entire Menu</Text>

            {products.length === 0 ? (
              <Text style={styles.emptyMenuText}>No items available on the menu yet.</Text>
            ) : (
              products.map((product) => (
                <TouchableOpacity
                  key={product.id || product._id}
                  style={styles.productCard}
                  activeOpacity={0.8}
                  onPress={() => handleProductPress(product)}
                >
                  {/* Left Side: Product Text Information */}
                  <View style={styles.productTextWrapper}>
                    <Text style={styles.productNameText}>{product.name}</Text>
                    <Text style={styles.productDescText} numberOfLines={2}>
                      {product.description || 'No description available for this delicious dish.'}
                    </Text>
                    <Text style={styles.productPriceText}>₪{Number(product.price).toFixed(2)}</Text>
                  </View>

                  {/* Right Side: Product Image & Quick Add Button */}
                  <View style={styles.productImageWrapper}>
                    <Image
                      source={{ uri: getFullImageUrl(product.image) }}
                      style={styles.productCardImage}
                    />
                    <TouchableOpacity
                      style={styles.quickAddButton}
                      activeOpacity={0.8}
                      onPress={() => handleProductPress(product)}
                    >
                      <Text style={styles.quickAddButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Product Detail Modal Popup overlay (Task 4.2.3) */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Modal Image */}
            <Image
              source={{ uri: getFullImageUrl(selectedProduct?.image) }}
              style={styles.modalImage}
              resizeMode="cover"
            />

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
              <Text style={styles.modalPriceText}>₪{Number(selectedProduct?.price).toFixed(2)}</Text>

              {selectedProduct?.description ? (
                <Text style={styles.modalDescription}>{selectedProduct?.description}</Text>
              ) : (
                <Text style={styles.modalDescription}>No description available for this delicious dish.</Text>
              )}

              {/* Quantity Selector & Checkout Action Footer */}
              <View style={styles.modalFooter}>
                <View style={styles.qtySelector}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setTempQuantity(q => Math.max(1, q - 1))}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{tempQuantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setTempQuantity(q => q + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => {
                    setIsModalOpen(false);
                    Alert.alert(
                      'Cart Updated',
                      `${tempQuantity}x ${selectedProduct?.name} added to cart! (Simulated)`
                    );
                  }}
                >
                  <Text style={styles.addToCartBtnText}>
                    Add to order • ₪{(selectedProduct?.price * tempQuantity).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
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
  restaurantName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  restaurantLocation: {
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
  },
  tagText: {
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
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginRight: 12,
  },
  starButton: {
    paddingHorizontal: 6,
  },
  starText: {
    fontSize: 28,
  },
  starActive: {
    color: '#ffc107',
  },
  starInactive: {
    color: '#d1d5db',
  },
  ratingStatusText: {
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
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 20,
  },
  emptyMenuText: {
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  productDescText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  productPriceText: {
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
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  modalPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#009DE0',
    marginBottom: 16,
  },
  modalDescription: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: -2,
  },
  qtyVal: {
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
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
