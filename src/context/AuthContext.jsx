import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AxiosInterceptor } from '../Utils/axiosInterceptor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be in an AuthProvider");
    return context;
};

// Utility to check if JWT access token is expired
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now(); // exp is in seconds
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set Authorization header globally when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Attach interceptor once
    useEffect(() => {
        AxiosInterceptor(setToken, setUser);
    }, []);

    // Check auth and refresh if needed on app load
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);

            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            const storedUser = localStorage.getItem('user');

            if (storedRefreshToken && (!storedAccessToken || isTokenExpired(storedAccessToken))) {
                try {
                    const response = await axios.post(`${API_URL}/refresh`, {
                        refreshToken: storedRefreshToken
                    });

                    const newAccessToken = response.data.accessToken;
                    const newUser = response.data.user;

                    setToken(newAccessToken);
                    setUser(newUser);
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('user', JSON.stringify(newUser));
                    localStorage.setItem('username', newUser.username);

                    axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                } catch (err) {
                    console.error("Auto-refresh failed:", err);
                    localStorage.clear();
                    setToken(null);
                    setUser(null);
                }
            } else if (storedAccessToken && storedUser) {
                setToken(storedAccessToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const signin = (accessToken, refreshToken, user) => {
        setToken(accessToken);
        setUser(user);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', user.username);
    };

    const signup = signin;

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/logout`, {
                username: user?.username
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.clear();
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const value = {
        user,
        currentUser: user,
        token,
        loading,
        setToken,
        setUser,
        signin,
        signup,
        logout,
        isLoggedIn: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
