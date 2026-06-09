import React, { useState } from 'react';
import woltLogo from '../assets/wolt_circle2.png';
import './LoginRegisterStyles.css'; // מייבאים את קובץ ה-CSS המשותף

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('You must fill in all the fields to connect');
            return;
        }

        console.log('The fields are full, ready for the next step:', { username, password });
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