import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import { useCart } from '../context/CartContext';

export default function OrderHistoryScreen({ navigation }) {
  const { loadOrderIntoCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [restaurantsMap, setRestaurantsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');

  // Load Dark Mode setting to match Home screen styling
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const darkModeVal = await AsyncStorage.getItem('darkModeEnabled');
        if (darkModeVal !== null) {
          setIsDarkMode(darkModeVal === 'true');
        }

        // Try decoding username from userToken if available
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.name) {
            setUserName(payload.name);
          } else if (payload && payload.username) {
            setUserName(payload.username);
          }
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };
    loadSettings();
  }, []);

  // JWT Decoder Helper
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
      return null;
    }
  };

  const customAtob = (input = '') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
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

  // Fetch Order History and Restaurants Map
  const fetchOrderHistory = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Fetch user orders
      const ordersRes = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!ordersRes.ok) {
        throw new Error('Failed to fetch order history.');
      }

      const ordersData = await ordersRes.json();
      const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);

      // 2. Fetch all restaurants for name & logo mapping
      const restRes = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (restRes.ok) {
        const restData = await restRes.json();
        const rMap = {};
        restData.forEach(r => {
          rMap[r.id] = r;
        });
        setRestaurantsMap(rMap);
      }
    } catch (err) {
      console.error('Error loading order history:', err);
      setError(err.message || 'Something went wrong while loading orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  // Cancel/Delete order handler
  const handleDeleteOrder = async (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            try {
              setIsDeleting(true);
              const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (res.ok) {
                setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
                setSelectedOrder(null);
                Alert.alert('Success', 'Order cancelled successfully.');
              } else {
                const errData = await res.json().catch(() => ({}));
                Alert.alert('Error', errData.error || 'Failed to cancel the order.');
              }
            } catch (err) {
              console.error('Error deleting order:', err);
              Alert.alert('Error', 'A network error occurred.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // Load past order items into cart for re-ordering or editing
  const handleEditOrder = async (order) => {
    try {
      setIsLoadingEdit(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/restaurants/${order.restaurantId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let productsMap = {};
      if (res.ok) {
        const products = await res.json();
        products.forEach(p => {
          productsMap[p.id || p._id] = p;
        });
      }

      const rName = restaurantsMap[order.restaurantId]?.name || 'Restaurant';
      loadOrderIntoCart(order, rName, productsMap);
      setSelectedOrder(null);
      
      // Navigate to RestaurantDetails to let them edit/add
      navigation.navigate('RestaurantDetails', { id: order.restaurantId });
    } catch (err) {
      console.error('Error preparing edit:', err);
      Alert.alert('Error', 'Could not edit the order. Please try again.');
    } finally {
      setIsLoadingEdit(false);
    }
  };

  // Helpers
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#eab308'; // Amber
      case 'delivered':
      case 'completed':
        return '#10b981'; // Green
      case 'cancelled':
        return '#ef4444'; // Red
      default:
        return '#009DE0';
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg';
    }
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };

  // Dark Mode colors mapping
  const containerBg = isDarkMode ? '#121212' : '#f3f4f6';
  const cardBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const headerBg = isDarkMode ? '#000000' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#6b7280';
  const borderCol = isDarkMode ? '#2d2d2d' : '#e5e7eb';
  const detailsBg = isDarkMode ? '#252525' : '#f9fafb';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />

      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderCol }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Greeting Banner */}
      {!loading && !error && userName !== '' && (
        <View style={[styles.welcomeBanner, { borderBottomColor: borderCol }]}>
          <Text style={[styles.welcomeText, { color: textColor }]}>
            Welcome back, <Text style={{ fontWeight: '800', color: '#009DE0' }}>{userName}</Text>!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: subTextColor }]}>Here is your order history:</Text>
        </View>
      )}

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#009DE0" />
          <Text style={[styles.loadingText, { color: subTextColor }]}>🚴‍♂️ Loading your order history...</Text>
        </View>
      )}

      {!loading && error !== '' && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={[styles.emptyTitle, { color: textColor }]}>No orders placed yet!</Text>
          <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
            Hungry? Explore our premium restaurants and place your first order now.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreBtnText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List of Orders */}
      {!loading && !error && orders.length > 0 && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const restaurant = restaurantsMap[item.restaurantId];
            const orderDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const orderTime = new Date(item.createdAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            });

            // Calculate total price of order
            const orderTotal = item.items.reduce((sum, orderItem) => {
              return sum + (orderItem.price * orderItem.quantity);
            }, 0);

            // Preview text of items
            const itemsPreview = item.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

            return (
              <TouchableOpacity
                style={[styles.orderCard, { backgroundColor: cardBg, borderColor: borderCol }]}
                activeOpacity={0.9}
                onPress={() => setSelectedOrder(item)}
              >
                {/* Header: Restaurant name, image, and date */}
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: getFullImageUrl(restaurant?.image) }}
                    style={styles.restaurantImg}
                  />
                  <View style={styles.restaurantInfo}>
                    <Text style={[styles.restaurantName, { color: textColor }]} numberOfLines={1}>
                      {restaurant?.name || 'Premium Restaurant'}
                    </Text>
                    <Text style={[styles.orderTimestamp, { color: subTextColor }]}>
                      {orderDate} at {orderTime}
                    </Text>
                  </View>
                </View>

                {/* Body: Reference and Preview */}
                <View style={[styles.cardBody, { borderTopColor: borderCol, borderBottomColor: borderCol }]}>
                  <View style={styles.refRow}>
                    <Text style={[styles.refLabel, { color: subTextColor }]}>Reference:</Text>
                    <Text style={[styles.refCode, { color: textColor }]}>#{item.id.slice(0, 8)}</Text>
                  </View>
                  <Text style={[styles.itemsPreviewText, { color: subTextColor }]} numberOfLines={1}>
                    {itemsPreview}
                  </Text>
                </View>

                {/* Footer: total cost */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.totalLabel, { color: textColor }]}>Total Paid</Text>
                  <Text style={[styles.totalValue, { color: textColor }]}>₪{orderTotal.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <Modal
          visible={!!selectedOrder}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectedOrder(null)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedOrder(null)}
          >
            <TouchableOpacity
              style={[styles.modalContent, { backgroundColor: cardBg }]}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedOrder(null)}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>

              {/* Title */}
              <Text style={[styles.modalTitle, { color: textColor }]}>Order Details</Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {(() => {
                  const restaurant = restaurantsMap[selectedOrder.restaurantId];
                  const orderDate = new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const orderTime = new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const orderTotal = selectedOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

                  return (
                    <View style={{ marginTop: 12 }}>
                      {/* Restaurant Summary */}
                      <View style={styles.modalResSection}>
                        <Text style={[styles.modalResName, { color: textColor }]}>
                          {restaurant?.name || 'Premium Restaurant'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <Text style={[styles.modalTimestamp, { color: subTextColor }]}>
                            {orderDate} at {orderTime}
                          </Text>
                        </View>
                      </View>

                      {/* Full Reference Code */}
                      <View style={[styles.modalRefRow, { borderBottomColor: borderCol }]}>
                        <Text style={[styles.modalRefLabel, { color: subTextColor }]}>Order ID:</Text>
                        <Text style={[styles.modalRefCode, { color: textColor }]} selectable={true}>
                          #{selectedOrder.id}
                        </Text>
                      </View>

                      {/* Items Receipt List */}
                      <View style={styles.receiptSection}>
                        <Text style={[styles.receiptSectionTitle, { color: textColor }]}>Receipt Breakdown</Text>
                        <View style={[styles.receiptItemsList, { backgroundColor: detailsBg, borderColor: borderCol }]}>
                          {selectedOrder.items.map((item, idx) => (
                            <View key={`${item.productId}-${idx}`} style={styles.receiptItemRow}>
                              <Text style={[styles.receiptItemName, { color: textColor }]}>
                                <Text style={{ color: '#009DE0', fontWeight: '800' }}>{item.quantity}x</Text>{' '}
                                {item.name}
                              </Text>
                              <Text style={[styles.receiptItemPrice, { color: textColor }]}>
                                ₪{(item.price * item.quantity).toFixed(2)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Total cost display */}
                      <View style={styles.modalTotalRow}>
                        <Text style={[styles.modalTotalLabel, { color: textColor }]}>Total Paid</Text>
                        <Text style={styles.modalTotalValue}>₪{orderTotal.toFixed(2)}</Text>
                      </View>
                    </View>
                  );
                })()}
              </ScrollView>

              {/* Action Toolbar */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.editBtn]}
                  onPress={() => handleEditOrder(selectedOrder)}
                  disabled={isLoadingEdit || isDeleting}
                  activeOpacity={0.8}
                >
                  {isLoadingEdit ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalBtnText}>Edit Order</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteOrder(selectedOrder.id)}
                  disabled={isLoadingEdit || isDeleting}
                  activeOpacity={0.8}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalBtnText}>Delete Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#009DE0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    textAlign: 'center',
  },
  welcomeBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  welcomeSubtext: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: ROUNDED_FONT,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: ROUNDED_FONT,
  },
  retryButton: {
    backgroundColor: '#009DE0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: ROUNDED_FONT,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: ROUNDED_FONT,
  },
  exploreBtn: {
    backgroundColor: '#009DE0',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#009DE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  orderTimestamp: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: ROUNDED_FONT,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginVertical: 12,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  refLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  refCode: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
    marginLeft: 4,
  },
  itemsPreviewText: {
    fontSize: 13.5,
    fontWeight: '500',
    fontFamily: ROUNDED_FONT,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    padding: 24,
    paddingTop: 32,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: ROUNDED_FONT,
    marginBottom: 8,
  },
  modalResSection: {
    marginBottom: 16,
  },
  modalResName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  modalTimestamp: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: ROUNDED_FONT,
  },
  statusBadgeInline: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusBadgeInlineText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalRefLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  modalRefCode: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
    marginLeft: 4,
  },
  receiptSection: {
    marginBottom: 20,
  },
  receiptSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    marginBottom: 10,
  },
  receiptItemsList: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  receiptItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
    marginRight: 12,
  },
  receiptItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#009DE0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#009DE0',
    marginRight: 12,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
});
