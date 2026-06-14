// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';
import cryImage from '../assets/cry.png';

/* Main dashboard home page that shows the landing banner, restaurant marquee, and live search filtering results */
const Home = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const resultsRef = useRef(null);

  /* Component states to hold data arrays, loading indicators, and error notes */
  const [restaurants, setRestaurants] = useState([]);
  const [searchResults, setSearchResults] = useState({ restaurants: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Calculate the straight-line distance between two coordinates in kilometers */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;
    const R = 6371; /* Earth's radius in km */
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /* Sort the primary restaurant list by who is closest to the user's current location coordinates */
  const sortedRestaurants = React.useMemo(() => {
    const userLat = currentUser?.geolocation?.lat;
    const userLng = currentUser?.geolocation?.lng;

    /* If the user location data is missing, just return the default unsorted array list */
    if (userLat === undefined || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
      return restaurants;
    }

    return [...restaurants].sort((a, b) => {
      const aLat = a.geolocation?.lat;
      const aLng = a.geolocation?.lng;
      const bLat = b.geolocation?.lat;
      const bLng = b.geolocation?.lng;

      const distA = getDistance(userLat, userLng, aLat, aLng);
      const distB = getDistance(userLat, userLng, bLat, bLng);

      if (distA === null) return 1;
      if (distB === null) return -1;

      return distA - distB;
    });
  }, [restaurants, currentUser]);

  /* Sort the search results restaurant matches by proximity to the user's location values */
  const sortedSearchResultsRestaurants = React.useMemo(() => {
    const userLat = currentUser?.geolocation?.lat;
    const userLng = currentUser?.geolocation?.lng;

    if (userLat === undefined || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
      return searchResults.restaurants;
    }

    return [...searchResults.restaurants].sort((a, b) => {
      const aLat = a.geolocation?.lat;
      const aLng = a.geolocation?.lng;
      const bLat = b.geolocation?.lat;
      const bLng = b.geolocation?.lng;

      const distA = getDistance(userLat, userLng, aLat, aLng);
      const distB = getDistance(userLat, userLng, bLat, bLng);

      if (distA === null) return 1;
      if (distB === null) return -1;

      return distA - distB;
    });
  }, [searchResults.restaurants, currentUser]);

  /* Load all restaurants from the database when there is no active search query typing */
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
        setError('Error loading restaurants from the server');
      } finally {
        setLoading(false);
      }
    };

    if (!searchQuery) {
      fetchAllRestaurants();
    }
  }, [searchQuery]);

  /* Call the backend search endpoint query when a user types something into the navigation search bar */
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
        setError('Error performing search');
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

  /* Automatically scroll down smoothly to the results area when a search operation finishes loading */
  useEffect(() => {
    if (searchQuery && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchResults]);

  /* Redirect privileged administrator users to the add restaurant form view page link */
  const handleAddRestaurantClick = () => {
    if (currentUser?.isAdmin) {
      navigate('/admin/add-restaurant');
    }
  };

  /* Process restaurant upload image file paths or return a placeholder fallback link */
  const getRestaurantImage = (restaurant) => {
    if (restaurant.image) {
      if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
        return restaurant.image;
      }
      if (restaurant.image.startsWith('/uploads')) {
        return `http://localhost:3000${restaurant.image}`;
      }
      return `http://localhost:3000/uploads/${restaurant.image}`;
    }
    return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
  };

  /* Handle card click redirect routing to specific menu pages */
  const handleRestaurantClick = (restaurant) => {
    if (typeof restaurant.id === 'string') {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  const displayRestaurants = sortedRestaurants;

  /* Only run marquee scroll animations if there are enough restaurant card entries (> 4) */
  const shouldScroll = displayRestaurants.length > 4;

  return (
    <div className="home-container">

      {/* Primary visual hero presentation banner */}
      <div className="hero-banner">
        <h1 className="hero-text">
          WHAT IS YOUR
          <span className="hero-accent-word">?DUDA</span>
        </h1>
      </div>

      {/* Core content block container section located below the banner views */}
      <div className="home-content">

        {/* Render a floating create restaurant circle action button layout exclusively for admin status sessions */}
        {currentUser?.isAdmin && (
          <button className="add-restaurant-btn" onClick={handleAddRestaurantClick} title="Add New Restaurant">
            +
          </button>
        )}

        {searchQuery ? (

          /* --- Search filtering view layouts results --- */
          <div ref={resultsRef} className="search-results-section" style={{ direction: 'ltr' }}>
            <h2 className="results-title">
              Search results for: <span className="search-query-highlight">"{searchQuery}"</span>
            </h2>

            {/* Loading status notes and server network error fallback warnings alerts */}
            {loading && <div className="loading-spinner">🚴‍♂️ Searching for the best results...</div>}
            {error && <div className="error-message">❌ {error}</div>}

            {/* Empty matching search response placeholder layout view */}
            {!loading && !error && searchResults.restaurants.length === 0 && searchResults.products.length === 0 && (
              <div className="no-results">
                <img src={cryImage} alt="No results" className="no-results-img" />
                <p style={{ margin: 0 }}>No restaurants or dishes found matching your query. Try something else!</p>
              </div>
            )}

            {/* Found restaurant row grid maps */}
            {!loading && searchResults.restaurants.length > 0 && (
              <div className="results-group">
                <h3 className="group-title">Restaurants ({searchResults.restaurants.length})</h3>
                <div className="results-grid">
                  {sortedSearchResultsRestaurants.map((restaurant) => {
                    const dist = currentUser?.geolocation
                      ? getDistance(
                        currentUser.geolocation.lat,
                        currentUser.geolocation.lng,
                        restaurant.geolocation?.lat,
                        restaurant.geolocation?.lng
                      )
                      : null;
                    return (
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
                        <p>
                          {dist !== null
                            ? `📍 ${dist.toFixed(1)} km away`
                            : restaurant.geolocation
                              ? `📍 Location: ${restaurant.geolocation.lat}, ${restaurant.geolocation.lng}`
                              : '📍 No location'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Found product and menu dishes row grid maps */}
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
                            src={product.image
                              ? (product.image.startsWith('/uploads')
                                ? `http://localhost:3000${product.image}`
                                : `http://localhost:3000/uploads/${product.image}`)
                              : "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg"}
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
                          From: <span className="restaurant-ref-name">{product.restaurantName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (

          /* --- Default standard guest landing view layouts --- */
          <>
            {/* Infinite looping sliding horizontal marquee banner container tracks */}
            <div className="marquee-wrapper">
              <div className={`marquee-track ${shouldScroll ? 'enable-scroll' : ''}`}>

                {/* First replication track list mapping */}
                {displayRestaurants.map((restaurant, index) => {
                  const dist = currentUser?.geolocation
                    ? getDistance(
                      currentUser.geolocation.lat,
                      currentUser.geolocation.lng,
                      restaurant.geolocation?.lat,
                      restaurant.geolocation?.lng
                    )
                    : null;
                  return (
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
                      <p>
                        {restaurant.cuisine || (dist !== null
                          ? `📍 ${dist.toFixed(1)} km away`
                          : restaurant.geolocation
                            ? `📍 Location: ${restaurant.geolocation.lat}, ${restaurant.geolocation.lng}`
                            : '📍 No location')}
                      </p>
                    </div>
                  );
                })}

                {/* Second tracking replica copy block to achieve flawless loop transitions seamlessly */}
                {shouldScroll && displayRestaurants.map((restaurant, index) => {
                  const dist = currentUser?.geolocation
                    ? getDistance(
                      currentUser.geolocation.lat,
                      currentUser.geolocation.lng,
                      restaurant.geolocation?.lat,
                      restaurant.geolocation?.lng
                    )
                    : null;
                  return (
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
                      <p>
                        {restaurant.cuisine || (dist !== null
                          ? `📍 ${dist.toFixed(1)} km away`
                          : restaurant.geolocation
                            ? `📍 Location: ${restaurant.geolocation.lat}, ${restaurant.geolocation.lng}`
                            : '📍 No location')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complete main dashboard grid mapping out every registered supplier profile profile lists */}
            {sortedRestaurants.length > 0 && (
              <div className="all-restaurants-section" style={{ direction: 'ltr', marginTop: '60px' }}>
                <h2 className="all-rests-title">All Our Restaurants ({sortedRestaurants.length})</h2>
                <div className="all-rests-grid">
                  {sortedRestaurants.map((restaurant) => {
                    const dist = currentUser?.geolocation
                      ? getDistance(
                        currentUser.geolocation.lat,
                        currentUser.geolocation.lng,
                        restaurant.geolocation?.lat,
                        restaurant.geolocation?.lng
                      )
                      : null;
                    return (
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
                        <p>
                          {dist !== null
                            ? `📍 ${dist.toFixed(1)} km away`
                            : restaurant.geolocation
                              ? `📍 Location: ${restaurant.geolocation.lat}, ${restaurant.geolocation.lng}`
                              : '📍 No location'}
                        </p>
                      </div>
                    );
                  })}
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