import React from 'react';
import './MenuItem.css';

const MenuItem = ({ product, cart, onAdd, onRemove, restaurantId, restaurantName }) => {
    const productId = product.id || product._id;
    const cartItem = cart?.items?.find(item => item.productId === productId);
    const quantity = cartItem ? cartItem.quantity : 0;

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
        <div className="menu-item-card">
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
    );
};

export default MenuItem;
