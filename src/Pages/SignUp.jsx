import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PageStyles/SignUp.css';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SignUp = () => {
    const navigate = useNavigate();
    const { signup, isLoggedIn } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        // Redirect to profile if user is already logged in
        if (isLoggedIn) {
            const username = localStorage.getItem('username');
            navigate(`/profile/${username}`);
        }
    }, [isLoggedIn, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');

            console.log('Form data before sending:', formData);

            // Send data to backend
            const response = await axios.post(`${API_URL}/signup`, {
                fullName: formData.fullName,
                userName: formData.username,
                email: formData.email,
                password: formData.password,
                dob: formData.dob,
                role: 'USER'
            });            console.log('Signup successful:', response.data);
            
            // Store tokens in localStorage
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('username', formData.username);
            
            // Update auth context with token and user data
            signup(response.data.accessToken, response.data.refreshToken, response.data.user);

            // Redirect to User Profile
            navigate(`/profile/${formData.username}`);

        } catch (err) {
            
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            console.error('Signup error:', err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <h1>Create Your Account</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

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
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="6"
                            required
                            style={{ paddingRight: "60px" }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            style={{
                                position: "absolute",
                                right: 4,
                                top: "34%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "#5271ff",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                padding: "0 8px"
                            }}
                            tabIndex={-1}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            minLength="6"
                            required
                            style={{ paddingRight: "60px" }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            style={{
                                position: "absolute",
                                right: 4,
                                top: "34%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "#5271ff",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                padding: "0 8px"
                            }}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="signup-button"
                    disabled={loading}
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>

                <div className="signin-link">
                    Already have an account? <a href="/signin">Sign in</a>
                </div>
            </form>
        </div>
    );
};

export default SignUp;