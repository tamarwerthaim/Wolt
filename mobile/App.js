import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import RestaurantDetailsScreen from './screens/RestaurantDetailsScreen';
import AddRestaurantScreen from './screens/AddRestaurantScreen';
import AddProductScreen from './screens/AddProductScreen';
import EditRestaurantScreen from './screens/EditRestaurantScreen';
import EditProductScreen from './screens/EditProductScreen';
import SearchScreen from './screens/SearchScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import { CartProvider } from './context/CartContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RestaurantDetails" 
          component={RestaurantDetailsScreen} 
          options={{ title: 'Restaurant Details' }} 
        />
        <Stack.Screen 
          name="AddRestaurant" 
          component={AddRestaurantScreen} 
          options={{ title: 'Add Restaurant' }} 
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProductScreen} 
          options={{ title: 'Add Product' }} 
        />
        <Stack.Screen 
          name="EditRestaurant" 
          component={EditRestaurantScreen} 
          options={{ title: 'Edit Restaurant' }} 
        />
        <Stack.Screen 
          name="EditProduct" 
          component={EditProductScreen} 
          options={{ title: 'Edit Product' }} 
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="OrderSuccess" 
          component={OrderSuccessScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="OrderHistory" 
          component={OrderHistoryScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ title: 'Edit Profile' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
    </CartProvider>
  );
}
