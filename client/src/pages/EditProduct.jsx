import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LoginRegisterStyles.css';

const EditProduct = () => {
    const { id: restaurantId, pld: productId } = useParams();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Failed to load product details.');
                }
                const data = await response.json();
                setName(data.name || '');
                setPrice(data.price?.toString() || '');
                setDescription(data.description || '');
                if (data.image) {
                    setExistingImage(data.image);
                    setImagePreview(data.image.startsWith('/uploads') ? `http://localhost:3000${data.image}` : data.image);
                }
            } catch (err) {
                setError(err.message || 'Error loading product details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [restaurantId, productId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setImagePreview(URL.createObjectURL(file));
            e.target.value = '';
        }
    };

    const handleClearImage = () => {
        setProductImage(null);
        if (existingImage) {
            setImagePreview(existingImage.startsWith('/uploads') ? `http://localhost:3000${existingImage}` : existingImage);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !price || !description) {
            setError('All fields except selecting a new image file are required!');
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

            if (productImage) {
                formData.append('productImage', productImage);
            } else {
                formData.append('image', existingImage);
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                let errorMsg = 'Failed to update product.';
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            setSuccess('Product updated successfully! Redirecting...');

            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Server error. Please try again.');
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
        if (!confirmDelete) return;

        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let errorMsg = 'Failed to delete product.';
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            setSuccess('Product deleted successfully! Redirecting...');

            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Server error. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                    <p style={{ color: '#00c1a1', fontSize: '18px', fontWeight: 'bold' }}>Loading Product Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="back-button" onClick={() => navigate(-1)} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <h1 className="auth-heading wolt-brand-color">Edit Product Details</h1>

                <form onSubmit={handleSubmit} noValidate>
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
                        <label className="auth-label">:Product Image</label>
                        <div className="auth-file-input-container">
                            <input
                                type="file"
                                id="productImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="auth-hidden-file-input"
                            />
                            <label htmlFor="productImage" className="auth-file-input-label">
                                {productImage ? `📸 ${productImage.name}` : '📁 Upload New Product Image'}
                            </label>
                        </div>

                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img 
                                    src={imagePreview} 
                                    alt="Product Preview" 
                                    style={{ 
                                        width: '150px', 
                                        height: '150px', 
                                        borderRadius: '12px', 
                                        objectFit: 'cover', 
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' 
                                    }} 
                                />
                                {productImage && (
                                    <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                        Revert to Original
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* הודעות שגיאה או הצלחה */}
                    {error && <div className="auth-error-text">{error}</div>}
                    {success && <div className="auth-success-text">{success}</div>}

                    <button type="submit" className="auth-submit-button">
                        Save Changes
                    </button>

                    <button 
                        type="button" 
                        onClick={handleDelete} 
                        className="auth-submit-button"
                        style={{ backgroundColor: '#ff4d4f', marginTop: '10px' }}
                    >
                        Delete Product
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

export default EditProduct;
