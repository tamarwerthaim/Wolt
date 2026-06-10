import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegisterStyles.css';

const AddRestaurant = () => {
    const [name, setName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [restaurantImage, setRestaurantImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRestaurantImage(file);
            setImagePreview(URL.createObjectURL(file));

            // התיקון לבאג התמונה: מאפסים את ערך ה-DOM של ה-Input
            e.target.value = '';
        }
    };

    const handleClearImage = () => {
        setRestaurantImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !restaurantImage || !lat || !lng) {
            setError('Please provide a restaurant name, latitude, longitude, and a banner image.');
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude. It must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude. It must be a valid number between -180 and 180.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('restaurantImage', restaurantImage);

            const response = await fetch('http://localhost:3000/api/restaurants', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add the restaurant.');
            }

            setSuccess('Restaurant added successfully! Redirecting...');

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

                {/* שילוב מושלם: הגודל והפונט של הלוגין, בצבע הכחול #00c2e8 מה-CSS שלך */}
                <h1 className="auth-heading wolt-brand-color">Add New Restaurant</h1>

                <form onSubmit={handleSubmit}>
                    {/* שם המסעדה */}
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

                    {/* שדות מיקום משולבים */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Location</label>
                        <div className="auth-input-row">

                            {/* שדה Latitude */}
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

                            {/* שדה Longitude */}
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

                    {/* העלאת תמונת באנר */}
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

                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img src={imagePreview} alt="Restaurant Image Preview" className="auth-banner-preview" />
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
                        Add Restaurant
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRestaurant;