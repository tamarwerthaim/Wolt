import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';

const Home = () => <h2 style={{ color: 'var(--text-color)' }}>עמוד הבית - רשימת מסעדות 🍔</h2>;
const Orders = () => <h2 style={{ color: 'var(--text-color)' }}>ההזמנות שלי 📦</h2>;
const Login = () => <h2 style={{ color: 'var(--text-color)' }}>דף התחברות למערכת 🔑</h2>;

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
    <Router> {/*Wrapped the entire application with Router to enable navigation */}
      <div className="app-container" style={{ direction: 'rtl' }}>
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        
        <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* Defined the route switches inside the main content area */}
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Main application routes */}
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;