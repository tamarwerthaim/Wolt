import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import './FormStyles.css';

/* Component for user registration with form validation and profile image upload */
const Register = () => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');

    /* State to show the success welcome screen after a successful registration */
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    /* Create a temporary preview URL when a profile image file is selected */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));

            /* Clear the input value so the same file can be uploaded again if cleared */
            e.target.value = '';
        }
    };

    /* Remove the selected image file and reset the preview container state */
    const handleClearImage = () => {
        setProfileImage(null);
        setImagePreview(null);
    };

    /* Validate form inputs, format phone/passwords, and send data to the server */
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        /* Front-end validation to check if all required fields are filled */
        if (!username || !displayName || !lat || !lng || !phone || !password || !confirmPassword || !profileImage) {
            setError('All fields are required!');
            return;
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        /* Validate that geographical location coordinates fit within real map boundaries */
        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude.\n It must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude.\n It must be a valid number between -180 and 180.');
            return;
        }

        /* Check if the phone number matches Israeli mobile formats (starts with 05 and has 10 digits) */
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('Invalid phone number. \n Must be a valid 10-digit number starting with 05.');
            return;
        }

        /* Check if the password inputs match each other */
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        /* Check if the password is at least 8 characters long */
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        /* Verify that the password contains a combination of both letters and numbers */
        const hasLetter = /[A-Za-z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasLetter || !hasNumber) {
            setError('Password must contain a combination of both letters and numbers.');
            return;
        }

        try {
            /* Pack form values inside a FormData envelope object to safely handle image file uploads */
            const formData = new FormData();
            formData.append('username', username);
            formData.append('displayName', displayName);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('phone', phone);
            formData.append('password', password);
            formData.append('profileImage', profileImage);
            formData.append('isAdmin', isAdmin);

            /* Send the final signup details to the backend API endpoint */
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed. Username might already exist.');
            }
            console.log('Registration successful!', data);

            /* Show the welcome success splash screen instead of a plain browser alert box */
            setIsSuccess(true);

            /* Wait 3 seconds to show the welcome message, then redirect the user to the login screen */
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        catch (err) {
            setError(err.message || 'Server connection error. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                {/* Back button that triggers router jump back to home layout dashboard */}
                <button className="back-button" onClick={() => navigate('/')} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <div className="auth-logo-container">
                    <img src={woltLogo} alt="Wolt Logo" className="auth-logo" />
                </div>

                {isSuccess ? (
                    /* Render welcome splash overlay layout on successful form registration */
                    <div>
                        <h1 className="auth-heading wolt-brand-color">Welcome to Wolt Family!</h1>
                    </div>
                ) : (
                    /* Render registration fields inputs text groups */
                    <>
                        <h1 className="auth-heading">Sign up to Wolt</h1>
                        <form onSubmit={handleRegisterSubmit}>

                            {/* Username input wrapper */}
                            <div className="auth-input-wrapper">
                                <label htmlFor="username" className="auth-label">:Enter your username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="auth-input"
                                    placeholder="Username"
                                />
                            </div>

                            {/* Display name input wrapper */}
                            <div className="auth-input-wrapper">
                                <label htmlFor="displayName" className="auth-label">:Enter your display name</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="auth-input"
                                    placeholder="Display name"
                                />
                            </div>

                            {/* Combined location layout row container for geographical coordinates fields */}
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
                                            placeholder="Latitude (e.g., 32.0853)"
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
                                            placeholder="Longitude (e.g., 34.7818)"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Phone number cellular input field wrapper */}
                            <div className="auth-input-wrapper">
                                <label htmlFor="phone" className="auth-label">:Enter your phone number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="auth-input"
                                    placeholder="e.g., 0501234567"
                                />
                            </div>

                            {/* Secret password input field wrapper */}
                            <div className="auth-input-wrapper">
                                <label htmlFor="password" className="auth-label">:Enter your password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input"
                                    placeholder="Password"
                                />
                            </div>

                            {/* Secret password confirmation input field wrapper */}
                            <div className="auth-input-wrapper">
                                <label htmlFor="confirmPassword" className="auth-label">:Confirm your password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="auth-input"
                                    placeholder="Confirm password"
                                />
                            </div>

                            {/* Profile picture file upload input field and live thumbnail preview logic */}
                            <div className="auth-input-wrapper">
                                <label className="auth-label">:Upload profile image</label>
                                <div className="auth-file-input-container">
                                    <input
                                        type="file"
                                        id="profileImage"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="auth-hidden-file-input"
                                    />
                                    <label htmlFor="profileImage" className="auth-file-input-label">
                                        {profileImage ? `📸 ${profileImage.name}` : '📁 Choose Image File'}
                                    </label>
                                </div>

                                {/* Render thumbnail profile image container if file state path exists */}
                                {imagePreview && (
                                    <div className="auth-preview-container">
                                        <img src={imagePreview} alt="Profile Preview" className="auth-profile-preview" />
                                        <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Custom checkbox field to configure privilege status options */}
                            <div className="auth-input-wrapper" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '15px', cursor: 'pointer', justifyContent: 'flex-start', direction: 'ltr' }}>
                                <input
                                    type="checkbox"
                                    id="isAdmin"
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-btn-bg)', margin: 0 }}
                                />
                                <label htmlFor="isAdmin" style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-color)', cursor: 'pointer', userSelect: 'none', fontFamily: '"Nunito", sans-serif' }}>
                                    Register as a Restaurant Owner
                                </label>
                            </div>

                            {/* Error state message alerts display context */}
                            {error && <div className="auth-error-text">{error}</div>}

                            <button type="submit" className="auth-submit-button">
                                Sign Up
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;