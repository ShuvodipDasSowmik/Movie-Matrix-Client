import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context)
        throw new Error("useAuth must be in an authProvider");

    return context;
}

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);
    
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing stored user data:', error);
                    // Clear invalid data
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('username');
                }
            }
            setLoading(false);
        }

        checkAuth();
    }, []);

    const signin = (accessToken, user) => {
        setToken(accessToken);
        setUser(user);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const signup = (accessToken, user) => {
        setToken(accessToken);
        setUser(user);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3000/logout', {
                username: user.username
            })
        }

        catch (error) {
            console.error("Logout error: ", error);
        }
        
        finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('username');
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
}


export { AuthProvider, useAuth };
export default AuthContext;