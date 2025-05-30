import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PageStyles/SignUp.css';

const SignUp = () => {
    const navigate = useNavigate();
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
            const response = await axios.post('http://localhost:3000/signup', {
                fullName: formData.fullName,
                userName: formData.username,
                email: formData.email,
                password: formData.password,
                dob: formData.dob,
                role: 'USER'
            });

            console.log('Signup successful:', response.data);

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
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength="6"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        minLength="6"
                        required
                    />
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