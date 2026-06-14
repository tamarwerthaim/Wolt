// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import './Header.css';
import woltLogoLight from './assets/wolt-delivery1310.logowik.com.PNG';
import woltLogoDark from './assets/WhatsApp Image 2026-06-09 at 16.00.16.JPG';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

/* Navigation header component managing authentication states, search synchronization, theme options, and shopping cart toggles */
const Header = ({ darkMode, toggleTheme, currentUser, setCurrentUser, cart, setIsCartOpen, clearCart }) => {
  
  /* Determine user login authentication status dynamically based on current context existence */
  const isLoggedIn = !!currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  /* Extract query parameters from URL and manage synchronized internal state */
  const searchQuery = searchParams.get('search') || '';
  const [searchVal, setSearchVal] = useState(searchQuery);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  /* Listener hook tracking external page clicks to automatically collapse open dropdown menus */
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

  /* Sync internal input text field values whenever the global URL search changes */
  useEffect(() => {
    setSearchVal(searchQuery);
  }, [searchQuery]);

  /* Monitor keystrokes and immediately modify the primary application URL parameters */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (val.trim()) {
      navigate(`/?search=${encodeURIComponent(val)}`);
    } else {
      navigate('/');
    }
  };

  /* Terminate active user sessions, drop client tokens, reset local state, and wipe the cart */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('wolt_cart');
    
    /* Update top-level application states to trigger instant layout re-renders */
    setCurrentUser(null);
    clearCart();
    
    console.log('Clearing token data and navigating to /login');
    navigate('/login');
  };

  /* Aggregate total quantities cumulative calculation across all cart item fields */
  const totalItems = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <header className="wolt-header">
      <div className="header-container">

        {/* Left layout area: Brand identity logo display */}
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

        {/* Center layout area: Global interactive search bar input */}
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

        {/* Right layout area: Utilities, theme options, cart status, and user profile account access */}
        <div className="header-right">
          
          {/* Render authenticated client primary shipping address if available */}
          {isLoggedIn && currentUser && currentUser.address && (
            <div className="user-address-box">
              <span className="address-icon">📍</span>
              <span className="address-text">{currentUser.address}</span>
            </div>
          )}

          {/* Interactive shopping cart trigger action with authentication gate checks */}
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

          {/* Vector path icon toggle action to switch between system color modes */}
          {isLoggedIn && (
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          )}

          {/* Conditional layout branch split between explicit profile submenus and simple auth prompts */}
          {isLoggedIn && currentUser ? (
            
            /* Render user info greeting menu and interactive avatar toggle */
            <div className="user-profile-section">
              <span 
                className="user-name interactive" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                Hi, {currentUser.name || currentUser.username}
              </span>
              <img 
                src={currentUser.profileImage ? `http://localhost:3000/uploads/${currentUser.profileImage}` : 'https://via.placeholder.com/40'} 
                className="profile-img interactive" 
                alt="Profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              />

              {/* Account overlay card revealing metadata fields and global route navigation links */}
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
                  
                  {/* Detailed profile contact metadata records row elements */}
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
                  
                  {/* Action group compilation footer executing navigation redirects or explicit logouts */}
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
            
            /* Fallback dual button presentation layouts targeting completely unauthenticated visitors */
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