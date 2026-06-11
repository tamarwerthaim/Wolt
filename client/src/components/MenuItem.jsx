import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuItem.css';

const MenuItem = ({ product, cart, onAdd, onRemove, restaurantId, restaurantName, currentUser }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempQuantity, setTempQuantity] = useState(1);

    const productId = product.id || product._id;
    const cartItem = cart?.items?.find(item => item.productId === productId);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleCardClick = () => {
        setTempQuantity(1);
        setIsModalOpen(true);
    };

    const handleCloseModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(false);
    };

    const handleIncrement = (e) => {
        e.stopPropagation();
        if (onAdd) {
            onAdd(product, restaurantId, restaurantName);
        }
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        if (onRemove) {
            onRemove(productId);
        }
    };

    const handleModalIncrement = (e) => {
        e.stopPropagation();
        setTempQuantity(prev => prev + 1);
    };

    const handleModalDecrement = (e) => {
        e.stopPropagation();
        setTempQuantity(prev => Math.max(1, prev - 1));
    };

    const handleAddToOrder = (e) => {
        e.stopPropagation();
        if (onAdd) {
            for (let i = 0; i < tempQuantity; i++) {
                onAdd(product, restaurantId, restaurantName);
            }
        }
        setIsModalOpen(false);
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

    return (
        <>
            <div className="menu-item-card" onClick={handleCardClick}>
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
                {/* צד שמאל: תמונה וכפתור פלוס או בורר כמות */}
                <div className="menu-item-image-wrapper">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="menu-item-image"
                    />
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

                {/* צד ימין: טקסט ומחיר */}
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

            {/* חלון פרטי מוצר (Modal) */}
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

                        <div className="product-modal-footer">
                            <button className="product-modal-add-btn" onClick={handleAddToOrder}>
                                להוסיף להזמנה ₪{(product.price * tempQuantity).toFixed(2)}
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
