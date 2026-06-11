import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, isOpen, onClose, addToCart, removeFromCart, clearCart }) => {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackToMenu = () => {
    onClose();
    if (!location.pathname.startsWith('/restaurant/')) {
      navigate('/');
    }
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg";
    }
    if (image.startsWith('/uploads')) {
      return `http://localhost:3000${image}`;
    }
    return image;
  };

  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Close the cart when clicking on the backdrop overlay
  const handleBackdropClick = (e) => {
    if (e.target.className === 'cart-backdrop') {
      onClose();
    }
  };

  // Submit order to POST /api/orders
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to place your order.');
      onClose();
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: cart.restaurantId,
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order placed successfully! 🚀');
        clearCart();
        onClose();
        navigate('/orders');
      } else {
        if (response.status === 401 || response.status === 403) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          onClose();
          navigate('/login');
        } else {
          alert(data.error || 'Failed to place order. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-backdrop" onClick={handleBackdropClick}>
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">My Cart 🛒</h2>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {cart.items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p className="cart-empty-text">Your cart is empty...</p>
              <p className="cart-empty-subtext">Add delicious dishes from the menu to start an order!</p>
              <button className="cart-start-btn" onClick={handleBackToMenu}>
                Back to Menu 🍔
              </button>
            </div>
          ) : (
            <>
              <div className="cart-restaurant-info">
                <span className="restaurant-label">Ordering from:</span>
                <strong className="restaurant-name">{cart.restaurantName}</strong>
              </div>

              <div className="cart-items-list">
                {cart.items.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <span className="cart-item-price">₪{Number(item.price).toFixed(2)}</span>
                    </div>

                    <div className="cart-item-controls-wrapper">
                      <div className="cart-item-controls">
                        <button
                          className="cart-qty-btn decrease"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          -
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          className="cart-qty-btn increase"
                          onClick={() => addToCart(item, cart.restaurantId, cart.restaurantName)}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="cart-item-total">
                        ₪{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Total items ({totalItems})</span>
                  <span>₪{totalPrice.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row delivery">
                  <span>Delivery & Service</span>
                  <span className="delivery-free">Free 🛵</span>
                </div>
                <hr className="cart-divider" />
                <div className="cart-summary-row total">
                  <span>Total to pay</span>
                  <span>₪{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  className="cart-clear-btn" 
                  onClick={clearCart}
                  disabled={isSubmitting}
                >
                  Clear Cart 🗑️
                </button>
                <button 
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Checkout 🚀'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
