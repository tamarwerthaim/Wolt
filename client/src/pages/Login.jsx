import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import foodImage from '../assets/food.png';
import './FormStyles.css';

// שינוי 1: מקבלים את הפונקציה ב-Props בשורה הראשונה של הקומפוננטה
const Login = ({ setCurrentUser, setIsCartOpen }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showSplash, setShowSplash] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Read redirect state: where to go back and what action to trigger
    const fromPath = location.state?.from || '/';
    const shouldOpenCart = location.state?.openCart || false;
    const shouldOpenRating = location.state?.openRating || false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('You must fill in all the fields to connect');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            
            let data = {};
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                throw new Error(data.error || 'Login failed. Invalid username or password.');
            }

            localStorage.setItem('token', data.token);
            console.log('Login successful! Token saved in LocalStorage.');

            const tokenParts = data.token.split('.');
            const decodedPayload = JSON.parse(atob(tokenParts[1]));
            localStorage.setItem('userId', decodedPayload.id);

            // ◄◄ שינוי 2: מושכים מיד את פרופיל המשתמש המלא ומעדכנים את ה-State הגלובלי באפליקציה!
            const profileResponse = await fetch(`http://localhost:3000/api/users/${decodedPayload.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            const userData = await profileResponse.json();
            
            if (!userData.error) {
                setCurrentUser(userData); // מעדכן את האפליקציה באופן מיידי!
            }

            // Trigger splash page for 3 seconds before redirecting back
            setShowSplash(true);
            
            setTimeout(() => {
                // Navigate back to origin (or home if no origin)
                navigate(fromPath);
                // If user came from cart button, open the cart after redirect
                if (shouldOpenCart && setIsCartOpen) {
                    setTimeout(() => setIsCartOpen(true), 100);
                }
            }, 3000);
        }
        catch (err) {
            setError(err.message || 'Server connection error. Please try again later.');
        }
    };

    if (showSplash) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo-container auth-splash-logo-container">
                        <img 
                            src={foodImage} 
                            alt="Getting Hungry" 
                            className="auth-logo auth-splash-image"
                        />
                    </div>
                    <h1 className="auth-heading wolt-brand-color auth-splash-heading">
                        Getting hungry?
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            {/* <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;900&display=swap');`}
            </style> */}

            <div className="auth-card">
                <button className="back-button" onClick={() => navigate(fromPath)} title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="svg-icon-block">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div className="auth-logo-container">
                    <img src={woltLogo} alt="Wolt Logo" className="auth-logo" />
                </div>

                <h1 className="auth-heading">Log in to Wolt</h1>

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-wrapper">
                        <label htmlFor="username" className="auth-label">Enter your username:</label>
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
                        <label htmlFor="password" className="auth-label">Enter your password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            placeholder="Password"
                        />
                    </div>

                    {error && <div className="auth-error-text">{error}</div>}

                    <button type="submit" className="auth-submit-button">
                        Next
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;