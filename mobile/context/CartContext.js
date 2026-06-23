import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cart from AsyncStorage on startup
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('wolt_cart');
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          setCartItems(parsed.cartItems || []);
          setRestaurantId(parsed.restaurantId || null);
          setRestaurantName(parsed.restaurantName || null);
          setEditingOrderId(parsed.editingOrderId || null);
        }
      } catch (err) {
        console.warn('Failed to load cart from storage:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage
  const saveCartToStorage = async (items, restId, restName, editOrderId) => {
    try {
      await AsyncStorage.setItem(
        'wolt_cart',
        JSON.stringify({
          cartItems: items,
          restaurantId: restId,
          restaurantName: restName,
          editingOrderId: editOrderId
        })
      );
    } catch (err) {
      console.warn('Failed to save cart to storage:', err);
    }
  };

  const addToCart = (product, restId, restName, quantity = 1, force = false) => {
    // Single-restaurant restriction
    if (!force && restaurantId && restaurantId !== restId) {
      return false;
    }

    let updatedItems;
    const targetId = product.id || product._id || product.productId;

    if (force) {
      updatedItems = [
        {
          productId: targetId,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          quantity: quantity
        }
      ];
      setEditingOrderId(null);
    } else {
      const existingIndex = cartItems.findIndex(item => item.productId === targetId);

      if (existingIndex > -1) {
        updatedItems = [...cartItems];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        updatedItems = [
          ...cartItems,
          {
            productId: targetId,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: quantity
          }
        ];
      }
    }

    setCartItems(updatedItems);
    setRestaurantId(restId);
    setRestaurantName(restName);
    saveCartToStorage(updatedItems, restId, restName, force ? null : editingOrderId);
    return true;
  };

  const removeFromCart = (productId) => {
    const existingIndex = cartItems.findIndex(item => item.productId === productId);
    if (existingIndex === -1) return;

    let updatedItems = [...cartItems];
    const removedItemName = updatedItems[existingIndex].name;
    if (updatedItems[existingIndex].quantity > 1) {
      updatedItems[existingIndex].quantity -= 1;
    } else {
      updatedItems = updatedItems.filter(item => item.productId !== productId);
    }

    const nextItems = updatedItems;
    const nextRestId = nextItems.length > 0 ? restaurantId : null;
    const nextRestName = nextItems.length > 0 ? restaurantName : null;
    const nextEditingOrderId = nextItems.length > 0 ? editingOrderId : null;

    setCartItems(nextItems);
    setRestaurantId(nextRestId);
    setRestaurantName(nextRestName);
    setEditingOrderId(nextEditingOrderId);
    saveCartToStorage(nextItems, nextRestId, nextRestName, nextEditingOrderId);
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setEditingOrderId(null);
    saveCartToStorage([], null, null, null);
  };

  const loadOrderIntoCart = (order, restName, productsMap = {}) => {
    const items = order.items.map(item => {
      const product = productsMap[item.productId];
      return {
        productId: item.productId,
        name: item.name || product?.name || `Item ID: ${item.productId.slice(0, 6)}`,
        price: item.price !== undefined ? Number(item.price) : (product ? Number(product.price) : 0),
        image: item.image || product?.image || '',
        quantity: item.quantity
      };
    });
    setCartItems(items);
    setRestaurantId(order.restaurantId);
    setRestaurantName(restName);
    setEditingOrderId(order.id);
    saveCartToStorage(items, order.restaurantId, restName, order.id);
  };

  // Derived values
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurantId,
      restaurantName,
      editingOrderId,
      loading,
      addToCart,
      removeFromCart,
      clearCart,
      loadOrderIntoCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
