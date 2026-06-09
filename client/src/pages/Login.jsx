import React, { useState } from 'react';
import woltLogo from '../assets/wolt_circle2.png';

const Login = () => {
    //save the username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // save the error message
    const [error, setError] = useState('');

    //handle the form submission
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
        <div style={styles.container}>
            {/* טעינת הפונט המעוגל משרתי גוגל */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;900&display=swap');`}
            </style>

            <div style={styles.card}>

                {/* לוגו Wolt */}
                <div style={styles.logoContainer}>
                    <img src={woltLogo} alt="Wolt Logo" style={styles.logo} />
                </div>

                {/* הכותרת המעובבת */}
                <h1 style={styles.heading}>Log in to Wolt</h1>

                <form onSubmit={handleSubmit}>

                    {/* שדה שם משתמש */}
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

                    {/* שדה סיסמה */}
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

                    {/* שגיאות */}
                    {error && <div style={styles.errorText}>{error}</div>}

                    {/* כפתור כניסה */}
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
        // משתמשים ברקע הדינמי שתמר הגדירה
        backgroundColor: 'var(--header-bg)',
        padding: '20px',
        boxSizing: 'border-box',
        // אנימציית מעבר חלקה כשהצבעים מתחלפים
        transition: 'background-color 0.3s ease',
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
        fontSize: '34px',
        fontWeight: '900',
        letterSpacing: '-0.5px',
        // צבע כותרת דינמי (כהה ביום, בהיר בלילה)
        color: 'var(--text-color)',
        margin: '0 0 32px 0',
        transition: 'color 0.3s ease',
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
        // צבע תווית דינמי
        color: 'var(--text-color)',
        marginBottom: '10px',
        paddingRight: '4px',
        textAlign: 'left',
        transition: 'color 0.3s ease',
    },
    input: {
        width: '100%',
        padding: '16px 20px',
        fontSize: '16px',
        borderRadius: '28px',
        // שימוש ברקע וגבולות משניים שמתכהים במצב לילה בצורה מעולה
        border: '1px solid var(--btn-secondary-hover)',
        backgroundColor: 'var(--btn-secondary-bg)',
        boxSizing: 'border-box',
        outline: 'none',
        // צבע הטקסט המוקלד ישתנה בהתאם
        color: 'var(--text-color)',
        textAlign: 'left',
        fontFamily: '"Nunito", sans-serif',
        fontWeight: '400',
        transition: 'all 0.3s ease',
    },
    errorText: {
        fontFamily: '"Nunito", sans-serif',
        // צבע שגיאה דינמי (מותאם לרקע כהה/בהיר)
        color: 'var(--danger-text)',
        fontSize: '17px',
        fontWeight: '600',
        textAlign: 'center',
        margin: '10px 0 15px 0',
        transition: 'color 0.3s ease',
    },
    submitButton: {
        width: '100%',
        padding: '16px',
        fontSize: '16px',
        fontFamily: '"Nunito", sans-serif',
        fontWeight: '700',
        color: '#ffffff',
        // כפתור Wolt הרשמי נשאר בצבע המותג בשני המצבים
        backgroundColor: 'var(--primary-btn-bg)',
        border: 'none',
        borderRadius: '28px',
        cursor: 'pointer',
        marginTop: '12px',
        transition: 'background-color 0.15s ease, transform 0.1s ease',
    },
};

export default Login;