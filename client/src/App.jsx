import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';

// const Home = () => <h2 style={{ color: 'var(--text-color)' }}>עמוד הבית - רשימת מסעדות 🍔</h2>;
const Orders = () => <h2 style={{ color: 'var(--text-color)' }}>ההזמנות שלי 📦</h2>;
// const Login = () => <h2 style={{ color: 'var(--text-color)' }}>דף התחברות למערכת 🔑</h2>;
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RestaurantDetails from './pages/RestaurantDetails';

function App() {
  const [darkMode, setDarkMode] = useState(false);

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
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />

        {/* שינוי כאן: הורדנו את ה-padding, ה-max-width וה-margin הצרפתים */}
        <main> 
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;