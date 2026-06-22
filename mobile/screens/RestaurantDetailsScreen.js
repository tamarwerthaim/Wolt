import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function RestaurantDetailsScreen({ route, navigation }) {
  const { id } = route.params || { id: 'Unknown' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Details Screen</Text>
      <Text style={styles.subtitle}>Viewing Restaurant ID: {id}</Text>
      
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
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
