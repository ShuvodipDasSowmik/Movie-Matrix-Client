import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ComponentStyles/Watchlist.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Watchlist = ({ username }) => {
    const [watchlists, setWatchlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newWatchlistTitle, setNewWatchlistTitle] = useState('');
    const [selectedMedias, setSelectedMedias] = useState([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchWatchlists();
    }, [username]);

    const fetchWatchlists = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/watchlist/${username}`);
            
            if (response.data.success) {
                setWatchlists(response.data.watchlist);
            } else {
                setError('Failed to fetch watchlists');
            }
        } catch (err) {
            console.error('Error fetching watchlists:', err);
            setError('Failed to load watchlists');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWatchlist = async () => {
        if (!newWatchlistTitle.trim()) {
            setError('Watchlist title is required');
            return;
        }

        try {
            setCreating(true);
            setError('');

            const watchlistData = {
                title: newWatchlistTitle.trim(),
                username: username,
                medias: selectedMedias
            };

            const response = await axios.post(`${API_URL}/create-watchlist`, watchlistData);

            if (response.data.success) {
                setNewWatchlistTitle('');
                setSelectedMedias([]);
                setShowCreateForm(false);
                await fetchWatchlists(); // Refresh the watchlists
            } else {
                setError('Failed to create watchlist');
            }
        } catch (err) {
            console.error('Error creating watchlist:', err);
            setError('Failed to create watchlist');
        } finally {
            setCreating(false);
        }
    };

    const handleAddMediaToWatchlist = async (watchlistId, mediaIds) => {
        try {
            const mediaData = {
                watchlistid: watchlistId,
                medias: mediaIds
            };

            const response = await axios.post(`${API_URL}/add-media`, mediaData);

            if (response.data.success) {
                console.log('Media added to watchlist successfully');
                // Optionally refresh watchlists or show success message
            } else {
                setError('Failed to add media to watchlist');
            }
        } catch (err) {
            console.error('Error adding media to watchlist:', err);
            setError('Failed to add media to watchlist');
        }
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
        setNewWatchlistTitle('');
        setSelectedMedias([]);
        setError('');
    };

    if (loading) {
        return <div className="watchlist-loading">Loading watchlists...</div>;
    }

    return (
        <div className="watchlists-section">
            <div className="watchlists-header">
                <h2>Your Watchlists</h2>
                <button 
                    className="create-watchlist-btn"
                    onClick={() => setShowCreateForm(true)}
                >
                    + Create Watchlist
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showCreateForm && (
                <div className="create-watchlist-form">
                    <div className="form-group">
                        <label htmlFor="watchlist-title">Watchlist Title</label>
                        <input
                            id="watchlist-title"
                            type="text"
                            value={newWatchlistTitle}
                            onChange={(e) => setNewWatchlistTitle(e.target.value)}
                            placeholder="Enter watchlist title"
                            maxLength={100}
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            onClick={handleCreateWatchlist}
                            disabled={creating || !newWatchlistTitle.trim()}
                            className="save-btn"
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                        <button 
                            onClick={handleCancelCreate}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="watchlists-container">
                {watchlists.length === 0 ? (
                    <div className="watchlist-placeholder">
                        <p>No watchlists created yet</p>
                        <button 
                            className="create-watchlist-btn"
                            onClick={() => setShowCreateForm(true)}
                        >
                            + Create Your First Watchlist
                        </button>
                    </div>
                ) : (
                    <div className="watchlists-grid">
                        {watchlists.map((watchlist) => (
                            <div key={watchlist.watchlistid} className="watchlist-card">
                                <div className="watchlist-header-card">
                                    <h3>{watchlist.title}</h3>
                                    <span className={`status ${watchlist.iscomplete ? 'complete' : 'incomplete'}`}>
                                        {watchlist.iscomplete ? 'Complete' : 'In Progress'}
                                    </span>
                                </div>
                                <div className="watchlist-actions">
                                    <button 
                                        className="view-btn"
                                        onClick={() => {
                                            // Navigate to watchlist detail view
                                            console.log('View watchlist:', watchlist.watchlistid);
                                        }}
                                    >
                                        View
                                    </button>
                                    <button 
                                        className="add-media-btn"
                                        onClick={() => {
                                            // Open media selection modal
                                            console.log('Add media to:', watchlist.watchlistid);
                                        }}
                                    >
                                        Add Media
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;
