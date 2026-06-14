import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moneyImage from '../assets/money.png';
import './FormStyles.css';

const OrderSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/orders');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo-container auth-splash-logo-container">
                    <img 
                        src={moneyImage} 
                        alt="Order Success" 
                        className="auth-logo auth-success-image"
                    />
                </div>
                <h1 className="auth-heading wolt-brand-color auth-splash-heading">
                    We are on the way!
                </h1>
            </div>
        </div>
    );
};

export default OrderSuccess;
