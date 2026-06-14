import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import foodImage from '../assets/food.png';
import './FormStyles.css';

/* Login component that handles user authentication and session state tokens */
const Login = ({ setCurrentUser, setIsCartOpen }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showSplash, setShowSplash] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    /* Get redirect paths and action triggers from the router history state */
    const fromPath = location.state?.from || '/';
    const shouldOpenCart = location.state?.openCart || false;
    const shouldOpenRating = location.state?.openRating || false;

    /* Handle form submission, check credentials, and set local user state */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        /* Front-end validation to check if fields are empty */
        if (!username || !password) {
            setError('You must fill in all the fields to connect');
            return;
        }
        try {
            /* Send a POST request to get an authentication token from the backend */
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

            /* Save the token in localStorage and log success status */
            localStorage.setItem('token', data.token);
            console.log('Login successful! Token saved in LocalStorage.');

            /* Decode the JWT token payload locally to find the user ID */
            const tokenParts = data.token.split('.');
            const decodedPayload = JSON.parse(atob(tokenParts[1]));
            localStorage.setItem('userId', decodedPayload.id);

            /* Fetch the full user profile details immediately using the new token */
            const profileResponse = await fetch(`http://localhost:3000/api/users/${decodedPayload.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            const userData = await profileResponse.json();

            if (!userData.error) {
                /* Update the global app user context state immediately */
                setCurrentUser(userData);
            }

            /* Show the splash screen overlay layout for 3 seconds before redirecting */
            setShowSplash(true);

            setTimeout(() => {
                /* Send the user back to where they came from */
                navigate(fromPath);

                /* Open the cart drawer automatically if they clicked the cart button before logging in */
                if (shouldOpenCart && setIsCartOpen) {
                    setTimeout(() => setIsCartOpen(true), 100);
                }
            }, 3000);
        }
        catch (err) {
            setError(err.message || 'Server connection error. Please try again later.');
        }
    };

    /* Render a hungry message splash view screen if login is successful */
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
            <div className="auth-card">

                {/* Back navigation history arrow linking back to fromPath origins */}
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

                    {/* Username text input field wrapper */}
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

                    {/* Password secret input field wrapper */}
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

                    {/* Simple error notification field wrapper if validations fail */}
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