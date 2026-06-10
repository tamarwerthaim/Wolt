import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [restaurantsMap, setRestaurantsMap] = useState({});
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

        // 1. Fetch user's orders
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
        
        // Sort orders so the newest are shown first
        const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);

        if (sortedOrders.length > 0) {
          // 2. Fetch all restaurants to map restaurant names & images
          const restRes = await fetch('http://localhost:3000/api/restaurants');
          if (restRes.ok) {
            const restData = await restRes.json();
            const rMap = {};
            restData.forEach(r => {
              rMap[r.id] = r;
            });
            setRestaurantsMap(rMap);
          }

          // 3. Fetch product menus for each restaurant in the orders list to map product names & prices
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
    <div className="orders-container" style={{ direction: 'ltr' }}>
      <h2 className="orders-title">My Orders 📦</h2>
      
      <div className="user-welcome">
        <p>Welcome back, <strong>{currentUser?.name || currentUser?.username}</strong>! Here is your order history:</p>
      </div>

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

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">🍽️</div>
          <h3>No orders placed yet!</h3>
          <p>Hungry? Explore our premium restaurants and place your first order now.</p>
        </div>
      )}

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

            // Calculate order total price using the products map
            const orderTotal = order.items.reduce((sum, item) => {
              const product = productsMap[item.productId];
              const price = product ? Number(product.price) : 0;
              return sum + price * item.quantity;
            }, 0);

            return (
              <div key={order.id} className="order-card">
                {/* Restaurant Banner Header inside Card */}
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

                  <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-id-section">
                    <span className="order-id-label">Order Reference:</span>
                    <code className="order-id-code">#{order.id.slice(0, 8)}</code>
                  </div>

                  {/* Receipt Items List */}
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

                <div className="order-card-footer">
                  <span className="order-total-label">Total Paid</span>
                  <span className="order-total-value">₪{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;