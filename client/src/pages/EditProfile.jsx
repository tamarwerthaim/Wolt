import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import './LoginRegisterStyles.css';

const EditProfile = ({ currentUser, setCurrentUser }) => {
    const [displayName, setDisplayName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    // Populate fields when currentUser changes or loads
    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.name || '');
            setPhone(currentUser.phone || '');
            if (currentUser.geolocation) {
                setLat(currentUser.geolocation.lat !== undefined ? String(currentUser.geolocation.lat) : '');
                setLng(currentUser.geolocation.lng !== undefined ? String(currentUser.geolocation.lng) : '');
            }
            if (currentUser.profileImage) {
                setImagePreview(`http://localhost:3000/uploads/${currentUser.profileImage}`);
            }
        } else {
            // If not logged in, redirect to login page
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
            }
        }
    }, [currentUser, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
            e.target.value = ''; // Reset target value
        }
    };

    const handleClearImage = () => {
        setProfileImage(null);
        if (currentUser && currentUser.profileImage) {
            setImagePreview(`http://localhost:3000/uploads/${currentUser.profileImage}`);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        if (!displayName || !lat || !lng || !phone) {
            setError('Required fields cannot be empty!');
            setIsSubmitting(false);
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude. It must be a valid number between -90 and 90.');
            setIsSubmitting(false);
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude. It must be a valid number between -180 and 180.');
            setIsSubmitting(false);
            return;
        }

        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('Invalid phone number. Must be a valid 10-digit number starting with 05.');
            setIsSubmitting(false);
            return;
        }

        if (password) {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setIsSubmitting(false);
                return;
            }
            if (password.length < 8) {
                setError('Password must be at least 8 characters long.');
                setIsSubmitting(false);
                return;
            }
            const hasLetter = /[A-Za-z]/.test(password);
            const hasNumber = /\d/.test(password);
            if (!hasLetter || !hasNumber) {
                setError('Password must contain a combination of both letters and numbers.');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                setError('Authentication error. Please log in again.');
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData();
            formData.append('displayName', displayName);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('phone', phone);
            if (password) {
                formData.append('password', password);
            }
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile details.');
            }

            console.log('Profile updated successfully!', data);
            
            // Update the global state immediately
            setCurrentUser(data);
            setSuccessMsg('Profile updated successfully! 🚀');

            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Server connection error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="back-button" onClick={() => navigate('/')} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div className="auth-logo-container">
                    <img src={woltLogo} alt="Wolt Logo" className="auth-logo" />
                </div>

                <h2 className="auth-heading">
                    Edit Profile Details
                </h2>

                <form onSubmit={handleUpdateSubmit}>
                    {/* Display Name */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="displayName" className="auth-label">:Display Name</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="auth-input"
                            placeholder="Display name"
                        />
                    </div>

                    {/* Geolocation fields */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Location</label>
                        <div className="auth-input-row">
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

                    {/* Phone Number */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="phone" className="auth-label">:Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="auth-input"
                            placeholder="e.g., 0501234567"
                        />
                    </div>

                    {/* Password (Optional) */}
                    <div className="auth-input-wrapper">
                        <label htmlFor="password" className="auth-label">:New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="New password"
                        />
                    </div>

                    {/* Confirm Password (Optional) */}
                    {password && (
                        <div className="auth-input-wrapper">
                            <label htmlFor="confirmPassword" className="auth-label">:Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="auth-input"
                                placeholder="Confirm new password"
                            />
                        </div>
                    )}

                    {/* Profile Image (Optional) */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Profile Image</label>
                        <div className="auth-file-input-container">
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="auth-hidden-file-input"
                            />
                            <label htmlFor="profileImage" className="auth-file-input-label">
                                {profileImage ? `📸 ${profileImage.name}` : '📁 Update Profile Image'}
                            </label>
                        </div>

                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img src={imagePreview} alt="Profile Preview" className="auth-profile-preview" />
                                {profileImage && (
                                    <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                        Revert to Current
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {error && <div className="auth-error-text">{error}</div>}
                    {successMsg && <div className="auth-success-text">{successMsg}</div>}

                    <button type="submit" className="auth-submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
