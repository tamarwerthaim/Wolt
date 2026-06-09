import React, { useState } from 'react';
import woltLogo from '../assets/wolt_circle.jpg';

const Login = () => {
    //save the username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // save the error message
    const [error, setError] = useState('');

    //handle the form submission
    const handleSubmit = (e) => {
        // prevent the default form submission
        e.preventDefault();

        // reset the error message
        setError('');

        // check if the fields are empty
        if (!username || !password) {
            setError('You must fill in all the fields to connect');
            return; // stop here and don't continue to the next code
        }

        // if we get here - the form has successfully passed the basic validation in the browser!
        console.log('The fields are full, ready for the next step:', { username, password });
    };

    return (
        <div style={styles.container}>
            {/* explict call for the font from google */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;900&display=swap');`}
            </style>

            <div style={styles.card}>

                {/* Wolt Logo */}
                <div style={styles.logoContainer}>
                    <img src={woltLogo} alt="Wolt Logo" style={styles.logo} />
                </div>

                {/* The rounded heading */}
                <h1 style={styles.heading}>Log in to Wolt</h1>

                <form onSubmit={handleSubmit}>

                    {/* username field */}
                    <div style={styles.inputWrapper}>
                        <label htmlFor="username" style={styles.label}>Enter your username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Username"
                        />
                    </div>

                    {/* password field */}
                    <div style={styles.inputWrapper}>
                        <label htmlFor="password" style={styles.label}>Enter your password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Password"
                        />
                    </div>

                    {/* errors */}
                    {error && <div style={styles.errorText}>{error}</div>}

                    {/* sign in button */}
                    <button type="submit" style={styles.submitButton}>
                        Next
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        padding: '20px',
        boxSizing: 'border-box',
    },
    card: {
        width: '100%',
        maxWidth: '520px',
        textAlign: 'center',
        padding: '0 16px',
        boxSizing: 'border-box',
    },
    logoContainer: {
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center',
    },
    logo: {
        display: 'block',
        width: '200px',
        height: 'auto',
    },
    heading: {
        fontFamily: '"Nunito", sans-serif',
        fontSize: '40px',
        fontWeight: '900',
        letterSpacing: '-0.5px',
        color: '#141417',
        margin: '0 0 32px 0',
    },
    inputWrapper: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        fontFamily: '"Nunito", sans-serif',
        fontSize: '16px',
        fontWeight: '600',
        color: '#141417',
        marginBottom: '10px',
        paddingRight: '4px',
        textAlign: 'left',
    },
    input: {
        width: '100%',
        padding: '16px 20px',
        fontSize: '16px',
        borderRadius: '28px',
        border: '1px solid #e3e4e6',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        outline: 'none',
        color: '#141417',
        transition: 'border-color 0.15s ease',
        textAlign: 'left',
        fontFamily: '"Nunito", sans-serif',
        fontWeight: '400',
    },
    errorText: {
        fontFamily: '"Nunito", sans-serif',
        color: '#ff4d4f',
        fontSize: '17px',
        fontWeight: '600',
        textAlign: 'center',
        margin: '10px 0 15px 0',
    },
    submitButton: {
        width: '100%',
        padding: '16px',
        fontSize: '16px',
        fontFamily: '"Nunito", sans-serif',
        fontWeight: '700',
        color: '#ffffff',
        backgroundColor: '#00c2e8',
        border: 'none',
        borderRadius: '28px',
        cursor: 'pointer',
        marginTop: '12px',
        transition: 'background-color 0.15s ease, transform 0.1s ease',
    },
};

export default Login;