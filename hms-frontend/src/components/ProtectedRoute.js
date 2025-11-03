// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isLoggedIn, role } = useAuth();

    if (!isLoggedIn) {
        // Not logged in: redirect to login page
        return <Navigate to="/" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        // Logged in but wrong role: redirect to a default logged-in page (e.g., their own dashboard)
        // For a clean catch-all, you can send them to a generic dashboard or 'access denied'
        return <Navigate to={`/${role.toLowerCase().split('_')[1]}/dashboard`} replace />;
    }
    
    // Authorization successful
    return children;
};

export default ProtectedRoute;