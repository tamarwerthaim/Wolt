import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegisterStyles.css';

const AddRestaurant = () => {
    const [name, setName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [prepTime, setPrepTime] = useState('15');
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

        if (!name || !restaurantImage || !lat || !lng || !prepTime) {
            setError('All fields are required! ');
            return;
        }

        const prepNum = parseInt(prepTime);
        if (isNaN(prepNum) || prepNum <= 0) {
            setError('Invalid preparation time.\nIt must be a valid number greater than zero.');
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude.\nIt must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude.\nIt must be a valid number between -180 and 180.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('prepTime', prepTime);
            // שולחים את הקובץ תחת השם 'restaurantImage' שהשרת יחפש
            formData.append('restaurantImage', restaurantImage);

            // 🔥 שליפת ה-Token של האדמין שנשמר בלוגין
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/restaurants', {
                method: 'POST',
                headers: {
                    // 🔥 הזרקת ה-Token כדי לעבור את חסימת ה-authenticateAdmin של מוריה
                    'Authorization': `Bearer ${token}`
                },
                body: formData // כששולחים FormData, הדפדפן מגדיר את ה-Content-Type אוטומטית!
            });

            // בדיקה אם השרת החזיר תוכן (כי מוריה משתמשת ב-res.status(201).send() ללא גוף)
            let data = {};
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add the restaurant.');
            }

            setSuccess('...Restaurant added successfully! Redirecting');

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
                <button className="back-button" onClick={() => navigate(-1)} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                {/* שילוב מושלם: הגודל והפונט של הלוגין, בצבע הכחול #00c2e8 מה-CSS שלך */}
                <h1 className="auth-heading wolt-brand-color">Add New Restaurant</h1>

                <form onSubmit={handleSubmit} noValidate>
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

                    {/* Preparation Time (minutes) */}
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