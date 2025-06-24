import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { username } = useParams();
    const { user: authUser, isLoggedIn, logout, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFullName, setEditedFullName] = useState('');
    const [error, setError] = useState('');

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            // Don't proceed if auth is still loading
            if (loading) return;

            // Redirect to signin if not logged in
            if (!isLoggedIn) {
                navigate('/signin');
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                // Check if user is trying to access their own profile
                const currentUsername = authUser?.username || localStorage.getItem('username');
                if (username !== currentUsername) {
                    // User is trying to access someone else's profile
                    navigate('/unauthorized-path');
                    return;
                }

                // Fetch the user profile data
                const response = await axios.get(`http://localhost:3000/user/${username}`);

                if (response.status === 200) {
                    console.log('User data received:', response.data);
                    setUser(response.data);
                }
                else {
                    throw new Error('Failed to fetch user data');
                }
            }
            
            catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 403) {
                    navigate('/unauthorized-path');
                    return;
                }

                // If there's an error but this is the current user, create a minimal profile
                const currentUsername = authUser?.username || localStorage.getItem('username');
                if (username === currentUsername) {
                    console.log('Creating minimal profile for current user due to error');
                    setUser({
                        username: currentUsername,
                        fullname: authUser?.fullName || currentUsername,
                        email: authUser?.email || '',
                        dateofbirth: ''
                    });
                }
                
                else {
                    setError('Failed to load user profile');
                }
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, username, isLoggedIn, authUser, loading]);

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };
    
    const handleEditClick = () => {
        setEditedFullName(user.fullname || '');
        setIsEditing(true);
    };
    
    const handleSaveFullName = async () => {
        try {
            const response = await axios.put('http://localhost:3000/update-user', {
                fullname: editedFullName
            });

            if (response.status === 200) {
                const data = response.data;
                setUser({ ...user, fullname: data.user.fullname });
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating full name:', error);
            setError('Failed to update full name');
        }
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleLogout = () => {
        // Use the logout function from AuthContext
        logout();

        // Redirect to the login page
        navigate('/signin');
    };
    
    // Show loading state while checking authentication or fetching user data
    if (loading || isLoading) {
        return <div className="loading">Loading...</div>;
    }

    // Show error if there's one
    if (error && !user) {
        return <div className="error">{error}</div>;
    }

    return (<div className="dashboard-container">
        <div className="dashboard-header">
            <h1>User Dashboard</h1>
            <button onClick={handleLogout} className="logout-btn">
                Logout
            </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {user && (
            <>
                <div className="user-profile-section">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user.fullname ? user.fullname[0].toUpperCase() : user.username[0].toUpperCase()}
                        </div>
                        <div className="profile-info">
                            {isEditing ? (
                                <div className="edit-name-form">
                                    <input
                                        type="text"
                                        value={editedFullName}
                                        onChange={(e) => setEditedFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                    <div className="edit-buttons">
                                        <button onClick={handleSaveFullName} className="save-btn">Save</button>
                                        <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2>{user.fullname || user.username}</h2>
                                    <button onClick={handleEditClick} className="edit-btn">
                                        Edit
                                    </button>
                                </>
                            )}
                            <p className="username">@{user.username}</p>
                            <p className="user-email">{user.email}</p>
                            <p className="user-age">Age: {calculateAge(user.dateofbirth)}</p>
                        </div>
                    </div>
                </div>

                <div className="watchlists-section">
                    <h2>Your Watchlists</h2>
                    <div className="watchlists-container">
                        <div className="watchlist-placeholder">
                            <p>Create your first watchlist</p>
                            <button className="create-watchlist-btn">+ Create Watchlist</button>
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
    );
}

export default UserDashboard;