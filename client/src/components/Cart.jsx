import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Cart.css';

/* Main Cart drawer component that handles ordering logic and cart modifications */
const Cart = ({ cart, isOpen, onClose, addToCart, removeFromCart, clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /* State to prevent multiple clicks while waiting for the server response */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Do not render anything if the cart drawer is closed */
  if (!isOpen) return null;

  /* Closes the cart and takes the user back to the home page if needed */
  const handleBackToMenu = () => {
    onClose();
    if (!location.pathname.startsWith('/restaurant/')) {
      navigate('/');
    }
  };

  /* Handles the minus button click, with extra checks if editing a saved order */
  const handleDecrease = async (productId, currentQuantity) => {
    /* If it is the last item of an existing order, ask the user if they want to delete the order entirely */
    if (cart.items.length === 1 && currentQuantity === 1 && cart.editingOrderId) {
      const confirmDelete = window.confirm("An order must have at least one item. Would you like to delete this order entirely from history?");
      if (confirmDelete) {
        const token = localStorage.getItem('token');
        if (!token) {
          alert("Session expired. Please log in.");
          return;
        }
        setIsSubmitting(true);
        try {
          /* Send a DELETE request to remove the entire order from the database */
          const res = await fetch(`http://localhost:3000/api/orders/${cart.editingOrderId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            clearCart();
            onClose();
            navigate('/orders');
          } else {
            const errData = await res.json().catch(() => ({}));
            alert(errData.error || "Failed to delete the order.");
          }
        } catch (err) {
          console.error("Error deleting order:", err);
          alert("A network error occurred.");
        } finally {
          setIsSubmitting(false);
        }
      }
      return;
    }
    /* Default behavior: just lower the quantity by 1 */
    removeFromCart(productId);
  };

  /* Clears the cart or handles order deletion prompts if editing a saved order */
  const handleClearCartClick = async () => {
    if (cart.editingOrderId) {
      const confirmDelete = window.confirm(
        "You are editing an existing order. Would you like to delete this order entirely from history?\n\n" +
        "• Click 'OK' to delete the order entirely.\n" +
        "• Click 'Cancel' to keep the original order unchanged and just discard your current edits."
      );
      if (confirmDelete) {
        const token = localStorage.getItem('token');
        if (!token) {
          alert("Session expired. Please log in.");
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await fetch(`http://localhost:3000/api/orders/${cart.editingOrderId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            clearCart();
            onClose();
            navigate('/orders');
          } else {
            const errData = await res.json().catch(() => ({}));
            alert(errData.error || "Failed to delete the order.");
          }
        } catch (err) {
          console.error("Error deleting order:", err);
          alert("A network error occurred.");
        } finally {
          setIsSubmitting(false);
        }
      } else {
        /* Just reset the local cart state and close it without deleting the order from backend */
        clearCart();
        onClose();
      }
      return;
    }
    /* Default behavior: empty the cart state directly */
    clearCart();
  };

  /* Helper function to construct full image paths or return a placeholder fallback link */
  const getImageUrl = (image) => {
    if (!image) {
      return "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg";
    }
    if (image.startsWith('/uploads')) {
      return `http://localhost:3000${image}`;
    }
    return image;
  };

  /* Calculate total item count and overall price sum using array reduce counters */
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  /* Closes the cart drawer automatically when clicking on the outside blurry overlay background */
  const handleBackdropClick = (e) => {
    if (e.target.className === 'cart-backdrop') {
      onClose();
    }
  };

  /* Sends the final order data to the backend server (creates a new order or updates an old one) */
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
      /* Choose the API path and request type depending on whether we are creating or editing an order */
      const url = cart.editingOrderId
        ? `http://localhost:3000/api/orders/${cart.editingOrderId}`
        : 'http://localhost:3000/api/orders';
      const method = cart.editingOrderId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: cart.restaurantId,
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price, // Snapshot product price at checkout time to prevent future menu changes from altering order history
            name: item.name     // Snapshot product name at checkout time to prevent future menu deletions from altering order history
          }))
        })
      });

      let data = {};
      if (response.status !== 204) {
        data = await response.json().catch(() => ({}));
      }

      if (response.ok) {
        clearCart();
        onClose();
        navigate('/order-success');
      } else {
        /* Check if the user token is expired or unauthorized and boot them back to login page */
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

        {/* Header section with title text and close button trigger */}
        <div className="cart-header">
          <h2 className="cart-title">{cart.editingOrderId ? '✏️ Edit Order' : '🛒 My Cart'}</h2>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Main interactive drawer container body */}
        <div className="cart-content">
          {cart.items.length === 0 ? (

            /* Empty state template display layout */
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p className="cart-empty-text">Your cart is empty...</p>
              <p className="cart-empty-subtext">Add delicious dishes from the menu to start an order!</p>
              <button className="cart-start-btn" onClick={handleBackToMenu}>
                Back to Menu 🍔
              </button>
            </div>
          ) : (

            /* Active shopping cart list and price summaries */
            <>
              {/* Restaurant source identifier badge wrapper */}
              <div className="cart-restaurant-info">
                <span className="restaurant-label">Ordering from:</span>
                <strong className="restaurant-name">{cart.restaurantName}</strong>
              </div>

              {/* Scrollable list mapping out the products inside the cart */}
              <div className="cart-items-list">
                {cart.items.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="cart-item-img"
                    />

                    {/* Item title information and single unit values */}
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <span className="cart-item-price">₪{Number(item.price).toFixed(2)}</span>
                    </div>

                    {/* Quantity calculation controllers and sum totals for single rows */}
                    <div className="cart-item-controls-wrapper">
                      <div className="cart-item-controls">
                        <button
                          className="cart-qty-btn decrease"
                          onClick={() => handleDecrease(item.productId, item.quantity)}
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

              {/* Pricing breakdown summary rows */}
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

              {/* Footer action buttons handling order submit operations */}
              <div className="cart-actions">
                <button
                  className="cart-clear-btn"
                  onClick={handleClearCartClick}
                  disabled={isSubmitting}
                >
                  Clear Cart
                </button>
                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : (cart.editingOrderId ? 'Update Order' : 'Proceed to Checkout')}
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