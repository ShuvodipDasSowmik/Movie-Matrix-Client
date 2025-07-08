import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SignIn = () => {

    const navigate = useNavigate();
    const { signin, isLoggedIn } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    useEffect(() => {
        if (isLoggedIn) {
            console.log('User is already logged in, redirecting to profile');

            const username = localStorage.getItem('username');
            navigate(`/profile/${username}`);
        }
    }, [navigate, isLoggedIn]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Send data to backend
            const response = await axios.post(`${API_URL}/signin`, {
                username: formData.username,
                password: formData.password
            });

            const data = response.data;

            // Store both tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('username', data.user.username);

            try {
                signin(data.accessToken, data.refreshToken, data.user);
                navigate(`/profile/${data.user.username}`);
            }
            
            catch (error) {
                console.error('Error during signin or navigation:', error);
                setError('An unexpected error occurred.');
            }

        } catch (err) {
            setError(err.response?.data || 'Invalid username or password');
            console.error('Signin error:', err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="signup-container">
            <h1>Sign In to Your Account</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="signup-form">

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="signup-button"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="signin-link">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </div>
            </form>
        </div>
    )
}

export default SignIn