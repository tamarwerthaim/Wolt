import React, { useState, useEffect } from 'react';
import './Header.css';
import woltLogoLight from './assets/wolt-delivery1310.logowik.com.PNG';
import woltLogoDark from './assets/WhatsApp Image 2026-06-09 at 16.00.16.JPG';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

// מקבלים את currentUser, setCurrentUser, cart ו-setIsCartOpen מתוך ה-Props של ה-App
const Header = ({ darkMode, toggleTheme, currentUser, setCurrentUser, cart, setIsCartOpen, clearCart }) => {
  
  // הסטטוס נקבע בצורה דינמית: אם קיים משתמש ב-App, אנחנו מחוברים!
  const isLoggedIn = !!currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [searchVal, setSearchVal] = useState(searchQuery);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.user-profile-section')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileOpen]);

  // סנכרון תיבת החיפוש עם ה-URL
  useEffect(() => {
    setSearchVal(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (val.trim()) {
      navigate(`/?search=${encodeURIComponent(val)}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    // מנקים את ה-localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('wolt_cart');
    
    // מאפסים את הסטייט ב-App כדי שכל האתר יתנתק מיידית
    setCurrentUser(null);
    // מרוקנים את העגלה
    clearCart();
    
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
            <input 
              type="text" 
              placeholder="Search in Wolt..." 
              className="search-input" 
              value={searchVal}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* צד ימין: כתובת, עגלה, החלפת נושא, התחבר/הרשם/פרופיל */}
        <div className="header-right">
          {/* מציג את הכתובת האמיתית של המשתמש מהשרת רק אם הוא מחובר */}
          {isLoggedIn && currentUser && currentUser.address && (
            <div className="user-address-box">
              <span className="address-icon">📍</span>
              <span className="address-text">{currentUser.address}</span>
            </div>
          )}

          <button className="header-cart-btn" onClick={() => {
            if (!isLoggedIn) {
              navigate('/login', { state: { from: location.pathname, openCart: true } });
            } else {
              setIsCartOpen(true);
            }
          }} aria-label="Open cart">
            <span>🛒</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {isLoggedIn && currentUser ? (
            /* מציג תמונת פרופיל אמיתית מהשרת וברכת שלום דינמית עם תפריט נפתח */
            <div className="user-profile-section" style={{ position: 'relative' }}>
              <span 
                className="user-name interactive" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 600, color: 'var(--text-color)', cursor: 'pointer', userSelect: 'none' }}
              >
                Hi, {currentUser.name || currentUser.username}
              </span>
              <img 
                src={currentUser.profileImage ? `http://localhost:3000/uploads/${currentUser.profileImage}` : 'https://via.placeholder.com/40'} 
                className="profile-img interactive" 
                alt="Profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              />

              {isProfileOpen && (
                <div className="profile-dropdown-card">
                  <div className="profile-dropdown-header">
                    <img 
                      src={currentUser.profileImage ? `http://localhost:3000/uploads/${currentUser.profileImage}` : 'https://via.placeholder.com/40'} 
                      className="profile-dropdown-avatar" 
                      alt="Avatar"
                    />
                    <div className="profile-dropdown-info">
                      <h4 className="profile-dropdown-name">{currentUser.name || currentUser.username}</h4>
                      <span className="profile-dropdown-username">{currentUser.username}</span>
                      {currentUser.isAdmin && <span className="profile-dropdown-badge">Admin</span>}
                    </div>
                  </div>
                  <div className="profile-dropdown-details">
                    <div className="profile-detail-item">
                      <span className="detail-icon">📞</span>
                      <span className="detail-text">{currentUser.phone || 'No phone'}</span>
                    </div>
                    {currentUser.geolocation && (
                      <div className="profile-detail-item">
                        <span className="detail-icon">📍</span>
                        <span className="detail-text">
                          {currentUser.geolocation.lat.toFixed(4)}, {currentUser.geolocation.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="profile-dropdown-actions">
                    <button className="orders-history-btn" onClick={() => { setIsProfileOpen(false); navigate('/orders'); }}>
                      Order History
                    </button>
                    <button className="edit-profile-btn" onClick={() => { setIsProfileOpen(false); navigate('/edit-profile'); }}>
                      Edit Profile
                    </button>
                    <button className="logout-btn dropdown-logout-btn" onClick={handleLogout}>Log out</button>
                  </div>
                </div>
              )}
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