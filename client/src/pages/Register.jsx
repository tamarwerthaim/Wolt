import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import './LoginRegisterStyles.css';

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
    const [error, setError] = useState('');

    // סטייט חדש לניהול מסך ההצלחה והטעינה המגניב
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));

            // שמירה על באג התמונה מאופס גם כאן
            e.target.value = '';
        }
    };

    const handleClearImage = () => {
        setProfileImage(null);
        setImagePreview(null);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // בדיקה שכל השדות מלאים כולל קו רוחב וקו אורך
        if (!username || !displayName || !lat || !lng || !phone || !password || !confirmPassword || !profileImage) {
            setError('All fields are required!');
            return;
        }

        // ולידציית טווחים גיאוגרפיים תקינים למשתמש לפני השליחה לשרת
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (isNaN(latNum) || latNum < -90 || latNum > 90) {
            setError('Invalid Latitude.\n It must be a valid number between -90 and 90.');
            return;
        }

        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
            setError('Invalid Longitude.\n It must be a valid number between -180 and 180.');
            return;
        }

        // Check phone number format
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            setError('Invalid phone number. \n Must be a valid 10-digit number starting with 05.');
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

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('displayName', displayName);
            formData.append('lat', lat);
            formData.append('lng', lng);
            formData.append('phone', phone);
            formData.append('password', password);
            formData.append('profileImage', profileImage);

            // connecting to server and sending the data
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                body: formData,
            });

            // getting the response from the server
            const data = await response.json();

            // if failed
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed. Username might already exist.');
            }
            console.log('Registration successful!', data);

            // 🔥 במקום ה-alert הישן: מפעילים את מסך ההצלחה והטעינה המגניב!
            setIsSuccess(true);

            // ממתינים 3 שניות כדי לתת למשתמש ליהנות מהחוויה, ואז מעבירים ללוגין
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        }
        // if failed
        catch (err) {
            setError(err.message || 'Server connection error. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo-container">
                    <img src={woltLogo} alt="Wolt Logo" className="auth-logo" />
                </div>

                {/* 🎯 התנאי החדש שמציג מסך הצלחה מותאם במקום הטופס */}
                {isSuccess ? (
                    <div>
                        <h1 className="auth-heading wolt-brand-color">!Welcome to the Wolt Family</h1>
                    </div>
                ) : (
                    <form onSubmit={handleRegisterSubmit}>
                        {/* שם משתמש */}
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

                        {/* שם תצוגה */}
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

                        {/* מספר טלפון */}
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

                        {/* סיסמה */}
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

                        {/* אימות סיסמה */}
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

                        {/* העלאת תמונת פרופיל */}
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
                )}
            </div>
        </div>
    );
};

export default Register;