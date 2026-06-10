// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';

const Home = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const resultsRef = useRef(null);

  const [restaurants, setRestaurants] = useState([]);
  const [searchResults, setSearchResults] = useState({ restaurants: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. טעינת כל המסעדות עבור הרצועה ורשימת כל המסעדות
  useEffect(() => {
    const fetchAllRestaurants = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('http://localhost:3000/api/restaurants');
        if (!res.ok) throw new Error('Failed to fetch restaurants');
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('שגיאה בטעינת המסעדות מהשרת');
      } finally {
        setLoading(false);
      }
    };

    if (!searchQuery) {
      fetchAllRestaurants();
    }
  }, [searchQuery]);

  // 2. ביצוע חיפוש מול השרת כאשר יש שאילתה פעילה
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`http://localhost:3000/api/search/${encodeURIComponent(searchQuery)}`);
        if (!res.ok) {
          if (res.status === 400) {
            setSearchResults({ restaurants: [], products: [] });
            return;
          }
          throw new Error('Failed to fetch search results');
        }
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError('שגיאה בביצוע החיפוש');
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    } else {
      setSearchResults({ restaurants: [], products: [] });
    }
  }, [searchQuery]);

  // 3. גלילה חלקה לתוצאות החיפוש כאשר הן מתקבלות
  useEffect(() => {
    if (searchQuery && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchResults]);

  const handleAddRestaurantClick = () => {
    if (currentUser?.isAdmin) {
      navigate('/admin/add-restaurant');
    }
  };

  const getRestaurantImage = (restaurant) => {
    if (restaurant.image) {
      return `http://localhost:3000/uploads/${restaurant.image}`;
    }
    return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
  };

  const handleRestaurantClick = (restaurant) => {
    if (typeof restaurant.id === 'string') {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  // נתונים זמניים למסעדות כדי שהסרט הנע לא יהיה ריק אם ה-DB עדיין ריק
  const displayRestaurants = restaurants.length > 0 ? restaurants : [
    { id: 1, name: 'Burger King 🍔', cuisine: 'Burgers', image: '' },
    { id: 2, name: 'Rebar 🥤', cuisine: 'Drinks', image: '' },
    { id: 3, name: 'Sushi Bar 🥢', cuisine: 'Asian', image: '' },
    { id: 4, name: 'Papa Johns 🍕', cuisine: 'Pizza', image: '' },
    { id: 5, name: 'Deli Cream 🍦', cuisine: 'Ice Cream', image: '' },
    { id: 6, name: 'Wok Republic 🍜', cuisine: 'Asian', image: '' },
  ];

  return (
    <div className="home-container">
      
      {/* ה-Hero הבאנר התכלת */}
      <div className="hero-banner">
        <h1 className="hero-text">
          WHAT IS YOUR
          <span className="hero-accent-word">?DUDA</span>
        </h1>
      </div>

      {/* אזור התוכן שמתחת לבאנר */}
      <div className="home-content">
        {currentUser?.isAdmin && (
          <button className="add-restaurant-btn" onClick={handleAddRestaurantClick} title="Add New Restaurant">
            +
          </button>
        )}

        {searchQuery ? (
          /* --- תצוגת תוצאות חיפוש --- */
          <div ref={resultsRef} className="search-results-section" style={{ direction: 'ltr' }}>
            <h2 className="results-title">
              Search results for: <span className="search-query-highlight">"{searchQuery}"</span>
            </h2>

            {loading && <div className="loading-spinner">🚴‍♂️ Searching for the best results...</div>}
            {error && <div className="error-message">❌ {error}</div>}

            {!loading && !error && searchResults.restaurants.length === 0 && searchResults.products.length === 0 && (
              <div className="no-results">
                No restaurants or dishes found matching your query. Try something else!
              </div>
            )}

            {/* קבוצת מסעדות שנמצאו */}
            {!loading && searchResults.restaurants.length > 0 && (
              <div className="results-group">
                <h3 className="group-title">Restaurants ({searchResults.restaurants.length})</h3>
                <div className="results-grid">
                  {searchResults.restaurants.map((restaurant) => (
                    <div 
                      key={restaurant.id} 
                      className="restaurant-card clickable"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="card-image-placeholder">
                        <img 
                          src={getRestaurantImage(restaurant)} 
                          alt={restaurant.name} 
                          className="restaurant-card-img"
                        />
                      </div>
                      <h3>{restaurant.name}</h3>
                      <p>📍 Location: {restaurant.geolocation?.lat}, {restaurant.geolocation?.lng}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* קבוצת מנות שנמצאו */}
            {!loading && searchResults.products.length > 0 && (
              <div className="results-group" style={{ marginTop: '40px' }}>
                <h3 className="group-title">Menu Items ({searchResults.products.length})</h3>
                <div className="results-grid">
                  {searchResults.products.map((product) => (
                    <div 
                      key={product.id} 
                      className="product-result-card"
                      onClick={() => navigate(`/restaurant/${product.restaurantId}`)}
                    >
                      <div className="product-card-header">
                        <div className="product-image-container">
                          <img 
                            src={product.image ? `http://localhost:3000/uploads/${product.image}` : "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg"} 
                            alt={product.name} 
                            className="product-card-img"
                          />
                        </div>
                        <span className="product-price">₪{Number(product.price).toFixed(2)}</span>
                      </div>
                      <div className="product-card-body">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description || 'No description available for this dish.'}</p>
                        <div className="product-restaurant-ref">
                          🏠 From: <span className="restaurant-ref-name">{product.restaurantName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- עמוד הבית הרגיל --- */
          <>
            {/* רצועת המסעדות שזזה מעצמה מאוזן ולאט */}
            <div className="marquee-wrapper">
              <div className="marquee-track">
                {/* הוספת השיכפול - פעם ראשונה של הרשימה */}
                {displayRestaurants.map((restaurant, index) => (
                  <div 
                    key={`list1-${restaurant.id}-${index}`} 
                    className={`restaurant-card ${typeof restaurant.id === 'string' ? 'clickable' : ''}`}
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <div className="card-image-placeholder">
                      {restaurant.image ? (
                        <img 
                          src={getRestaurantImage(restaurant)} 
                          alt={restaurant.name} 
                          className="restaurant-card-img"
                        />
                      ) : (
                        <span style={{ fontSize: '40px' }}>🍔</span>
                      )}
                    </div>
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine || `📍 מיקום: ${restaurant.geolocation?.lat}, ${restaurant.geolocation?.lng}`}</p>
                  </div>
                ))}
                {/* הוספת השיכפול - פעם שנייה של הרשימה (עותק מדויק) */}
                {displayRestaurants.map((restaurant, index) => (
                  <div 
                    key={`list2-${restaurant.id}-${index}`} 
                    className={`restaurant-card ${typeof restaurant.id === 'string' ? 'clickable' : ''}`}
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <div className="card-image-placeholder">
                      {restaurant.image ? (
                        <img 
                          src={getRestaurantImage(restaurant)} 
                          alt={restaurant.name} 
                          className="restaurant-card-img"
                        />
                      ) : (
                        <span style={{ fontSize: '40px' }}>🍔</span>
                      )}
                    </div>
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine || `📍 מיקום: ${restaurant.geolocation?.lat}, ${restaurant.geolocation?.lng}`}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* רשימת כל המסעדות בבלוקים מסודרים לגישה נוחה */}
            {restaurants.length > 0 && (
              <div className="all-restaurants-section" style={{ direction: 'rtl', marginTop: '60px' }}>
                <h2 className="all-rests-title">כל המסעדות שלנו ({restaurants.length})</h2>
                <div className="all-rests-grid">
                  {restaurants.map((restaurant) => (
                    <div 
                      key={restaurant.id} 
                      className="restaurant-card clickable"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <div className="card-image-placeholder">
                        <img 
                          src={getRestaurantImage(restaurant)} 
                          alt={restaurant.name} 
                          className="restaurant-card-img"
                        />
                      </div>
                      <h3>{restaurant.name}</h3>
                      <p>📍 מיקום: {restaurant.geolocation?.lat}, {restaurant.geolocation?.lng}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Home;