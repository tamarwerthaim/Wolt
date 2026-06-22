import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wolt Home Dashboard</Text>
      <Text style={styles.subtitle}>Select a restaurant to view details:</Text>
      
      {/* Temporary navigation button to test routing to RestaurantDetails */}
      <Button
        title="Go to Gabay Sabich (Restaurant 1)"
        onPress={() => navigation.navigate('RestaurantDetails', { id: '1' })}
        color="#009DE0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#009DE0',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
});
