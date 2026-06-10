import React from 'react';
import './Header.css';
import woltLogoLight from './assets/wolt-delivery1310.logowik.com.PNG';
import woltLogoDark from './assets/WhatsApp Image 2026-06-09 at 16.00.16.JPG';
import { useNavigate } from 'react-router-dom';

// מקבלים את currentUser, setCurrentUser, cart ו-setIsCartOpen מתוך ה-Props של ה-App
const Header = ({ darkMode, toggleTheme, currentUser, setCurrentUser, cart, setIsCartOpen }) => {
  
  // הסטטוס נקבע בצורה דינמית: אם קיים משתמש ב-App, אנחנו מחוברים!
  const isLoggedIn = !!currentUser;
  const navigate = useNavigate();

  const handleLogout = () => {
    // מנקים את ה-localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // מאפסים את הסטייט ב-App כדי שכל האתר יתנתק מיידית
    setCurrentUser(null);
    
    console.log('מחיקת טוקן וניווט ל- /login');
    navigate('/login');
  };

  const totalItems = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

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
              onClick={() => navigate('/')}
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

        {/* צד ימין: כתובת, החלפת נושא, עגלה, התחבר/הרשם/פרופיל */}
        <div className="header-right">
          {/* מציג את הכתובת האמיתית של המשתמש מהשרת רק אם הוא מחובר */}
          {isLoggedIn && currentUser && currentUser.address && (
            <div className="user-address-box">
              <span className="address-icon">📍</span>
              <span className="address-text">{currentUser.address}</span>
            </div>
          )}

          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button className="header-cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
            <span>🛒</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {isLoggedIn && currentUser ? (
            /* מציג תמונת פרופיל אמיתית מהשרת וברכת שלום דינמית */
            <div className="user-profile-section">
              <img 
                // src={currentUser.profileImage || 'https://via.placeholder.com/40'} 
                // className="profile-img" 
                // alt="Profile"
                src={currentUser.profileImage ? `http://localhost:3000/uploads/${currentUser.profileImage}` : 'https://via.placeholder.com/40'} 
                className="profile-img" 
                alt="Profile"
              />
              <span className="user-name" style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 600, marginRight: '8px', color: 'var(--text-color)' }}>
                Hi, {currentUser.name || currentUser.username}
              </span>
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <>
              <button className="login-btn" onClick={() => navigate('/login')}>
                Log in
              </button>
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