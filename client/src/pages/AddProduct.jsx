import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LoginRegisterStyles.css'; // שימוש בעיצוב הקיים של טפסים לקבלת מראה אחיד

const AddProduct = () => {
    const { id: restaurantId } = useParams(); // מזהה המסעדה מה-URL
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setImagePreview(URL.createObjectURL(file));

            // איפוס ערך ה-DOM של ה-Input
            e.target.value = '';
        }
    };

    const handleClearImage = () => {
        setProductImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !price || !description || !productImage) {
            setError('All fields are required!');
            return;
        }

        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            setError('Price must be a valid number greater than 0.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', numPrice);
            formData.append('description', description);
            formData.append('productImage', productImage);

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add the product.');
            }

            setSuccess('Product added successfully! Redirecting...');

            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Server error. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-heading wolt-brand-color">Add New Product</h1>

                <form onSubmit={handleSubmit}>
                    {/* שם המוצר */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="name" className="auth-label">:Product Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="auth-input"
                            placeholder="e.g., Double Burger, Chips"
                        />
                    </div>

                    {/* מחיר */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="price" className="auth-label">:Price (₪)</label>
                        <input
                            type="number"
                            step="any"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="auth-input"
                            placeholder="Price"
                        />
                    </div>

                    {/* תיאור */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="description" className="auth-label">:Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="auth-input"
                            placeholder="Product description..."
                            style={{ height: '80px', resize: 'none', padding: '12px' }}
                        />
                    </div>

                    {/* העלאת תמונת מוצר */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Upload Product Image</label>
                        <div className="auth-file-input-container">
                            <input
                                type="file"
                                id="productImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="auth-hidden-file-input"
                            />
                            <label htmlFor="productImage" className="auth-file-input-label">
                                {productImage ? `📸 ${productImage.name}` : '📁 Choose Product Image'}
                            </label>
                        </div>

                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img
                                    src={imagePreview}
                                    alt="Product Image Preview"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                    }}
                                />
                                <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* הודעות שגיאה או הצלחה */}
                    {error && <div className="auth-error-text">{error}</div>}
                    {success && <div className="auth-success-text">{success}</div>}

                    <button type="submit" className="auth-submit-button">
                        Add Product
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/restaurant/${restaurantId}`)}
                        className="auth-submit-button"
                        style={{ backgroundColor: '#ccc', marginTop: '10px' }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
