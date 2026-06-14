import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import cartImage from '../assets/cart.png';

/* Component that displays the user's past order history and handles order edits or deletions */
const Orders = ({ currentUser, setCart, setIsCartOpen }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [restaurantsMap, setRestaurantsMap] = useState({});
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* Ask for confirmation and send a DELETE request to completely remove an order */
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Authentication token not found. Please log in.");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        setSelectedOrder(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete the order.');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('A network error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* Load an existing order back into the global cart state to allow editing it */
  const handleEditOrder = (order) => {
    const newCart = {
      restaurantId: order.restaurantId,
      restaurantName: restaurantsMap[order.restaurantId]?.name || 'Restaurant',
      editingOrderId: order.id,
      items: order.items.map(item => {
        const product = productsMap[item.productId];
        return {
          productId: item.productId,
          name: product?.name || `Item ID: ${item.productId.slice(0, 6)}`,
          price: product ? Number(product.price) : 0,
          image: product?.image || '',
          quantity: item.quantity
        };
      })
    };

    setCart(newCart);
    setIsCartOpen(true);
    setSelectedOrder(null);
    navigate(`/restaurant/${order.restaurantId}`);
  };

  /* Fetch all orders, restaurants, and menu items when the page loads */
  useEffect(() => {
    console.log("Orders component mounted. Current User:", currentUser);
    const fetchOrderHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // 1. Fetch the user's order list from the server
        const ordersRes = await fetch('http://localhost:3000/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!ordersRes.ok) {
          throw new Error('Failed to fetch order history.');
        }

        const ordersData = await ordersRes.json();

        // Sort the list so the newest orders appear first
        const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);

        if (sortedOrders.length > 0) {
          // 2. Fetch all restaurants to easily match up names and images
          const restRes = await fetch('http://localhost:3000/api/restaurants');
          if (restRes.ok) {
            const restData = await restRes.json();
            const rMap = {};
            restData.forEach(r => {
              rMap[r.id] = r;
            });
            setRestaurantsMap(rMap);
          }

          // 3. Get the product menus for these restaurants to match item names and prices
          const uniqueRestaurantIds = [...new Set(sortedOrders.map(o => o.restaurantId))];
          const pMap = {};

          await Promise.all(uniqueRestaurantIds.map(async (restId) => {
            try {
              const prodRes = await fetch(`http://localhost:3000/api/restaurants/${restId}/products`);
              if (prodRes.ok) {
                const prodData = await prodRes.json();
                prodData.forEach(p => {
                  pMap[p.id || p._id] = p;
                });
              }
            } catch (err) {
              console.error(`Failed to fetch menu items for restaurant ${restId}:`, err);
            }
          }));

          setProductsMap(pMap);
        }

      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Something went wrong while loading orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  return (
    <div className="orders-container">

      {/* Back button to return to the home dashboard page */}
      <button className="back-button" onClick={() => navigate('/')} title="Back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      {/* Top greeting header section with welcome message */}
      <div className="orders-top-section">
        <div className="orders-top-left">
          <h2 className="orders-title">My Orders</h2>
          <div className="user-welcome">
            <p>Welcome back, <strong>{currentUser?.name || currentUser?.username}</strong>! Here is your order history:</p>
          </div>
        </div>
        <img src={cartImage} alt="Cart" className="orders-hero-cart-img" />
      </div>

      {/* Loading and error status display messages feedback */}
      {loading && (
        <div className="orders-status-msg loading">
          🚴‍♂️ Loading your orders history...
        </div>
      )}

      {error && (
        <div className="orders-status-msg error">
          ❌ Error: {error}
        </div>
      )}

      {/* Empty state template display if the user has no orders inside the array list */}
      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">🍽️</div>
          <h3>No orders placed yet!</h3>
          <p>Hungry? Explore our premium restaurants and place your first order now.</p>
        </div>
      )}

      {/* Render list container mapping out individual past order cards */}
      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const restaurant = restaurantsMap[order.restaurantId];
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const orderTime = new Date(order.createdAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            });

            // Add up the total price of the order using our products map lookup
            const orderTotal = order.items.reduce((sum, item) => {
              const product = productsMap[item.productId];
              const price = product ? Number(product.price) : 0;
              return sum + price * item.quantity;
            }, 0);

            return (
              <div
                key={order.id}
                className="order-card"
                onClick={() => {
                  console.log("Order card clicked!", order);
                  setSelectedOrder(order);
                }}
              >
                {/* Card header showing restaurant info and order timestamp */}
                <div className="order-card-header">
                  <div className="order-restaurant-details">
                    <img
                      src={restaurant?.image ? `http://localhost:3000${restaurant.image}` : 'https://imagedelivery.net/az7y0_0U1W8u7D7G7H8d/768x512/wolt.com/dae31a1a-4712-4d7a-85d6-3e4b3e8e2e60.jpg'}
                      alt={restaurant?.name || 'Restaurant'}
                      className="order-restaurant-img"
                    />
                    <div className="order-restaurant-meta">
                      <h3 className="order-restaurant-name">{restaurant?.name || 'Premium Restaurant'}</h3>
                      <span className="order-timestamp">{orderDate} at {orderTime}</span>
                    </div>
                  </div>
                </div>

                {/* Card body area showing references and a short receipt layout summary */}
                <div className="order-card-body">
                  <div className="order-id-section">
                    <span className="order-id-label">Order Reference:</span>
                    <code className="order-id-code">#{order.id.slice(0, 8)}</code>
                  </div>

                  {/* Breakdown of the items in this receipt card */}
                  <div className="order-receipt">
                    <h4 className="receipt-title">Receipt Breakdown</h4>
                    <div className="receipt-items">
                      {order.items.map((item) => {
                        const product = productsMap[item.productId];
                        const unitPrice = product ? Number(product.price) : 0;
                        const subtotal = unitPrice * item.quantity;

                        return (
                          <div key={item.productId} className="receipt-item-row">
                            <span className="receipt-item-name">
                              <span className="receipt-item-qty">{item.quantity}x</span> {product?.name || `Item ID: ${item.productId.slice(0, 6)}`}
                            </span>
                            <span className="receipt-item-subtotal">₪{subtotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card footer displaying the final calculated price total */}
                <div className="order-card-footer">
                  <span className="order-total-label">Total Paid</span>
                  <span className="order-total-value">₪{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed popup modal overlay displaying extra records for a selected order card */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={(e) => {
          if (e.target.className === 'order-modal-backdrop') setSelectedOrder(null);
        }}>
          <div className="order-modal-content">
            <button className="order-modal-close-btn" onClick={() => setSelectedOrder(null)} aria-label="Close modal">
              ✕
            </button>

            <div className="order-modal-header">
              <h2 className="modal-title">Order Details</h2>
            </div>

            <div className="order-modal-body">
              {(() => {
                const restaurant = restaurantsMap[selectedOrder.restaurantId];
                const orderDate = new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const orderTime = new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const orderTotal = selectedOrder.items.reduce((sum, item) => {
                  const product = productsMap[item.productId];
                  const price = product ? Number(product.price) : 0;
                  return sum + price * item.quantity;
                }, 0);

                return (
                  <>
                    {/* Modal body restaurant summary context fields */}
                    <div className="modal-restaurant-section">
                      <h3 className="modal-restaurant-name">{restaurant?.name || 'Premium Restaurant'}</h3>
                      <span className="modal-timestamp">{orderDate} at {orderTime}</span>
                    </div>

                    <div className="modal-reference-row">
                      <span className="modal-reference-label">Reference:</span>
                      <code className="modal-reference-code">#{selectedOrder.id}</code>
                    </div>

                    {/* Full detail list mapping out item rows and quantity multipliers inside the modal */}
                    <div className="modal-items-section">
                      <h4 className="modal-items-title">Receipt Breakdown</h4>
                      <div className="modal-items-list">
                        {selectedOrder.items.map((item) => {
                          const product = productsMap[item.productId];
                          const unitPrice = product ? Number(product.price) : 0;
                          const subtotal = unitPrice * item.quantity;

                          return (
                            <div key={item.productId} className="modal-item-row">
                              <span className="modal-item-name">
                                <span className="modal-item-qty">{item.quantity}x</span> {product?.name || `Item ID: ${item.productId.slice(0, 6)}`}
                              </span>
                              <span className="modal-item-subtotal">₪{subtotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="modal-total-row">
                      <span className="modal-total-label">Total Paid:</span>
                      <span className="modal-total-value">₪{orderTotal.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal action toolbar layouts handling delete or edit modifiers redirects */}
            <div className="order-modal-actions">
              <button
                className="order-modal-btn edit"
                onClick={() => handleEditOrder(selectedOrder)}
                disabled={isDeleting}
              >
                Edit Order
              </button>
              <button
                className="order-modal-btn delete"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;