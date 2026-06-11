// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';
import cryImage from '../assets/cry.png';

const Home = ({ currentUser }) => {
  /* Routing and URL navigation hooks */
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  /* Extract search term from URL or default to empty string */
  const searchQuery = searchParams.get('search') || '';
  
  /* Ref used to programmatically scroll down to search results */
  const resultsRef = useRef(null);

  /* State for storing the global list of restaurants */
  const [restaurants, setRestaurants] = useState([]);
  
  /* State for separating search results into categories */
  const [searchResults, setSearchResults] = useState({ restaurants: [], products: [] });
  
  /* Global status states for loading and error handling */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Calculate distance in kilometers using the Haversine formula */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;
    const R = 6371; 
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

  /* Sort all available restaurants based on user proximity */
  const sortedRestaurants = React.useMemo(() => {
    const userLat = currentUser?.geolocation?.lat;
    const userLng = currentUser?.geolocation?.lng;

    /* Return unsorted if user location data is missing or invalid */
    if (userLat === undefined || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
      return restaurants;
    }

    /* Sort array by ascending distance from the user */
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

  /* Sort active search results based on user proximity */
  const sortedSearchResultsRestaurants = React.useMemo(() => {
    const userLat = currentUser?.geolocation?.lat;
    const userLng = currentUser?.geolocation?.lng;

    /* Return unsorted search results if user location is unavailable */
    if (userLat === undefined || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
      return searchResults.restaurants;
    }

    /* Sort array by ascending distance from the user */
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

  /* Fetch all restaurants from backend on mount when no search query exists */
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

  /* Fetch dynamic search results whenever the user types a search query */
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`http://localhost:3000/api/search/${encodeURIComponent(searchQuery)}`);
        if (!res.ok) {
          /* Clear previous results on invalid or bad requests */
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
      /* Reset search state immediately when query is deleted */
      setSearchResults({ restaurants: [], products: [] });
    }
  }, [searchQuery]);

  /* Automatically scroll screen down to search results container when loaded */
  useEffect(() => {
    if (searchQuery && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchResults]);

  /* Navigate admin users to the restaurant creation dashboard */
  const handleAddRestaurantClick = () => {
    if (currentUser?.isAdmin) {
      navigate('/admin/add-restaurant');
    }
  };

  /* Process image path or return a static placeholder fallback URL */
  const getRestaurantImage = (restaurant) => {
    if (restaurant.image) {
      /* Use directly if it is an external absolute URL link */
      if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
        return restaurant.image;
      }
      /* Prepend local server URL while avoiding nested upload paths */
      if (restaurant.image.startsWith('/uploads')) {
        return `http://localhost:3000${restaurant.image}`;
      }
      return `http://localhost:3000/uploads/${restaurant.image}`;
    }
    return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
  };

  /* Route user to a specific detailed view of a selected restaurant */
  const handleRestaurantClick = (restaurant) => {
    if (typeof restaurant.id === 'string') {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  const displayRestaurants = sortedRestaurants;
  
  /* Trigger layout scrolling effect only if row contains more than 4 items */
  const shouldScroll = displayRestaurants.length > 4;

  return (
    <div className="home-container">

      {/* Hero banner presentation branding header */}
      <div className="hero-banner">
        <h1 className="hero-text">
          WHAT IS YOUR
          <span className="hero-accent-word">?DUDA</span>
        </h1>
      </div>

      {/* Main interactive section body */}
      <div className="home-content">
        
        {/* Render create button exclusively for administrative users */}
        {currentUser?.isAdmin && (
          <button className="add-restaurant-btn" onClick={handleAddRestaurantClick} title="Add New Restaurant">
            +
          </button>
        )}

        {/* View conditional rendering toggle split between search query and default view */}
        {searchQuery ? (
          
          /* Search results matching view container */
          <div ref={resultsRef} className="search-results-section">
            <h2 className="results-title">
              Search results for: <span className="search-query-highlight">"{searchQuery}"</span>
            </h2>

            {/* Status alerts for active loading and unexpected errors */}
            {loading && <div className="loading-spinner">🚴‍♂️ Searching for the best results...</div>}
            {error && <div className="error-message">❌ {error}</div>}

            {/* Empty state markup if search yielded zero database returns */}
            {!loading && !error && searchResults.restaurants.length === 0 && searchResults.products.length === 0 && (
              <div className="no-results">
                <img src={cryImage} alt="No results" className="no-results-img" />
                <p>No restaurants or dishes found matching your query. Try something else!</p>
              </div>
            )}

            {/* Section mapping out found restaurants */}
            {!loading && searchResults.restaurants.length > 0 && (
              <div className="results-group">
                <h3 className="group-title">Restaurants ({searchResults.restaurants.length})</h3>
                <div className="results-grid">
                  {sortedSearchResultsRestaurants.map((restaurant) => {
                    /* Calculate distance value inline for every loop element */
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
                        
                        {/* Display specific calculated mileage or fallback text metadata */}
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

            {/* Section mapping out individual matching dishes */}
            {!loading && searchResults.products.length > 0 && (
              <div className="results-group results-group-dishes">
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
          
          /* Default dashboard screen template layout when search is unused */
          <>
            {/* Infinite looping carousel element for highlighted restaurants */}
            <div className="marquee-wrapper">
              <div className={`marquee-track ${shouldScroll ? 'enable-scroll' : ''}`}>
                
                {/* First primary loop iteration of the slider data tracking row */}
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
                          <span className="home-fallback-emoji">🍔</span>
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
                
                {/* Second cloned loop iteration block to seamlessly connect scrolling gap boundaries */}
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
                          <span className="home-fallback-emoji">🍔</span>
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

            {/* Grid displaying the complete restaurant phone-book catalog index */}
            {sortedRestaurants.length > 0 && (
              <div className="all-restaurants-section">
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