import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { username } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFullName, setEditedFullName] = useState('');

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const authToken = localStorage.getItem('token');
            
            if (!authToken) {
                // No token found, redirect to login
                setIsLoading(false);
                navigate('/signin');
                return;
            }

            try {
                // Call the API to validate the token and get user info
                // Pass the requested username as a query parameter
                const response = await fetch(`http://localhost:3000/validate-token?requestedUsername=${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 403) {
                    // User is authenticated but not authorized to view this profile
                    const data = await response.json();
                    // Redirect to the user's authorized profile
                    navigate(`/profile/${data.authorizedUsername}`);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Token validation failed');
                }

                const userData = await response.json();
                // Extract user data from the response structure
                if (userData.valid && userData.user) {
                    setUser(userData.user);
                    setIsAuthenticated(true);
                } else {
                    throw new Error('Invalid user data structure');
                }

            } catch (error) {
                console.error('Authentication error:', error);
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/signin');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate, username]);

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
        setEditedFullName(user.fullName || '');
        setIsEditing(true);
    };

    const handleSaveFullName = async () => {
        try {
            const authToken = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/update-user', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: editedFullName
                })
            });

            if (response.ok) {
                const data = await response.json();
                setUser({...user, fullName: data.user.fullName});
                setIsEditing(false);
            } else {
                console.error('Failed to update full name');
            }
        } catch (error) {
            console.error('Error updating full name:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleLogout = () => {
        // Remove the auth token from localStorage
        localStorage.removeItem('token');
        
        // Set authenticated state to false
        setIsAuthenticated(false);
        
        // Redirect to the login page
        navigate('/signin');
    };

    // Show loading state while checking authentication
    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    // If not authenticated, this component won't render as the useEffect will redirect
    // But as an extra layer of protection:
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>User Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
            
            {user && (
                <>
                    <div className="user-profile-section">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
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
                                        <h2>{user.fullName || user.username}</h2>
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