import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FormStyles.css';

/* Component for adding a new product dish to a specific restaurant */
const AddProduct = () => {
    /* Get the unique restaurant ID from the URL path */
    const { id: restaurantId } = useParams();

    /* Form states to track input fields, images, and submission responses */
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    /* Scroll to the top when the page mounts so the user sees the title */
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    /* Create a local URL preview for the chosen image file */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setImagePreview(URL.createObjectURL(file));

            /* Clear the native input value so the same file can be re-uploaded if cleared */
            e.target.value = '';
        }
    };

    /* Remove the chosen image file and clear its preview state */
    const handleClearImage = () => {
        setProductImage(null);
        setImagePreview(null);
    };

    /* Handle form validation and upload product data using FormData */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        /* Simple frontend check to verify all inputs are filled */
        if (!name || !price || !description || !productImage) {
            setError('All fields are required!');
            return;
        }

        /* Validate that the price input is a real number above zero */
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            setError('Price must be a valid number greater than 0.');
            return;
        }

        try {
            /* Pack form fields into a FormData object to handle the image file upload */
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

            /* Wait 2 seconds before sending the user back to the restaurant page */
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

                <form onSubmit={handleSubmit} noValidate>

                    {/* Product name input field */}
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

                    {/* Price input field */}
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

                    {/* Description textarea field */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="description" className="auth-label">:Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="auth-input auth-textarea"
                            placeholder="Product description..."
                        />
                    </div>

                    {/* Product image upload and preview area */}
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

                        {/* Render preview image container if a file was selected */}
                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img
                                    src={imagePreview}
                                    alt="Product Image Preview"
                                    className="auth-product-preview"
                                />
                                <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Error and success message feedback displays */}
                    {error && <div className="auth-error-text">{error}</div>}
                    {success && <div className="auth-success-text">{success}</div>}

                    <button type="submit" className="auth-submit-button">
                        Add Product
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/restaurant/${restaurantId}`)}
                        className="auth-submit-button auth-cancel-button"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;