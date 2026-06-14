import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormStyles.css';

/* Component for creating and adding a new restaurant profile to the system */
const AddRestaurant = () => {
    /* Form input states for the restaurant details and image file */
    const [name, setName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [prepTime, setPrepTime] = useState('15');
    const [restaurantImage, setRestaurantImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    /* Handle file upload changes and generate a local URL for the image preview */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRestaurantImage(file);
            setImagePreview(URL.createObjectURL(file));

            /* Reset the input element value so the same file can be chosen again if cleared */
            e.target.value = '';
        }
    };

    /* Reset the selected image file and remove its preview from the screen */
    const handleClearImage = () => {
        setRestaurantImage(null);
        setImagePreview(null);
    };

    /* Validate the input values and send the form data to the server */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        /* Check that no required field is left empty */
        if (!name || !restaurantImage || !lat || !lng || !prepTime) {
            setError('All fields are required!');
            return;
        }

        /* Verify that preparation time is a real number above zero */
        const prepNum = parseInt(prepTime);
        if (isNaN(prepNum) || prepNum <= 0) {
            setError('Invalid preparation time.\nIt must be a valid number greater than zero.');
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        /* Validate that the coordinates fit within the proper geographical bounds */
        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude.\nIt must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude.\nIt must be a valid number between -180 and 180.');
            return;
        }

        try {
            /* Create a FormData object to easily send the text inputs and image file together */
            const formData = new FormData();
            formData.append('name', name);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('prepTime', prepTime);
            formData.append('restaurantImage', restaurantImage);

            /* Grab the logged-in admin authorization token from localStorage */
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/restaurants', {
                method: 'POST',
                headers: {
                    /* Attach the admin token to pass the backend protection middleware checks */
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            /* Parse the JSON response body only if the server returns a JSON content type header */
            let data = {};
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add the restaurant.');
            }

            setSuccess('Restaurant added successfully! Redirecting...');

            /* Wait 2 seconds before taking the admin user back to the home view dashboard */
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Server error. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                {/* Back button link that uses a safe internal vector navigation history jump */}
                <button className="back-button" onClick={() => navigate(-1)} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <svg polyline points="12 19 5 12 12 5"></svg>
                    </svg>
                </button>

                <h1 className="auth-heading wolt-brand-color">Add New Restaurant</h1>

                <form onSubmit={handleSubmit} noValidate>

                    {/* Restaurant name input field */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="name" className="auth-label">:Restaurant Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="auth-input"
                            placeholder="e.g., Moses, Japan Japan"
                        />
                    </div>

                    {/* Combined localization row container housing latitude and longitude coordinates fields */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Location</label>
                        <div className="auth-input-row">

                            {/* Latitude coordinate input field */}
                            <div className="auth-input-col">
                                <input
                                    type="number"
                                    step="any"
                                    id="lat"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                    className="auth-input"
                                    placeholder="Latitude (e.g., 32.0853)"
                                />
                            </div>

                            {/* Longitude coordinate input field */}
                            <div className="auth-input-col">
                                <input
                                    type="number"
                                    step="any"
                                    id="lng"
                                    value={lng}
                                    onChange={(e) => setLng(e.target.value)}
                                    className="auth-input"
                                    placeholder="Longitude (e.g., 34.7818)"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Order food preparation time input field */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="prepTime" className="auth-label">:Preparation Time (minutes)</label>
                        <input
                            type="number"
                            min="1"
                            id="prepTime"
                            value={prepTime}
                            onChange={(e) => setPrepTime(e.target.value)}
                            className="auth-input"
                            placeholder="Preparation time (e.g., 15)"
                        />
                    </div>

                    {/* Restaurant brand image file upload widget and preview layout logic */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Upload Restaurant Image</label>
                        <div className="auth-file-input-container">
                            <input
                                type="file"
                                id="restaurantImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="auth-hidden-file-input"
                            />
                            <label htmlFor="restaurantImage" className="auth-file-input-label">
                                {restaurantImage ? `📸 ${restaurantImage.name}` : '📁 Choose Restaurant Image'}
                            </label>
                        </div>

                        {/* Render preview image context window if a file has been selected */}
                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img src={imagePreview} alt="Restaurant Image Preview" className="auth-banner-preview" />
                                <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status feedback message blocks rendering errors and successes */}
                    {error && <div className="auth-error-text">{error}</div>}
                    {success && <div className="auth-success-text">{success}</div>}

                    <button type="submit" className="auth-submit-button">
                        Add Restaurant
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRestaurant;