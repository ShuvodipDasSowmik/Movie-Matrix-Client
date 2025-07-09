import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';
import { useAuth } from '../context/AuthContext';
import PostPopUp from '../Components/PostPopUp';
import UserPost from '../Components/UserPost';
import Watchlist from '../Components/Watchlist';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { username } = useParams();
    const { user: authUser, isLoggedIn, logout, loading } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFullName, setEditedFullName] = useState('');
    const [error, setError] = useState('');
    const [showPostPopup, setShowPostPopup] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (loading) return; // Wait for auth loading
            if (!isLoggedIn) {
                navigate('/signin');
                return;
            }
            if (!authUser) {
                // Wait for auth user to be set
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                if (username !== authUser.username) {
                    // Prevent accessing others' profiles
                    navigate('/unauthorized-path');
                    return;
                }

                const response = await axios.get(`${API_URL}/user/${username}`);

                if (response.status === 200) {
                    setUser(response.data);
                } else {
                    throw new Error('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);

                if (err.response?.status === 403) {
                    navigate('/unauthorized-path');
                    return;
                }

                // Fallback: minimal user profile from auth context
                setUser({
                    username: authUser.username,
                    fullname: authUser.fullname ?? authUser.username,
                    email: authUser.email ?? '',
                    dateofbirth: '',
                });
            } finally {
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
            const response = await axios.put(`${API_URL}/update-user`, {
                fullname: editedFullName,
            });

            if (response.status === 200) {
                const data = response.data;
                setUser((prev) => ({ ...prev, fullname: data.user.fullname }));
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
        logout();
        navigate('/signin');
    };

    if (loading || isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error && !user) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard-container">
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
                                {(user.fullname || user.username)[0].toUpperCase()}
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
                                            <button onClick={handleSaveFullName} className="save-btn">
                                                Save
                                            </button>
                                            <button onClick={handleCancelEdit} className="cancel-btn">
                                                Cancel
                                            </button>
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

                        <div className="create-post-section">
                            <div 
                                className="create-post-input"
                                onClick={() => setShowPostPopup(true)}
                            >
                                <div className="post-input-placeholder">
                                    <span>What's on your mind about movies, {user.fullname || user.username}?</span>
                                </div>
                                <button className="post-btn-preview">Post</button>
                            </div>
                        </div>
                    </div>

                    <Watchlist username={user.username} />

                    <UserPost username={user.username} />
                </>
            )}

            {showPostPopup && (
                <PostPopUp 
                    onClose={() => setShowPostPopup(false)}
                    userInfo={user}
                />
            )}
        </div>
    );
};

export default UserDashboard;
