import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ROUNDED_FONT } from '../config';
import { useCart } from '../context/CartContext';

const { height } = Dimensions.get('window');

const cartPng = require('../assets/cart.png');
const bikePng = require('../assets/Bike.png');

export default function CartModal({ isOpen, onClose, isDarkMode, navigation }) {
  const {
    cartItems,
    restaurantId,
    restaurantName,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to fetch full image path or a fallback placeholder
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
    }
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return imagePath;
  };

  const handleCheckout = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please log in to place your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log In',
            onPress: () => {
              onClose();
              navigation.navigate('Login');
            }
          }
        ]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurantId,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name
          }))
        })
      });

      let data = {};
      if (response.status !== 204) {
        data = await response.json().catch(() => ({}));
      }

      if (response.ok) {
        Alert.alert(
          'Order Placed! 🎉',
          `Your order from "${restaurantName}" was successfully received. Bon appétit!`,
          [{ text: 'Great!' }]
        );
        clearCart();
        onClose();
      } else {
        if (response.status === 401 || response.status === 403) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.removeItem('userToken');
                  onClose();
                  navigation.navigate('Login');
                }
              }
            ]
          );
        } else {
          Alert.alert('Checkout Failed', data.error || 'Failed to place order. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error placing order:', err);
      Alert.alert('Error', 'A network error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearCartClick = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cart',
          style: 'destructive',
          onPress: () => clearCart()
        }
      ]
    );
  };

  // Determine colors based on Theme mode
  const modalBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const backdropBg = 'rgba(0, 0, 0, 0.6)';
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#6b7280';
  const borderCol = isDarkMode ? '#2d2d2d' : '#e5e7eb';
  const infoCardBg = isDarkMode ? '#282828' : '#f3f4f6';
  const emptyIconColor = isDarkMode ? '#444' : '#e5e7eb';

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: backdropBg }]}>
        <TouchableOpacity
          style={styles.backdropClickable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.drawerContainer, { backgroundColor: modalBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol }]}>
            <Text style={[styles.title, { color: textColor }]}>🛒 My Cart</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#282828' : '#f3f4f6' }]}>
              <Text style={[styles.closeBtnText, { color: textColor }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {cartItems.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <Image
                source={cartPng}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Your cart is empty...</Text>
              <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
                Add delicious dishes from the menu to start an order!
              </Text>
              <TouchableOpacity
                style={styles.backToMenuBtn}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.backToMenuText}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Cart Items ScrollView */
            <View style={styles.contentContainer}>
              {/* Restaurant Info Badge */}
              <View style={[styles.restaurantInfo, { backgroundColor: infoCardBg }]}>
                <Text style={[styles.restaurantLabel, { color: subTextColor }]}>Ordering from:</Text>
                <Text style={[styles.restaurantName, { color: textColor }]}>{restaurantName}</Text>
              </View>

              <ScrollView contentContainerStyle={styles.itemList} showsVerticalScrollIndicator={false}>
                {cartItems.map((item) => (
                  <View key={item.productId} style={[styles.cartItem, { borderBottomColor: borderCol }]}>
                    <Image
                      source={{ uri: getFullImageUrl(item.image) }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemDetails}>
                      <Text style={[styles.itemName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.itemPrice, { color: subTextColor }]}>₪{Number(item.price).toFixed(2)}</Text>
                    </View>
                    <View style={styles.controlsWrapper}>
                      <View style={[styles.qtyControls, { backgroundColor: infoCardBg }]}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => removeFromCart(item.productId)}
                        >
                          <Text style={[styles.qtyBtnText, { color: textColor }]}>-</Text>
                        </TouchableOpacity>
                        <Text style={[styles.qtyVal, { color: textColor }]}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => addToCart(item, restaurantId, restaurantName, 1)}
                        >
                          <Text style={[styles.qtyBtnText, { color: textColor }]}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.itemTotal, { color: textColor }]}>
                        ₪{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Pricing Summary */}
              <View style={[styles.summaryBox, { backgroundColor: infoCardBg }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: textColor }]}>Total items ({cartCount})</Text>
                  <Text style={[styles.summaryVal, { color: textColor }]}>₪{cartTotal.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                  <Text style={[styles.summaryLabel, { color: textColor }]}>Delivery & Service</Text>
                  <View style={styles.deliveryContainer}>
                    <Text style={styles.deliveryFree}>Free </Text>
                    <Image
                      source={bikePng}
                      style={styles.bikeImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={[styles.divider, { backgroundColor: borderCol }]} />
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: textColor }]}>Total to pay</Text>
                  <Text style={[styles.totalVal, { color: textColor }]}>₪{cartTotal.toFixed(2)}</Text>
                </View>
              </View>

              {/* Footer Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearCartClick}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={handleCheckout}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropClickable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerContainer: {
    height: height * 0.8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  restaurantLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
    fontFamily: ROUNDED_FONT,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  itemList: {
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: ROUNDED_FONT,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  controlsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 2,
    marginRight: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  summaryBox: {
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  deliveryFree: {
    color: '#009DE0',
    fontWeight: '700',
    fontSize: 14.5,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 52,
  },
  clearBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginRight: 12,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: '#009DE0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 140,
  },
  emptyImage: {
    width: 390,
    height: 390,
    marginBottom: -40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: ROUNDED_FONT,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backToMenuBtn: {
    backgroundColor: '#009DE0',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backToMenuText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: ROUNDED_FONT,
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bikeImage: {
    width: 32,
    height: 20,
    marginLeft: 4,
  }
});
