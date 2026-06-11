import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Orders from './pages/Orders.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EditProfile from './pages/EditProfile.jsx';
import RestaurantDetails from './pages/RestaurantDetails';
import AddRestaurant from './pages/AddRestaurant';
import AddProduct from './pages/AddProduct';
import Cart from './components/Cart.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  // State for logged-in user details
  const [currentUser, setCurrentUser] = useState(null);

  // Cart State (loaded from localStorage if exists)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('wolt_cart');
    return savedCart ? JSON.parse(savedCart) : { restaurantId: null, restaurantName: '', items: [] };
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wolt_cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, restaurantId, restaurantName) => {
    setCart(prevCart => {
      const productId = product.id || product._id;

      // Single restaurant rule: check if adding from a different restaurant
      if (prevCart.restaurantId && prevCart.restaurantId !== restaurantId) {
        const confirmClear = window.confirm("You already have items from another restaurant in your cart. Would you like to clear the cart and start a new order from this restaurant?");
        if (!confirmClear) return prevCart;

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

      const existingIndex = prevCart.items.findIndex(item => item.productId === productId);
      let newItems;

      if (existingIndex > -1) {
        newItems = prevCart.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
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
        restaurantId,
        restaurantName,
        items: newItems
      };
    });
  };

  // Remove or decrement item in cart
  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.productId === productId);
      if (!existingItem) return prevCart;

      let newItems;
      if (existingItem.quantity === 1) {
        newItems = prevCart.items.filter(item => item.productId !== productId);
      } else {
        newItems = prevCart.items.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }

      const hasItems = newItems.length > 0;
      return {
        restaurantId: hasItems ? prevCart.restaurantId : null,
        restaurantName: hasItems ? prevCart.restaurantName : '',
        items: newItems
      };
    });
  };

  // Clear cart entirely
  const clearCart = () => {
    setCart({
      restaurantId: null,
      restaurantName: '',
      items: []
    });
  };

  // Fetch user details if token and userId exist in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // if we have a token and userId but no currentUser data, fetch the profile from the server
    if (token && userId && !currentUser) {
      fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          // Send JWT token for security
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(userData => {
          if (!userData.error) {
            // Save profile data
            setCurrentUser(userData);
          }
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [currentUser]);


  // // Fetch user details if token and userId exist in localStorage
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const userId = localStorage.getItem('userId');

  //   console.log("=== בדיקת סנכרון בתוך App.jsx ===");
  //   console.log("1. האם קיים טוקן בדפדפן?", token ? "כן" : "לא");
  //   console.log("2. האם קיים userId בדפדפן?", userId ? userId : "לא");

  //   if (token && userId && !currentUser) {
  //     fetch(`http://localhost:3000/api/users/${userId}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     })
  //     .then(res => res.json())
  //     .then(userData => {
  //       console.log("3. מה השרת ענה כשביקשנו את הפרופיל?", userData);

  //       if (!userData.error) {
  //         setCurrentUser(userData);
  //         console.log("4. המשתמש עודכן בהצלחה בסטייט!");
  //       } else {
  //         console.log(" שגיאה מהשרת:", userData.error);
  //       }
  //     })
  //     .catch(err => console.error(" שגיאה קריטית בחיבור לשרת:", err));
  //   }
  // }, [currentUser]);



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
      <div className="app-container" style={{ direction: 'rtl' }}>
        {/* שינוי 1: מעבירים ל-Header את המשתמש הנוכחי ואת פונקציית העדכון שלו */}
        <Header 
          darkMode={darkMode} 
          toggleTheme={toggleTheme} 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          cart={cart}
          setIsCartOpen={setIsCartOpen}
        />

        <main>
          <Routes>
            {/* שינוי 2: מעבירים ל-Login את האפשרות לעדכן את המשתמש הגלובלי מיד בהתחברות */}
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            <Route path="/register" element={<Register />} />

            {/* שינוי 3: מעבירים ל-Home את המשתמש כדי שההרשאות וכפתורי האדמין יתעדכנו */}
            <Route path="/" element={<Home currentUser={currentUser} />} />

            <Route path="/restaurant/:id" element={
              <RestaurantDetails 
                currentUser={currentUser}
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            } />
            <Route path="/restaurant/:id/add-product" element={<AddProduct />} />
            <Route path="/admin/add-restaurant" element={<AddRestaurant />} />

            {/* Main application routes */}
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfile currentUser={currentUser} setCurrentUser={setCurrentUser} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* Global Cart drawer component */}
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