import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';
import { API_BASE_URL, ROUNDED_FONT } from '../config';

const BlueScooterIcon = () => (
  <Image
    source={require('../assets/Bike.png')}
    style={styles.scooterImage}
    resizeMode="contain"
  />
);

export default function RestaurantCard({
  item,
  isLoggedIn,
  isDarkMode,
  deliveryTimeStr,
  onPress,
  isCarousel = false
}) {
  const cardBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#1f2937';
  const subTextColor = isDarkMode ? '#a0a0a0' : '#6b7280';

  const imageUrl = item.image
    ? `${API_BASE_URL}${item.image}`
    : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg';

  if (isCarousel) {
    return (
      <TouchableOpacity
        style={[styles.carouselCard, { backgroundColor: cardBg }]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Image source={{ uri: imageUrl }} style={styles.carouselCardImage} />
        <View style={styles.carouselCardInfo}>
          <Text style={[styles.carouselCardName, { color: textColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          {!isLoggedIn ? (
            <Text style={styles.carouselCardDist} numberOfLines={1}>
              📍 {item.geolocation ? `${item.geolocation.lat.toFixed(4)}, ${item.geolocation.lng.toFixed(4)}` : 'No location'}
            </Text>
          ) : (
            <View style={styles.carouselCardDistRow}>
              <BlueScooterIcon />
              <Text style={styles.carouselCardDist} numberOfLines={1}>
                {deliveryTimeStr}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.restaurantCard, { backgroundColor: cardBg }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: textColor }]}>{item.name}</Text>
        {!isLoggedIn ? (
          <Text style={[styles.cardPrep, { color: subTextColor }]}>
            📍 {item.geolocation ? `Location: ${item.geolocation.lat.toFixed(4)}, ${item.geolocation.lng.toFixed(4)}` : 'No location'}
          </Text>
        ) : (
          <View style={styles.cardPrepRow}>
            <BlueScooterIcon />
            <Text style={[styles.cardPrep, { color: subTextColor }]}>Delivery in {deliveryTimeStr}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scooterImage: {
    width: 18,
    height: 22,
    marginRight: 6,
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
    fontFamily: ROUNDED_FONT,
  },
  carouselCardDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
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
    fontFamily: ROUNDED_FONT,
  },
  cardPrep: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: ROUNDED_FONT,
  },
  cardPrepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
