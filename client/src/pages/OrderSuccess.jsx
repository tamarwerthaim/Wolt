import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moneyImage from '../assets/money.png';
import './FormStyles.css';

/* Success page shown after a user places an order, redirecting them to their order history */
const OrderSuccess = () => {
    const navigate = useNavigate();

    /* Automatically redirect the user after a brief delay */
    useEffect(() => {
        /* Wait 3 seconds and then automatically send the user to the orders page */
        const timer = setTimeout(() => {
            navigate('/orders');
        }, 3000);

        /* Clean up the timer if the component unmounts before the 3 seconds are up */
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">

                {/* Center container for the success illustration image */}
                <div className="auth-logo-container auth-splash-logo-container">
                    <img
                        src={moneyImage}
                        alt="Order Success"
                        className="auth-logo auth-success-image"
                    />
                </div>

                {/* Primary success banner headline text */}
                <h1 className="auth-heading wolt-brand-color auth-splash-heading">
                    We are on the way!
                </h1>
            </div>
        </div>
    );
};

export default OrderSuccess;