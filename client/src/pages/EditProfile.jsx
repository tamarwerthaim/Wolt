import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import './FormStyles.css';

/* Component where users can edit their profile details, phone numbers, and change passwords. */
const EditProfile = ({ currentUser, setCurrentUser }) => {
    /* Input states for tracking form fields, image files, previews, and response messages */
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

    /* Automatically populate the form fields whenever the profile data loads or updates */
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
            /* Send the guest user back to the login view if no active token is found */
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
            }
        }
    }, [currentUser, navigate]);

    /* Create a quick image preview URL path when a user selects a new image file */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));

            /* Reset the element target value so the same image file can be re-selected if cleared */
            e.target.value = '';
        }
    };

    /* Discard the newly selected file and revert the preview back to the saved database picture */
    const handleClearImage = () => {
        setProfileImage(null);
        if (currentUser && currentUser.profileImage) {
            setImagePreview(`http://localhost:3000/uploads/${currentUser.profileImage}`);
        } else {
            setImagePreview(null);
        }
    };

    /* Form validation handler to check fields and upload profile changes using FormData structure */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        /* Front-end validation rule checking that all required inputs are populated */
        if (!displayName || !lat || !lng || !phone) {
            setError('Required fields cannot be empty!');
            setIsSubmitting(false);
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        /* Check if latitude fits within standard geographical constraints numbers */
        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude. It must be a valid number between -90 and 90.');
            setIsSubmitting(false);
            return;
        }

        /* Check if longitude fits within standard geographical constraints numbers */
        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude. It must be a valid number between -180 and 180.');
            setIsSubmitting(false);
            return;
        }

        /* Match standard Israeli mobile phone patterns starting with 05 followed by 8 numbers */
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('Invalid phone number. Must be a valid 10-digit number starting with 05.');
            setIsSubmitting(false);
            return;
        }

        /* Complex verification checks running if the user tries to update their password */
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

            /* Gather all variables inside a FormData envelope object to safely send file records */
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

            /* Send the update fetch request payload to the server account routes */
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

            /* Synchronously update the global context profile state immediately upon change */
            setCurrentUser(data);
            setSuccessMsg('Profile updated successfully!');

            /* Wait 2 seconds before redirecting the client user back to the primary main landing route */
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

                {/* Back navigation button using the default landing redirect path */}
                <button className="back-button" onClick={() => navigate('/')} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                {/* Visual template branding header containers */}
                <div className="auth-logo-container">
                    <img src={woltLogo} alt="Wolt Logo" className="auth-logo" />
                </div>

                <h2 className="auth-heading">
                    Edit Profile Details
                </h2>

                <form onSubmit={handleUpdateSubmit}>

                    {/* Public display name input field */}
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

                    {/* Combined localization coordinates layout columns */}
                    <div className="auth-input-wrapper">
                        <label className="auth-label">:Location</label>
                        <div className="auth-input-row">

                            {/* Latitude coordinate text input */}
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

                            {/* Longitude coordinate text input */}
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

                    {/* Primary client cellular contact input field */}
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

                    {/* Password modification fields layout */}
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

                    {/* Render secondary confirmation password input only if password text exists */}
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

                    {/* Avatar image input selector form group and live preview containers */}
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

                        {/* Display profile graphic preview widget container if preview path evaluates true */}
                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img src={imagePreview} alt="Profile Preview" className="auth-profile-preview" />
                                {/* Show clear button utility only if a new local image choice has been uploaded */}
                                {profileImage && (
                                    <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                        Revert to Current
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status notification alerts mapping operation results */}
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