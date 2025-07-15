import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ComponentStyles/Watchlist.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Watchlist = ({ username }) => {
    const [watchlists, setWatchlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newWatchlistTitle, setNewWatchlistTitle] = useState('');
    const [selectedMedias, setSelectedMedias] = useState([]);
    const [creating, setCreating] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [currentWatchlistId, setCurrentWatchlistId] = useState(null);
    const [availableMedia, setAvailableMedia] = useState([]);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [mediaType, setMediaType] = useState('movies'); // 'movies' or 'series'
    const [selectedMediaIds, setSelectedMediaIds] = useState([]);
    const [addingMedia, setAddingMedia] = useState(false);
    const [watchlistDetail, setWatchlistDetail] = useState(null);
    const [showWatchlistDetail, setShowWatchlistDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editWatchlistTitle, setEditWatchlistTitle] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [removingMedia, setRemovingMedia] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [watchedMediaIds, setWatchedMediaIds] = useState([]);
    const [updatingWatched, setUpdatingWatched] = useState(false);

    useEffect(() => {
        fetchWatchlists();
    }, [username]);

    // When media modal is opened, fetch available media
    useEffect(() => {
        if (showMediaModal) {
            fetchAvailableMedia(mediaType);
        }
    }, [showMediaModal, mediaType]);

    // Fetch watchlists from API
    const fetchWatchlists = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/watchlist/${username}`);
            
            if (response.status === 200) {
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

    // Fetch watchlist detail (media list)
    const fetchWatchlistDetail = async (watchlistId) => {
        try {
            setDetailLoading(true);
            setError('');
            setWatchedMediaIds([]); // Reset watched media selections
            
            const response = await axios.get(`${API_URL}/get-watchlist/${watchlistId}`);
            
            if (response.status === 200) {
                console.log('Watchlist detail response:', response.data);
                const mediaList = response.data.mediaList || [];
                
                setWatchlistDetail({
                    id: watchlistId,
                    mediaList: mediaList
                });
                
                // Remove any media items that are already marked as watched from the selection
                setWatchedMediaIds(prev => prev.filter(id => {
                    const media = mediaList.find(m => m.mediaid === id);
                    return media && !media.iswatched;
                }));
                
                // Find the watchlist to get its title and complete status
                const watchlist = watchlists.find(w => w.watchlistid === watchlistId);
                if (watchlist) {
                    setEditWatchlistTitle(watchlist.title);
                    setIsComplete(watchlist.iscomplete);
                }
                
                setShowWatchlistDetail(true);
            } else {
                setError('Failed to fetch watchlist details');
            }
        } catch (err) {
            console.error('Error fetching watchlist details:', err);
            setError('Failed to load watchlist details');
        } finally {
            setDetailLoading(false);
        }
    };

    // Fetch available media (movies or series) to add to watchlist
    const fetchAvailableMedia = async (type) => {
        try {
            setMediaLoading(true);
            const endpoint = type === 'movies' ? 'movies' : 'series';
            const response = await axios.get(`${API_URL}/${endpoint}`);
            
            if (!response.data) {
                throw new Error(`Error fetching data: No response data`);
            }
            
            // Handle response data based on content type
            const responseData = type === 'movies' ? response.data.movieData : response.data.seriesData;
            setAvailableMedia(responseData || []);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
            setError(`Failed to fetch ${type}. Please try again later.`);
        } finally {
            setMediaLoading(false);
        }
    };

    // Handle media type change in selection modal
    const handleMediaTypeChange = (type) => {
        if (type !== mediaType) {
            setMediaType(type);
            setSelectedMediaIds([]);
        }
    };

    // Toggle selection of a media item
    const toggleMediaSelection = (mediaId) => {
        setSelectedMediaIds(prev => {
            if (prev.includes(mediaId)) {
                return prev.filter(id => id !== mediaId);
            } else {
                return [...prev, mediaId];
            }
        });
    };

    // Handle creating a new watchlist
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
                medias: selectedMediaIds
            };

            const response = await axios.post(`${API_URL}/create-watchlist`, watchlistData);

            if (response.status === 200) {
                setNewWatchlistTitle('');
                setSelectedMediaIds([]);
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

    // Handle updating a watchlist
    const handleUpdateWatchlist = async () => {
        if (!editWatchlistTitle.trim()) {
            setError('Watchlist title is required');
            return;
        }

        try {
            setUpdating(true);
            setError('');

            const watchlistData = {
                watchlistid: watchlistDetail.id,
                title: editWatchlistTitle.trim(),
                iscomplete: isComplete
            };

            const response = await axios.put(`${API_URL}/update-watchlist/${watchlistDetail.id}`, watchlistData);

            if (response.status === 200) {
                setShowEditForm(false);
                await fetchWatchlists(); // Refresh the watchlists
            } else {
                setError('Failed to update watchlist');
            }
        } catch (err) {
            console.error('Error updating watchlist:', err);
            setError('Failed to update watchlist');
        } finally {
            setUpdating(false);
        }
    };

    // Handle deleting a watchlist
    const handleDeleteWatchlist = async () => {
        try {
            setDeleting(true);
            setError('');

            const response = await axios.delete(`${API_URL}/delete-watchlist/${watchlistDetail.id}`);

            if (response.status === 200) {
                setShowConfirmDelete(false);
                setShowWatchlistDetail(false);
                setWatchlistDetail(null);
                await fetchWatchlists(); // Refresh the watchlists
            } else {
                setError('Failed to delete watchlist');
            }
        } catch (err) {
            console.error('Error deleting watchlist:', err);
            setError('Failed to delete watchlist');
        } finally {
            setDeleting(false);
        }
    };

    // Handle adding media to an existing watchlist
    const handleAddMediaToWatchlist = async () => {
        if (selectedMediaIds.length === 0) {
            setError('No media selected');
            return;
        }

        try {
            setAddingMedia(true);
            setError('');

            const mediaData = {
                watchlistid: currentWatchlistId,
                medias: selectedMediaIds
            };

            const response = await axios.post(`${API_URL}/add-media`, mediaData);

            if (response.status === 200) {
                setSelectedMediaIds([]);
                setShowMediaModal(false);
                
                // If we're currently viewing the watchlist details, refresh them
                if (showWatchlistDetail && watchlistDetail?.id === currentWatchlistId) {
                    await fetchWatchlistDetail(currentWatchlistId);
                }
                
                await fetchWatchlists(); // Refresh the watchlists
            } else {
                setError('Failed to add media to watchlist');
            }
        } catch (err) {
            console.error('Error adding media to watchlist:', err);
            setError('Failed to add media to watchlist');
        } finally {
            setAddingMedia(false);
        }
    };

    // Handle removing media from a watchlist
    const handleRemoveMediaFromWatchlist = async (mediaId) => {
        try {
            setRemovingMedia(true);
            setError('');

            const response = await axios.delete(`${API_URL}/remove-media/${watchlistDetail.id}/${mediaId}`);

            if (response.status === 200) {
                // Refresh the watchlist details
                await fetchWatchlistDetail(watchlistDetail.id);
            } else {
                setError('Failed to remove media from watchlist');
            }
        } catch (err) {
            console.error('Error removing media from watchlist:', err);
            setError('Failed to remove media from watchlist');
        } finally {
            setRemovingMedia(false);
        }
    };
    
    // Toggle watched status for a media item
    const toggleWatchedMedia = (mediaId) => {
        // Check if the media is already marked as watched in the backend data
        const media = watchlistDetail.mediaList.find(m => m.mediaid === mediaId);
        if (media && media.iswatched) {
            return; // Don't toggle if it's already watched in the database
        }
        
        setWatchedMediaIds(prev => {
            if (prev.includes(mediaId)) {
                return prev.filter(id => id !== mediaId);
            } else {
                return [...prev, mediaId];
            }
        });
    };
    
    // Update watched status for selected media items
    const handleUpdateWatchedStatus = async () => {
        if (watchedMediaIds.length === 0) {
            setError('No media items selected');
            return;
        }
        
        try {
            setUpdatingWatched(true);
            setError('');
            setSuccessMessage('');
            
            // Filter out any media that might already be marked as watched
            const mediasToUpdate = watchedMediaIds.filter(mediaId => {
                const media = watchlistDetail.mediaList.find(m => m.mediaid === mediaId);
                return media && !media.iswatched;
            });
            
            if (mediasToUpdate.length === 0) {
                setError('No unwatched media items selected');
                setUpdatingWatched(false);
                return;
            }
            
            const watchedData = {
                watchlistid: watchlistDetail.id,
                medias: mediasToUpdate
            };
            
            const response = await axios.post(`${API_URL}/update-watched-status`, watchedData);
            
            if (response.status === 200) {
                // Show success message
                setSuccessMessage(`Successfully marked ${mediasToUpdate.length} item(s) as watched!`);
                
                // Reset selection and refresh data
                setWatchedMediaIds([]);
                await fetchWatchlistDetail(watchlistDetail.id);
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000);
            } else {
                setError('Failed to update watched status');
            }
        } catch (err) {
            console.error('Error updating watched status:', err);
            setError('Failed to update watched status');
        } finally {
            setUpdatingWatched(false);
        }
    };

    // Open media selection modal for a specific watchlist
    const openMediaSelectionModal = (watchlistId) => {
        setCurrentWatchlistId(watchlistId);
        setSelectedMediaIds([]);
        setMediaType('movies');
        setShowMediaModal(true);
    };

    // Close media selection modal
    const closeMediaModal = () => {
        setShowMediaModal(false);
        setSelectedMediaIds([]);
        setCurrentWatchlistId(null);
    };

    // Close watchlist detail view
    const closeWatchlistDetail = () => {
        setShowWatchlistDetail(false);
        setWatchlistDetail(null);
        setShowEditForm(false);
        setWatchedMediaIds([]);
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
        setNewWatchlistTitle('');
        setSelectedMediaIds([]);
        setError('');
    };

    const handleCancelEdit = () => {
        setShowEditForm(false);
        const watchlist = watchlists.find(w => w.watchlistid === watchlistDetail.id);
        if (watchlist) {
            setEditWatchlistTitle(watchlist.title);
            setIsComplete(watchlist.iscomplete);
        }
    };

    if (loading) {
        return <div className="watchlist-loading">Loading watchlists...</div>;
    }

    // Render watchlist detail view
    if (showWatchlistDetail) {
        return (
            <div className="watchlists-section watchlist-detail">
                <div className="watchlist-detail-header">
                    <button 
                        className="back-btn"
                        onClick={closeWatchlistDetail}
                    >
                        ← Back to Watchlists
                    </button>
                    
                    {!showEditForm ? (
                        <div className="watchlist-title-actions">
                            <h2>{editWatchlistTitle}</h2>
                            <div className="watchlist-actions-detail">
                                <button 
                                    className="edit-btn"
                                    onClick={() => setShowEditForm(true)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="delete-btn"
                                    onClick={() => setShowConfirmDelete(true)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="edit-watchlist-form">
                            <div className="form-group">
                                <label htmlFor="edit-watchlist-title">Watchlist Title</label>
                                <input
                                    id="edit-watchlist-title"
                                    type="text"
                                    value={editWatchlistTitle}
                                    onChange={(e) => setEditWatchlistTitle(e.target.value)}
                                    placeholder="Enter watchlist title"
                                    maxLength={100}
                                />
                            </div>
                            <div className="form-group">
                                <div className="checkbox-group">
                                    <input
                                        id="is-complete"
                                        type="checkbox"
                                        checked={isComplete}
                                        onChange={(e) => setIsComplete(e.target.checked)}
                                    />
                                    <label htmlFor="is-complete">Mark as Complete</label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button 
                                    onClick={handleUpdateWatchlist}
                                    disabled={updating || !editWatchlistTitle.trim()}
                                    className="save-btn"
                                >
                                    {updating ? 'Updating...' : 'Update'}
                                </button>
                                <button 
                                    onClick={handleCancelEdit}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                
                {detailLoading ? (
                    <div className="watchlist-loading">Loading watchlist media...</div>
                ) : watchlistDetail?.mediaList?.length > 0 ? (
                    <>
                        <div className="watchlist-stats">
                            <span className="stat-item">
                                Total: <strong>{watchlistDetail.mediaList.length}</strong>
                            </span>
                            <span className="stat-item">
                                Watched: <strong>
                                    {watchlistDetail.mediaList.filter(m => m.iswatched).length}
                                </strong>
                            </span>
                            <span className="stat-item">
                                Unwatched: <strong>
                                    {watchlistDetail.mediaList.filter(m => !m.iswatched).length}
                                </strong>
                            </span>
                        </div>
                        <div className="watchlist-media-grid">
                            {watchlistDetail.mediaList.map((media) => (
                                <div key={media.mediaid} className="watchlist-media-item">
                                    <div className="media-poster">
                                        <img 
                                            src={media.poster || 'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png'} 
                                            alt={media.title} 
                                        />
                                        <button 
                                            className="remove-media-btn"
                                            onClick={() => handleRemoveMediaFromWatchlist(media.mediaid)}
                                            disabled={removingMedia}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="media-info">
                                        <div className="media-title">{media.title}</div>
                                        <div className="media-meta">
                                            <span className="media-year">{media.releaseyear}</span>
                                            {media.pgrating && (
                                                <span className="media-rating">{media.pgrating}</span>
                                            )}
                                        </div>
                                        <div className="watched-checkbox">
                                            <label className={`watched-label ${media.iswatched ? 'disabled' : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={media.iswatched || watchedMediaIds.includes(media.mediaid)}
                                                    onChange={() => toggleWatchedMedia(media.mediaid)}
                                                    disabled={media.iswatched}
                                                />
                                                {media.iswatched ? (
                                                    <>Watched <span className="watched-status">✓</span></>
                                                ) : (
                                                    'Mark as watched'
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {watchedMediaIds.length > 0 && (
                            <div className="watched-update-container">
                                <button 
                                    className="update-watched-btn"
                                    onClick={handleUpdateWatchedStatus}
                                    disabled={updatingWatched}
                                >
                                    {updatingWatched ? 'Updating...' : `Mark ${watchedMediaIds.length} item(s) as watched`}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-media-message">
                        <p>This watchlist is empty</p>
                        <button 
                            className="add-media-btn-large"
                            onClick={() => openMediaSelectionModal(watchlistDetail.id)}
                        >
                            + Add Media
                        </button>
                    </div>
                )}
                
                <div className="watchlist-detail-footer">
                    <button 
                        className="add-media-btn-large"
                        onClick={() => openMediaSelectionModal(watchlistDetail.id)}
                    >
                        + Add More Media
                    </button>
                </div>

                {/* Confirm Delete Modal */}
                {showConfirmDelete && (
                    <div className="confirm-modal-overlay">
                        <div className="confirm-modal">
                            <h3>Delete Watchlist</h3>
                            <p>Are you sure you want to delete this watchlist? This action cannot be undone.</p>
                            <div className="confirm-actions">
                                <button 
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteWatchlist}
                                    disabled={deleting}
                                    className="delete-confirm-btn"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render watchlist list view (default view)
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
                    
                    <div className="media-selection-btn">
                        <button 
                            className="select-media-btn"
                            onClick={() => {
                                setCurrentWatchlistId(null); // Indicates we're creating a new watchlist
                                setShowMediaModal(true);
                            }}
                        >
                            Select Media
                        </button>
                        {selectedMediaIds.length > 0 && (
                            <span className="media-count">{selectedMediaIds.length} items selected</span>
                        )}
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
                                        onClick={() => fetchWatchlistDetail(watchlist.watchlistid)}
                                    >
                                        View
                                    </button>
                                    <button 
                                        className="add-media-btn"
                                        onClick={() => openMediaSelectionModal(watchlist.watchlistid)}
                                    >
                                        Add Media
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Media Selection Modal */}
            {showMediaModal && (
                <div className="media-modal-overlay">
                    <div className="media-modal">
                        <div className="media-modal-header">
                            <h3>Select Media</h3>
                            <button className="close-modal-btn" onClick={closeMediaModal}>×</button>
                        </div>

                        <div className="media-type-selector">
                            <button 
                                className={`media-type-btn ${mediaType === 'movies' ? 'active' : ''}`}
                                onClick={() => handleMediaTypeChange('movies')}
                            >
                                Movies
                            </button>
                            <button 
                                className={`media-type-btn ${mediaType === 'series' ? 'active' : ''}`}
                                onClick={() => handleMediaTypeChange('series')}
                            >
                                Series
                            </button>
                        </div>

                        <div className="media-list-container">
                            {mediaLoading ? (
                                <div className="media-loading">Loading {mediaType}...</div>
                            ) : availableMedia.length === 0 ? (
                                <div className="no-media">No {mediaType} available.</div>
                            ) : (
                                <div className="media-grid">
                                    {availableMedia.map((media) => (
                                        <div 
                                            key={media.mediaid}
                                            className={`media-item ${selectedMediaIds.includes(media.mediaid) ? 'selected' : ''}`}
                                            onClick={() => toggleMediaSelection(media.mediaid)}
                                        >
                                            <div className="media-poster">
                                                <img 
                                                    src={media.poster || 'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png'} 
                                                    alt={media.title} 
                                                />
                                                {selectedMediaIds.includes(media.mediaid) && (
                                                    <div className="selected-overlay">
                                                        <span className="checkmark">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="media-title">{media.title}</div>
                                            <div className="media-year">{media.releaseyear}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <span className="selected-count">{selectedMediaIds.length} items selected</span>
                            <div className="modal-actions">
                                <button onClick={closeMediaModal} className="cancel-btn">Cancel</button>
                                <button 
                                    onClick={currentWatchlistId ? handleAddMediaToWatchlist : () => {
                                        setShowMediaModal(false);
                                    }}
                                    disabled={selectedMediaIds.length === 0 || addingMedia}
                                    className="save-btn"
                                >
                                    {addingMedia ? 'Adding...' : currentWatchlistId ? 'Add to Watchlist' : 'Select'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Watchlist;
