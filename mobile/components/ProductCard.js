import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { API_BASE_URL, ROUNDED_FONT } from '../config';

const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
  }
  if (imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return imagePath;
};

export default function ProductCard({
  product,
  restaurant,
  currentUser,
  cartItems,
  cartRestaurantName,
  addToCart,
  isDarkMode,
  onPress,
  navigation
}) {
  const themeCardBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const themeTextColor = isDarkMode ? '#ffffff' : '#1f2937';
  const themeSubTextColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const themeBorderColor = isDarkMode ? '#2d2d2d' : '#f3f4f6';

  const productId = product.id || product._id;
  const restaurantId = restaurant?.id || restaurant?._id;

  const itemInCart = cartItems.find(item => item.productId === productId);
  const itemQuantity = itemInCart && itemInCart.quantity > 0 ? itemInCart.quantity : 0;

  const handleQuickAdd = () => {
    const currentRestaurantName = restaurant?.name || 'Restaurant';
    const added = addToCart(product, restaurantId, currentRestaurantName, 1);
    if (!added) {
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
              addToCart(product, restaurantId, currentRestaurantName, 1, true);
            },
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Left Side: Product Text Information */}
      <View style={styles.productTextWrapper}>
        <View style={styles.productNameRow}>
          <Text style={[styles.productNameText, { color: themeTextColor }]}>{product.name}</Text>
          {currentUser?.isAdmin && restaurant?.ownerId === currentUser.id && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('EditProduct', { restaurantId, productId });
              }}
              style={styles.editProductBadge}
              activeOpacity={0.7}
            >
              <Text style={styles.editProductBadgeText}>✎</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.productDescText, { color: themeSubTextColor }]} numberOfLines={2}>
          {product.description || 'No description available for this delicious dish.'}
        </Text>
        <Text style={[styles.productPriceText, { color: themeTextColor }]}>₪{Number(product.price).toFixed(2)}</Text>
      </View>

      {/* Right Side: Product Image & Quick Add Button */}
      <View style={styles.productImageWrapper}>
        <Image
          source={{ uri: getFullImageUrl(product.image) }}
          style={styles.productCardImage}
        />
        {itemQuantity > 0 && (
          <View style={styles.imageQuantityBadge}>
            <Text style={styles.imageQuantityBadgeText}>{itemQuantity}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.quickAddButton}
          activeOpacity={0.8}
          onPress={(e) => {
            e.stopPropagation();
            handleQuickAdd();
          }}
        >
          <Text style={styles.quickAddButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
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
  productNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productNameText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 16,
    fontWeight: '700',
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
    lineHeight: 18,
    marginBottom: 8,
  },
  productPriceText: {
    fontFamily: ROUNDED_FONT,
    fontSize: 15,
    fontWeight: '700',
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
});
