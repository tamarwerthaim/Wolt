import React, { useState } from 'react';
import woltLogo from '../assets/wolt_circle2.png';
import './LoginRegisterStyles.css'; // מייבאים את קובץ ה-CSS המשותף

const Register = () => {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState(''); // <-- תוספת: ה-State של מספר הטלפון
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [error, setError] = useState('');

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setError('');

        // עדכון הבדיקה: ודוא שגם שדה הטלפון התמלא
        if (!username || !displayName || !address || !phone || !password || !confirmPassword || !profileImage) {
            setError('All fields are required, including a delivery address, phone number, and profile image');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        console.log('Registration data is ready:', {
            username,
            displayName,
            address,
            phone, // הטלפון נשמר ומוכן לשלב הבא!
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
                                onChange={(e) => setProfileImage(e.target.files[0])}
                                className="auth-hidden-file-input"
                            />
                            <label htmlFor="profileImage" className="auth-file-input-label">
                                {profileImage ? `📸 ${profileImage.name}` : '📁 Choose Image File'}
                            </label>
                        </div>
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