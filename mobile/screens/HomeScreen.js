import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { API_BASE_URL } from '../config';

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#009DE0" />
        <Text style={styles.infoText}>Loading Wolt Restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            // Trigger refetch
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
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Wolt Restaurants</Text>
      
      {restaurants.length === 0 ? (
        <Text style={styles.emptyText}>No restaurants found.</Text>
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
                style={styles.restaurantCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('RestaurantDetails', { id: item.id })}
              >
                <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardPrep}>🛵 Delivery in {item.prepTime + 15} min</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  infoText: {
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  restaurantCard: {
    backgroundColor: '#fff',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  cardPrep: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 40,
  },
});
