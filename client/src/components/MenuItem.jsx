import React from 'react';
import './MenuItem.css';

const MenuItem = ({ product, onAdd }) => {
    const handleAddClick = (e) => {
        // מונע את מעבר הקליק לכרטיסייה עצמה אם יהיה עליה אירוע בעתיד
        e.stopPropagation();
        if (onAdd) {
            onAdd(product);
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
            {/* צד שמאל: תמונה וכפתור פלוס */}
            <div className="menu-item-image-wrapper">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="menu-item-image"
                />
                <button className="menu-item-add-btn" onClick={handleAddClick}>+</button>
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
