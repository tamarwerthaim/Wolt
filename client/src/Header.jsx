import React, { useState } from 'react';
import './Header.css';
import woltLogoLight from './assets/wolt-delivery1310.logowik.com.PNG';
import woltLogoDark from './assets/WhatsApp Image 2026-06-09 at 16.00.16.JPG';

// שינוי 1: מייבאים את ה-Hook של הניווט מהראוטר
import { useNavigate } from 'react-router-dom';

const Header = ({ darkMode, toggleTheme }) => {
  // טיפ קטן לבדיקה: תשני את זה ל-false כדי שתוכלי לראות את כפתורי ה-Log in וה-Sign up במסך!
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState({
    displayName: 'תמר',
    profileImage: 'https://via.placeholder.com/40',
    address: 'רחוב הרצל 42, רמת גן'
  });

  // שינוי 2: מאתחלים את פונקציית הניווט בתוך הקומפוננטה
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('מחיקת טוקן וניווט ל- /login');
    // שינוי 3: מנווטים לעמוד הלוגין באופן אקטיבי בזמן התנתקות
    navigate('/login');
  };

  return (
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
              {/* שינוי 4: הוספת אירוע onClick שמנווט לעמוד הלוגין שלך! */}
              <button className="login-btn" onClick={() => navigate('/login')}>
                Log in
              </button>

              {/* שינוי 5: הוספת אירוע onClick שמנווט לעמוד ההרשמה (Register) שאת הולכת לבנות */}
              <button className="register-btn" onClick={() => navigate('/register')}>
                Sign up
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;