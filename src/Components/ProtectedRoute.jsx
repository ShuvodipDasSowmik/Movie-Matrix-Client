import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isLoggedIn, user, loading } = useAuth();
    
    // Show loading spinner while auth state is being determined
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    // If not logged in, redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }
    
    // If role is required and user doesn't have it, redirect to unauthorized
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    // Otherwise render the protected content
    return children;
};

export default ProtectedRoute;