import React, { useState } from 'react';
import './Header.css';
import woltLogoLight from './assets/wolt-delivery1310.logowik.com.PNG';
import woltLogoDark from './assets/WhatsApp Image 2026-06-09 at 16.00.16.JPG';

const Header = ({ darkMode, toggleTheme }) => {
  // נתונים מדומים זמניים (Mock Data) - למצב מחובר עם כתובת
  // שמי ל-false כדי לבדוק איך ה-Header נראה כשהמשתמש מנותק והכתובת נעלמת
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  
  const [user, setUser] = useState({
    displayName: 'תמר',
    profileImage: 'https://via.placeholder.com/40', // תמונת פרופיל זמנית
    address: 'רחוב הרצל 42, רמת גן'
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('מחיקת טוקן וניווט ל- /login');
  };

  return (
    // ... (בתוך ה-return של ה-Header)
    <header className="wolt-header">
      <div className="header-container">
        
        {/* צד שמאל: לוגו וולט */}
        <div className="header-left">
          <div className="wolt-logo-container">
            <img 
              src={darkMode ? woltLogoDark : woltLogoLight} 
              alt="Wolt Logo" 
              className="wolt-official-logo" 
            />
          </div>
        </div>

        {/* מרכז: שורת החיפוש */}
        <div className="header-center">
          <div className="header-search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search in Wolt..." className="search-input" />
          </div>
        </div>

        {/* צד ימין: כתובת, החלפת נושא, התחבר/הרשם */}
        <div className="header-right">
          {isLoggedIn && user && user.address && (
            <div className="user-address-box">
              <span className="address-icon">📍</span>
              <span className="address-text">{user.address}</span>
            </div>
          )}

          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {isLoggedIn ? (
            <div className="user-profile-section">
              <img src={user.profileImage} className="profile-img" />
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <>
              <button className="login-btn">Log in</button>
              <button className="register-btn">Sign up</button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;