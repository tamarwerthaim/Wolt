import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MenuItem from '../components/MenuItem';
import './RestaurantDetails.css';

const RestaurantDetails = ({ currentUser, cart, addToCart, removeFromCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. פלטת הצבעים והפונטים של וולט הועברו ל-CSS הגלובלי והמקומי

    // 2. סטייטים לניהול הנתונים מהשרת
    const [restaurant, setRestaurant] = useState(null); // פרטי המסעדה
    const [products, setProducts] = useState([]); // מתחיל כמערך ריק
    const [loading, setLoading] = useState(true); // סטייט טעינה
    const [error, setError] = useState('');       // סטייט שגיאה

    // סטייטים לדירוג
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingStatus, setRatingStatus] = useState('');

    // אפקט משיכת הנתונים מהשרת
    useEffect(() => {
        const fetchRestaurantAndProducts = async () => {
            try {
                setLoading(true);
                setError('');

                // בקשת GET לפרטי המסעדה
                const resResponse = await fetch(`http://localhost:3000/api/restaurants/${id}`);
                if (!resResponse.ok) {
                    throw new Error('Failed to fetch restaurant details.');
                }
                const resData = await resResponse.json();
                setRestaurant(resData);

                // עדכון הדירוג של המשתמש הנוכחי אם הוא כבר דירג בעבר
                const currentUserId = localStorage.getItem('userId');
                if (currentUserId && resData.ratings && typeof resData.ratings === 'object' && !Array.isArray(resData.ratings)) {
                    const existingUserRating = resData.ratings[currentUserId];
                    if (existingUserRating) {
                        setUserRating(existingUserRating);
                    }
                }

                // בקשת GET למוצרי המסעדה
                const prodResponse = await fetch(`http://localhost:3000/api/restaurants/${id}/products`);
                if (!prodResponse.ok) {
                    throw new Error('Failed to fetch menu products for this restaurant.');
                }
                const prodData = await prodResponse.json();
                setProducts(prodData);
            } catch (err) {
                setError(err.message || 'Something went wrong while loading restaurant and menu.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRestaurantAndProducts();
        }
    }, [id]);

    // חישוב ממוצע הדירוגים של המסעדה
    const getAverageRating = () => {
        if (!restaurant || !restaurant.ratings) {
            return '—';
        }

        const scores = typeof restaurant.ratings === 'object' && !Array.isArray(restaurant.ratings)
            ? Object.values(restaurant.ratings)
            : restaurant.ratings;

        if (!scores || scores.length === 0) {
            return '—';
        }
        const sum = scores.reduce((total, score) => total + score, 0);
        return (sum / scores.length).toFixed(1);
    };

    const getRatingsCount = () => {
        if (!restaurant || !restaurant.ratings) {
            return 0;
        }
        return typeof restaurant.ratings === 'object' && !Array.isArray(restaurant.ratings)
            ? Object.keys(restaurant.ratings).length
            : restaurant.ratings.length;
    };

    // פונקציית שליחת דירוג
    const handleRate = async (score) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login, remembering to come back here with rating intent
            navigate('/login', { state: { from: location.pathname, openRating: true } });
            return;
        }

        try {
            setRatingStatus('Submitting rating...');
            const response = await fetch(`http://localhost:3000/api/restaurants/${id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit rating.');
            }

            setRatingStatus('Thank you for rating!');
            setUserRating(score);

            // רענון נתוני המסעדה מהשרת
            const resResponse = await fetch(`http://localhost:3000/api/restaurants/${id}`);
            if (resResponse.ok) {
                const resData = await resResponse.json();
                setRestaurant(resData);
            }
        } catch (err) {
            setRatingStatus(err.message || 'Error submitting rating.');
        }
    };

    // Calculate dynamic pickup and delivery times
    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
        if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
        if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const prepTime = restaurant?.prepTime || 15;
    const pickupStr = `Pickup ${prepTime}-${prepTime + 5} min`;

    const userLat = currentUser?.geolocation?.lat;
    const userLng = currentUser?.geolocation?.lng;
    const restLat = restaurant?.geolocation?.lat;
    const restLng = restaurant?.geolocation?.lng;

    let deliveryStr = 'Delivery 30-40 min'; // Fallback
    if (userLat !== undefined && userLng !== undefined && restLat !== undefined && restLng !== undefined &&
        userLat !== null && userLng !== null && restLat !== null && restLng !== null) {
        const distance = getDistance(userLat, userLng, restLat, restLng);
        if (distance !== null) {
            const travelTime = Math.round(distance * 3);
            const deliveryTime = travelTime + prepTime;
            deliveryStr = `Delivery ${deliveryTime}-${deliveryTime + 5} min`;
        }
    }

    return (
        <div className="details-container">
            <button className="back-button" onClick={() => navigate(-1)} title="Back">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
            </button>
            {/* חלק 1: הבאנר הענק */}
            <div className="details-banner-container">
                <img
                    src={restaurant?.image
                            ? `http://localhost:3000${restaurant.image}`
                            : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg'}
                    alt={restaurant?.name || 'Restaurant Banner'}
                    className="details-banner-img"
                />
                <div className="details-banner-overlay"></div>
            </div>

            {/* חלק 2: כרטיסיית הראש ה"צפה" */}
            <div className="details-header-card">
                {/* דירוגים - כעת בצד ימין */}
                <div className="details-ratings-section">
                    <div className="details-ratings-average">
                        {getAverageRating()}
                    </div>
                    <div className="details-ratings-count">
                        ⭐️ ({getRatingsCount()} ratings)
                    </div>

                    {/* בחירת כוכבים דינמית למשתמשים מחוברים / מנוטרלת למשתמשים אורחים */}
                    <div className="details-stars-row">
                        <span className="details-rate-label">Rate:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className={`details-star-btn ${star <= (hoverRating || userRating)
                                        ? 'details-star-active'
                                        : 'details-star-inactive'
                                    }`}
                                title={localStorage.getItem('token') ? `Rate ${star} stars` : 'Log in to rate'}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    {!localStorage.getItem('token') && (
                        <div className="details-login-to-rate" onClick={() => navigate('/login', { state: { from: location.pathname, openRating: true } })}>
                            Log in to rate
                        </div>
                    )}
                    {ratingStatus && <div className="details-rating-status">{ratingStatus}</div>}
                </div>

                {/* פרטי המסעדה - כעת בצד שמאל */}
                <div className="details-info-section">
                    <h1 className="details-restaurant-name">
                        {restaurant?.name || 'Restaurant Menu'}
                        {currentUser?.isAdmin && (
                            <button
                                className="edit-restaurant-btn"
                                onClick={() => navigate(`/restaurant/${id}/edit`)}
                                title="Edit Restaurant"
                            >
                                Edit Restaurant ✏️
                            </button>
                        )}
                    </h1>
                    <p className="details-restaurant-location">
                        {restaurant?.geolocation
                            ? `Location: (${restaurant.geolocation.lat}, ${restaurant.geolocation.lng})`
                            : `Viewing products for Restaurant ID: ${id}`
                        }
                    </p>

                    <div className="details-tags-row">
                        <div className="details-tag">{pickupStr}</div>
                        {localStorage.getItem('token') && <div className="details-tag">{deliveryStr}</div>}
                    </div>
                </div>
            </div>

            {/* חלק 3: רשימת המוצרים */}
            <div className="details-products-area">
                <div className="details-menu-header">
                    <h2 className="details-menu-title">The Entire Menu</h2>
                    {currentUser?.isAdmin && (
                        <button 
                            className="add-product-btn" 
                            onClick={() => navigate(`/restaurant/${id}/add-product`)}
                            title="Add New Product"
                        >
                            +
                        </button>
                    )}
                </div>

                {/* הצגת מצבי טעינה, שגיאה או תפריט ריק */}
                {loading && (
                    <div className="details-loading">
                        🚴‍♂️ Loading restaurant's delicious menu...
                    </div>
                )}

                {error && (
                    <div className="details-error">
                        ❌ Error: {error}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="details-empty-menu">
                        This restaurant hasn't added any dishes to the menu yet.
                    </div>
                )}

                {/* הגריד של המוצרים האמיתיים מהשרת */}
                {!loading && !error && products.length > 0 && (
                    <div className="details-products-grid">
                        {products.map(product => (
                            <MenuItem
                                key={product.id || product._id}
                                product={product}
                                cart={cart}
                                onAdd={addToCart}
                                onRemove={removeFromCart}
                                restaurantId={id}
                                restaurantName={restaurant?.name}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetails;