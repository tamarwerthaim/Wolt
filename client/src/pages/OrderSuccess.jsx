import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moneyImage from '../assets/money.png';
import './LoginRegisterStyles.css';

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
                <div className="auth-logo-container" style={{ marginBottom: '0px' }}>
                    <img 
                        src={moneyImage} 
                        alt="Order Success" 
                        className="auth-logo" 
                        style={{ width: '400px', height: '400px', objectFit: 'contain' }}
                    />
                </div>
                <h1 className="auth-heading wolt-brand-color" style={{ direction: 'ltr' }}>
                    We are on the way!
                </h1>
            </div>
        </div>
    );
};

export default OrderSuccess;
