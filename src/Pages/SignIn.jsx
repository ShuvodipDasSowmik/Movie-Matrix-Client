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

            // console.log('Form data before sending:', formData);

            // Send data to backend
            const response = await axios.post('http://localhost:3000/signin', {
                userName: formData.username,
                password: formData.password
            });

            // console.log('SignIn successful:', response.data);

            localStorage.setItem('authToken', response.data.token)

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