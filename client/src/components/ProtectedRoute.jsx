import React from 'react';
import { Navigate } from 'react-router-dom';

// component to protect private client-side views
const ProtectedRoute = ({ children }) => {
    // Check if the secure authentication token exists in local storage
    const token = localStorage.getItem('token');

    // If an unauthenticated guest tries to access, redirect to /login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If token exists, allow full access to the wrapped page content
    return children;
};

export default ProtectedRoute;