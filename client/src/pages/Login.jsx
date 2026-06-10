import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import woltLogo from '../assets/wolt_circle2.png';
import './LoginRegisterStyles.css';

// שינוי 1: מקבלים את הפונקציה ב-Props בשורה הראשונה של הקומפוננטה
const Login = ({ setCurrentUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

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

            //navigate to home
            navigate('/')
        }
        catch (err) {
            setError(err.message || 'Server connection error. Please try again later.');
        }
    };

    return (
        <div className="auth-container">
            {/* <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;900&display=swap');`}
            </style> */}

            <div className="auth-card">
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