import React from 'react';
import './Orders.css';

const Orders = ({ currentUser }) => {
  // Since this page is wrapped in ProtectedRoute, currentUser is guaranteed to exist here

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders 📦</h2>
      
      <div className="user-welcome">
        <p>Welcome back, <strong>{currentUser?.username}</strong>! Here is your order history:</p>
      </div>

      {/* This placeholder container is where the real order history from the server will be mapped */}
      <div className="orders-list-placeholder">
        <p>Your dynamic order history from the server will be displayed here...</p>
      </div>
    </div>
  );
};

export default Orders;