import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LoginRegisterStyles.css';

const EditRestaurant = () => {
    const { id: restaurantId } = useParams();
    const [name, setName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [prepTime, setPrepTime] = useState('15');
    const [restaurantImage, setRestaurantImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}`);
                if (!response.ok) {
                    throw new Error('Failed to load restaurant details.');
                }
                const data = await response.json();
                setName(data.name || '');
                setLat(data.geolocation?.lat?.toString() || '');
                setLng(data.geolocation?.lng?.toString() || '');
                setPrepTime(data.prepTime?.toString() || '15');
                if (data.image) {
                    setExistingImage(data.image);
                    setImagePreview(data.image.startsWith('/uploads') ? `http://localhost:3000${data.image}` : data.image);
                }
            } catch (err) {
                setError(err.message || 'Error loading restaurant details.');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [restaurantId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRestaurantImage(file);
            setImagePreview(URL.createObjectURL(file));
            e.target.value = '';
        }
    };

    const handleClearImage = () => {
        setRestaurantImage(null);
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

        if (!name || !lat || !lng || !prepTime) {
            setError('All fields except selecting a new image file are required!');
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const prepNum = parseInt(prepTime);

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude.\nIt must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude.\nIt must be a valid number between -180 and 180.');
            return;
        }

        if (isNaN(prepNum) || prepNum <= 0) {
            setError('Invalid preparation time.\nIt must be a valid number greater than zero.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('prepTime', prepTime);

            if (restaurantImage) {
                formData.append('restaurantImage', restaurantImage);
            } else {
                formData.append('image', existingImage);
            }

            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                let errorMsg = 'Failed to update restaurant.';
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            setSuccess('Restaurant details updated successfully! Redirecting...');

            setTimeout(() => {
                navigate(`/restaurant/${restaurantId}`);
            }, 2000);

        } catch (err) {
            setError(err.message || 'Server error. Please try again.');
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this restaurant? This action cannot be undone.");
        if (!confirmDelete) return;

        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/restaurants/${restaurantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let errorMsg = 'Failed to delete restaurant.';
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            setSuccess('Restaurant deleted successfully! Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Server error. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="auth-container">
                <div className="auth-card auth-loading-card">
                    <p className="auth-loading-text">Loading Restaurant Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="back-button" onClick={() => navigate(-1)} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <h1 className="auth-heading wolt-brand-color">Edit Restaurant Details</h1>

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
                                    placeholder="Latitude"
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
                                    placeholder="Longitude"
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
                            placeholder="Preparation time"
                        />
                    </div>

                    {/* העלאת תמונת באנר */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Restaurant Image</label>
                        <div className="auth-file-input-container">
                            <input
                                type="file"
                                id="restaurantImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="auth-hidden-file-input"
                            />
                            <label htmlFor="restaurantImage" className="auth-file-input-label">
                                {restaurantImage ? `📸 ${restaurantImage.name}` : '📁 Upload New Banner Image'}
                            </label>
                        </div>

                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img src={imagePreview} alt="Restaurant Banner Preview" className="auth-banner-preview" />
                                {restaurantImage && (
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
                        className="auth-submit-button auth-danger-button"
                    >
                        Delete Restaurant
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

export default EditRestaurant;
