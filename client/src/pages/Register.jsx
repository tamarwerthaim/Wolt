import React, { useState } from 'react';
import woltLogo from '../assets/wolt_circle2.png';
import './LoginRegisterStyles.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleClearImage = () => {
        setProfileImage(null);
        setImagePreview(null);
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setError('');

        // check if all fields are full
        if (!username || !displayName || !address || !phone || !password || !confirmPassword || !profileImage) {
            setError('All fields are required, including a delivery address, phone number, and profile image');
            return;
        }

        // Check phone number format
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('Invalid phone number. Must be a valid 10-digit number starting with 05.');
            return;
        }

        // check if password match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // check if password is at least 8 characters long
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        // check if password has at least one letter and one number
        const hasLetter = /[A-Za-z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasLetter || !hasNumber) {
            setError('Password must contain a combination of both letters and numbers.');
            return;
        }

        console.log('Registration data is ready:', {
            username,
            displayName,
            address,
            phone,
            password,
            profileImageName: profileImage.name
        });
    };

    return (
        <div className="auth-container">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;900&display=swap');`}
            </style>

            <div className="auth-card">
                <div className="auth-logo-container">
                    <img src={woltLogo} alt="Wolt Logo" className="auth-logo" />
                </div>

                <h1 className="auth-heading">Sign up to Wolt</h1>

                <form onSubmit={handleRegisterSubmit}>
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

                    <div className="auth-input-wrapper">
                        <label htmlFor="address" className="auth-label">:Enter your delivery address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="auth-input"
                            placeholder="e.g., Herzl 42, Ramat Gan"
                        />
                    </div>

                    {/* תוספת: שדה מספר פלאפון בעיצוב תואם */}
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

                        {imagePreview && (
                            <div className="auth-preview-container">
                                <img src={imagePreview} alt="Profile Preview" className="auth-profile-preview" />
                                <button type="button" onClick={handleClearImage} className="auth-remove-image-btn">
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <div className="auth-error-text">{error}</div>}

                    <button type="submit" className="auth-submit-button">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;