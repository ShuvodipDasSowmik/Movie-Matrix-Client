import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignIn = () => {

    const navigate = useNavigate();
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


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            // Send data to backend
            const response = await axios.post('http://localhost:3000/signin', {
                userName: formData.username,
                password: formData.password
            });

            // Store authentication data in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.user.username);
            
            console.log('Authentication data stored in localStorage');
            
            // Redirect to User Profile after storage is complete
            navigate(`/profile/${response.data.user.username}`);

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