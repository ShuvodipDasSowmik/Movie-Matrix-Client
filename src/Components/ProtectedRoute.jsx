import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isLoggedIn, user, loading } = useAuth();

    // Wait for loading to finish and user to be determined before making any redirect decisions
    if (loading || (isLoggedIn && !user)) {
        return <div className="loading">Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;