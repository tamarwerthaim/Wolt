import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Orders from './pages/Orders.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EditProfile from './pages/EditProfile.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import RestaurantDetails from './pages/RestaurantDetails';
import AddRestaurant from './pages/AddRestaurant';
import EditRestaurant from './pages/EditRestaurant';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Cart from './components/Cart.jsx';

/* Main root component of the app that handles routing, global states, and the shopping cart */
function App() {
  /* State to check if dark mode is active (true/false) */
  const [darkMode, setDarkMode] = useState(false);

  /* Store the currently logged-in user profile data */
  const [currentUser, setCurrentUser] = useState(null);

  /* Load the cart from localStorage if it exists, otherwise use a default empty cart */
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('wolt_cart');
    return savedCart ? JSON.parse(savedCart) : { restaurantId: null, restaurantName: '', items: [] };
  });

  /* State to track if the slide-out cart drawer is open or closed */
  const [isCartOpen, setIsCartOpen] = useState(false);

  /* Automatically save the cart to localStorage whenever it changes */
  useEffect(() => {
    localStorage.setItem('wolt_cart', JSON.stringify(cart));
  }, [cart]);

  /* Function to add a product item to the shopping cart */
  const addToCart = (product, restaurantId, restaurantName) => {
    setCart(prevCart => {
      /* Handle different possible property names for the product ID */
      const productId = product.productId || product.id || product._id;

      /* Block users from ordering from multiple restaurants at the same time */
      if (prevCart.restaurantId && prevCart.restaurantId !== restaurantId) {
        const confirmClear = window.confirm("You already have items from another restaurant in your cart. Would you like to clear the cart and start a new order from this restaurant?");
        if (!confirmClear) return prevCart;

        /* Reset the cart with the single new item if user confirms the clear prompt */
        return {
          restaurantId,
          restaurantName,
          items: [{
            productId,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
          }]
        };
      }

      /* Check if the product is already in the cart to increment its count */
      const existingIndex = prevCart.items.findIndex(item => item.productId === productId);
      let newItems;

      if (existingIndex > -1) {
        /* Increase item quantity by 1 if it is already in the list */
        newItems = prevCart.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        /* Add the new item to the array list if it is not in the cart yet */
        newItems = [
          ...prevCart.items,
          {
            productId,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
          }
        ];
      }

      return {
        ...prevCart,
        restaurantId,
        restaurantName,
        items: newItems
      };
    });
  };

  /* Remove an item or lower its quantity count inside the cart */
  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.productId === productId);
      if (!existingItem) return prevCart;

      let newItems;
      if (existingItem.quantity === 1) {
        /* Filter out the item completely if its quantity drops to zero */
        newItems = prevCart.items.filter(item => item.productId !== productId);
      } else {
        /* Decrease the item quantity counter by 1 */
        newItems = prevCart.items.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }

      /* Clear restaurant info from cart state if no items are left */
      const hasItems = newItems.length > 0;
      return {
        ...prevCart,
        restaurantId: hasItems ? prevCart.restaurantId : null,
        restaurantName: hasItems ? prevCart.restaurantName : '',
        items: newItems,
        editingOrderId: hasItems ? prevCart.editingOrderId : undefined
      };
    });
  };

  /* Completely clear all items and restaurant data from the cart state */
  const clearCart = () => {
    setCart({
      restaurantId: null,
      restaurantName: '',
      items: []
    });
  };

  /* Fetch user profile details from the database if token and userId exist in localStorage */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId && !currentUser) {
      fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          /* Send the JWT auth bearer token for secure access checks */
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(userData => {
          if (!userData.error) {
            /* Update the global user context state with the returned profile data */
            setCurrentUser(userData);
          }
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [currentUser]);

  /* Turn off dark mode automatically if the current user logs out */
  useEffect(() => {
    if (!currentUser && darkMode) {
      setDarkMode(false);
      document.body.classList.remove('dark-mode');
    }
  }, [currentUser, darkMode]);

  /* Helper function to toggle dark mode classes over the document body target */
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <Router>
      <div className="app-container">

        {/* Top navigation header component tracking theme switches, user status, and cart states */}
        <Header
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          cart={cart}
          setIsCartOpen={setIsCartOpen}
          clearCart={clearCart}
        />

        <main>
          <Routes>
            {/* Authentication views that update login configurations directly */}
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} setIsCartOpen={setIsCartOpen} />} />
            <Route path="/register" element={<Register />} />

            {/* Home page component displaying current restaurant listings */}
            <Route path="/" element={<Home currentUser={currentUser} />} />

            {/* Specific menu details catalog views matching restaurant IDs */}
            <Route path="/restaurant/:id" element={
              <RestaurantDetails
                currentUser={currentUser}
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            } />

            {/* Administrative route links guarded or restricted to specific workspace rules */}
            <Route path="/restaurant/:id/add-product" element={
              <ProtectedRoute>
                <AddProduct currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/:id/edit" element={
              <ProtectedRoute>
                <EditRestaurant currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/:id/product/:pld/edit" element={
              <ProtectedRoute>
                <EditProduct currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-restaurant" element={<AddRestaurant />} />

            {/* User dashboard pages guarded by route authentication wrappers */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders
                  currentUser={currentUser}
                  setCart={setCart}
                  setIsCartOpen={setIsCartOpen}
                />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfile currentUser={currentUser} setCurrentUser={setCurrentUser} />
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* Slide-out cart container displaying current item selections and totals */}
        <Cart
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
        />
      </div>
    </Router>
  );
}

export default App;