// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ currentUser }) => {
  const navigate = useNavigate();

  // נתונים זמניים למסעדות כדי שנראה את הסרט הנע עובד (לפי הדוגמה שלך)
  const mockRestaurants = [
    { id: 1, name: 'Burger King 🍔', cuisine: 'Burgers' },
    { id: 2, name: 'Rebar 🥤', cuisine: 'Drinks' },
    { id: 3, name: 'Sushi Bar 🥢', cuisine: 'Asian' },
    { id: 4, name: 'Papa Johns 🍕', cuisine: 'Pizza' },
    { id: 5, name: 'Deli Cream 🍦', cuisine: 'Ice Cream' },
    { id: 6, name: 'Wok Republic 🍜', cuisine: 'Asian' },
  ];

  const handleAddRestaurantClick = () => {
    if (currentUser?.isAdmin) {
      navigate('/admin/add-restaurant');
    }
  };

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
        
        {/* 2. רצועת המסעדות שזזה מעצמה מאוזן ולאט */}
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {/* ◄◄ הוספת השיכפול - פעם ראשונה של הרשימה */}
            {mockRestaurants.map((restaurant) => (
              <div key={`list1-${restaurant.id}`} className="restaurant-card">
                <div className="card-image-placeholder">🍔</div>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
              </div>
            ))}
            {/* ◄◄ הוספת השיכפול - פעם שנייה של הרשימה (עותק מדויק) */}
            {mockRestaurants.map((restaurant) => (
              <div key={`list2-${restaurant.id}`} className="restaurant-card">
                <div className="card-image-placeholder">🍔</div>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;