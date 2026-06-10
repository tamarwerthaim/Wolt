import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant, onClick }) => {
  const navigate = useNavigate();

  const getRestaurantImage = (r) => {
    if (r.image) {
      if (r.image.startsWith('http')) {
        return r.image;
      }
      return `http://localhost:3000/uploads/${r.image}`;
    }
    return 'https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg';
  };

  const isRealRestaurant = typeof restaurant.id === 'string';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (isRealRestaurant) {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  return (
    <div 
      className={`restaurant-card ${isRealRestaurant ? 'clickable' : ''}`}
      onClick={handleClick}
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
        {restaurant.cuisine || 
          `📍 Location: ${restaurant.geolocation?.lat !== undefined ? restaurant.geolocation.lat : 0}, ${restaurant.geolocation?.lng !== undefined ? restaurant.geolocation.lng : 0}`
        }
      </p>
    </div>
  );
};

export default RestaurantCard;
