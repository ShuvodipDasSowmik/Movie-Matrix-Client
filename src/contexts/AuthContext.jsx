import React, { createContext, useState, useContext, useEffect } from 'react';
import { isTokenExpired, logout, getToken } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      
      if (token && !isTokenExpired(token)) {
        // Token is valid
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Invalid user data
          logout();
        }
      } else if (token) {
        // Token exists but is expired
        logout();
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Provide auth context
  const value = {
    isAuthenticated,
    user,
    loading,
    logout,
    // Include other auth methods here...
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
