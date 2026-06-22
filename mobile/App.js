import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RestaurantDetailsScreen from './screens/RestaurantDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Wolt' }} 
        />
        <Stack.Screen 
          name="RestaurantDetails" 
          component={RestaurantDetailsScreen} 
          options={{ title: 'Restaurant Details' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
