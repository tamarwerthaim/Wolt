import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MenuItem.css';

/* Component for a single food item card and its details modal window */
const MenuItem = ({ product, cart, onAdd, onRemove, restaurantId, restaurantName, currentUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const productId = product.id || product._id;

    /* Local states for managing the modal view and item counts inside it */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempQuantity, setTempQuantity] = useState(1);

    /* Find if this item is already inside the cart to show its current count */
    const cartItem = cart?.items?.find(item => item.productId === productId);
    const quantity = cartItem ? cartItem.quantity : 0;

    /* Open the modal automatically if someone shares a link with the product ID in the URL params */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('product') === productId) {
            setIsModalOpen(true);
            setTempQuantity(quantity > 0 ? quantity : 1);
        } else {
            setIsModalOpen(false);
        }
    }, [location.search, productId, quantity]);

    /* Open the modal view when the user clicks anywhere on the food card container */
    const handleCardClick = () => {
        setTempQuantity(quantity > 0 ? quantity : 1);
        setIsModalOpen(true);
    };

    /* Close the modal view and clean up the product parameters from the URL path */
    const handleCloseModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(false);
        const params = new URLSearchParams(location.search);
        if (params.has('product')) {
            params.delete('product');
            const newSearch = params.toString();
            navigate(newSearch ? `?${newSearch}` : location.pathname, { replace: true });
        }
    };

    /* Add exactly one item unit to the cart directly from the main card view layout */
    const handleIncrement = (e) => {
        e.stopPropagation();
        if (onAdd) {
            onAdd(product, restaurantId, restaurantName);
        }
    };

    /* Remove or decrease item quantity thresholds from the main card view layout */
    const handleDecrement = (e) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove(productId);
        }
    };

    /* Increase the local temporary item count inside the popup modal box context */
    const handleModalIncrement = (e) => {
        e.stopPropagation();
        setTempQuantity(prev => prev + 1);
    };

    /* Decrease the local temporary item count inside the modal box but do not go under 1 */
    const handleModalDecrement = (e) => {
        e.stopPropagation();
        setTempQuantity(prev => Math.max(1, prev - 1));
    };

    /* Save selections made inside the modal view by tracking changes and syncing with the main cart */
    const handleAddToOrder = (e) => {
        e.stopPropagation();
        if (onAdd) {
            const diff = tempQuantity - quantity;
            if (diff > 0) {
                /* Loop operation adding missing items into sequence collections */
                for (let i = 0; i < diff; i++) {
                    onAdd(product, restaurantId, restaurantName);
                }
            } else if (diff < 0) {
                /* Loop operation removing extra item units cleanly */
                if (onRemove) {
                    for (let i = 0; i < Math.abs(diff); i++) {
                        onRemove(productId);
                    }
                }
            }
        }
        setIsModalOpen(false);

        /* Clean up shared URL parameters immediately after updating selection changes */
        const params = new URLSearchParams(location.search);
        if (params.has('product')) {
            params.delete('product');
            const newSearch = params.toString();
            navigate(newSearch ? `?${newSearch}` : location.pathname, { replace: true });
        }
    };

    /* Small utility helper to process direct image upload paths or provide fallbacks */
    const getImageUrl = (image) => {
        if (!image) {
            return "https://t3.ftcdn.net/jpg/05/85/86/44/360_F_585864419_9J5wE4V0zN6lH1N19p7FvjVp0O5XFpI5.jpg";
        }
        if (image.startsWith('/uploads')) {
            return `http://localhost:3000${image}`;
        }
        return image;
    };

    return (
        <>
            <div className="menu-item-card" onClick={handleCardClick}>
                {/* Show the editing button route link exclusively if admin status flags verify true */}
                {currentUser?.isAdmin && (
                    <button
                        className="menu-item-edit-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/restaurant/${restaurantId}/product/${productId}/edit`);
                        }}
                        title="Edit Product"
                    >
                        ✏️
                    </button>
                )}

                {/* Left side layout area: food graphic element preview and quantitative toolbars */}
                <div className="menu-item-image-wrapper">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="menu-item-image"
                    />
                    {/* Toggle between simple additive buttons and multi-selector quantity fields dynamically */}
                    {quantity > 0 ? (
                        <div className="menu-item-qty-selector" onClick={(e) => e.stopPropagation()}>
                            <button className="menu-item-qty-btn" onClick={handleIncrement}>+</button>
                            <span className="menu-item-qty-val">{quantity}</span>
                            <button className="menu-item-qty-btn" onClick={handleDecrement}>-</button>
                        </div>
                    ) : (
                        <button className="menu-item-add-btn" onClick={handleIncrement}>+</button>
                    )}
                </div>

                {/* Right side layout area: textual product information summary and price rows */}
                <div className="menu-item-text-wrapper">
                    <h3 className="menu-item-name">
                        {product.name}
                    </h3>
                    <p className="menu-item-desc">
                        {product.description || 'No description available for this delicious dish.'}
                    </p>
                    <div className="menu-item-price-wrapper">
                        <span className="menu-item-price">
                            ₪{Number(product.price).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Detailed food product popup modal overlay view container */}
            {isModalOpen && (
                <div className="product-modal-backdrop" onClick={handleCloseModal}>
                    <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="product-modal-close-btn" onClick={handleCloseModal} aria-label="Close modal">
                            ✕
                        </button>

                        <div className="product-modal-image-wrapper">
                            <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="product-modal-image"
                            />
                        </div>

                        <h2 className="product-modal-title">{product.name}</h2>
                        <p className="product-modal-price">₪{Number(product.price).toFixed(2)}</p>

                        {product.description && (
                            <p className="product-modal-description">{product.description}</p>
                        )}

                        {/* Modal action toolbar layout footer pairing temporary state counts with checkout updates */}
                        <div className="product-modal-footer">
                            <button className="product-modal-add-btn" onClick={handleAddToOrder}>
                                ₪{(product.price * tempQuantity).toFixed(2)} {quantity > 0 ? 'Update cart' : 'Add to cart'}
                            </button>

                            <div className="product-modal-qty-selector">
                                <button className="product-modal-qty-btn" onClick={handleModalIncrement}>+</button>
                                <span className="product-modal-qty-val">{tempQuantity}</span>
                                <button className="product-modal-qty-btn" onClick={handleModalDecrement}>-</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MenuItem;