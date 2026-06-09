import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ currentUser }) => {
  const navigate = useNavigate();

  // Handle admin panel actions
  const handleAddRestaurantClick = () => {
    if (currentUser?.isAdmin) {
      console.log('Opening add restaurant modal...');
    }
  };

  return (
    <div className="home-container">
      <h2 className="home-title">Home - Nearby Restaurants 🍔</h2>
      
      {/* Strictly protect the button view - only rendered if the user is an admin */}
      {currentUser?.isAdmin && (
        <div className="admin-actions-container">
          <button onClick={handleAddRestaurantClick} className="admin-btn">
            + Add New Restaurant (Admin Only)
          </button>
        </div>
      )}

      {/* Container for fetching dynamic data from the server */}
      <div className="restaurants-list">
        <p>The dynamic restaurant list from the server will be displayed here...</p>
      </div>
    </div>
  );
};

export default Home;