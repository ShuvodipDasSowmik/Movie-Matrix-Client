import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './ComponentStyles/AddToWatchlist.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AddToWatchlist = ({ mediaId, mediaType, buttonText = '+ Add to Watchlist', buttonClassName = '' }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newWatchlistTitle, setNewWatchlistTitle] = useState('');
  const [creatingWatchlist, setCreatingWatchlist] = useState(false);

  useEffect(() => {
    if (showModal && user) {
      fetchWatchlists();
    }
  }, [showModal, user]);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/watchlist/${user.username}`);
      
      if (response.data.success) {
        setWatchlists(response.data.watchlist || []);
      }
      
      else {
        setError('Failed to fetch watchlists');
      }
    }
    
    catch (err) {
      console.error('Error fetching watchlists:', err);
      setError('Failed to load watchlists');
    }
    
    finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) {
      setError('Please select a watchlist');
      return;
    }

    try {
      setAddingToWatchlist(true);
      setError('');

      const mediaData = {
        watchlistid: selectedWatchlist,
        medias: [mediaId]
      };

      const response = await axios.post(`${API_URL}/add-media`, mediaData);

      if (response.data.success) {
        setSuccess('Added to watchlist successfully');
        setTimeout(() => {
          setShowModal(false);
          setSuccess('');
        }, 1500);
      }
      
      else {
        setError('Failed to add to watchlist');
      }
    }
    
    catch (err) {
      console.error('Error adding to watchlist:', err);
      setError(err.response.data.message);
    }
    
    finally {
      setAddingToWatchlist(false);
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistTitle.trim()) {
      setError('Watchlist title is required');
      return;
    }

    try {
      setCreatingWatchlist(true);
      setError('');

      const watchlistData = {
        title: newWatchlistTitle.trim(),
        username: user.username,
        medias: [mediaId]
      };

      const response = await axios.post(`${API_URL}/create-watchlist`, watchlistData);

      if (response.data.success) {
        setSuccess('Created watchlist and added media successfully');
        setNewWatchlistTitle('');
        setTimeout(() => {
          setShowModal(false);
          setSuccess('');
        }, 1500);
      } else {
        setError('Failed to create watchlist');
      }
    } catch (err) {
      console.error('Error creating watchlist:', err);
      setError('Failed to create watchlist');
    } finally {
      setCreatingWatchlist(false);
    }
  };

  const handleOpenModal = () => {
    if (!user) {
      // Handle unauthenticated users - could redirect to login or show a message
      alert('Please log in to add media to your watchlist');
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setSuccess('');
    setSelectedWatchlist('');
    setNewWatchlistTitle('');
  };

  return (
    <>
      <button 
        className={`add-to-watchlist-button ${buttonClassName}`}
        onClick={handleOpenModal}
      >
        {buttonText}
      </button>
      
      {showModal && (
        <div className="watchlist-modal-overlay">
          <div className="watchlist-modal">
            <div className="watchlist-modal-header">
              <h3>Add to Watchlist</h3>
              <button 
                className="close-modal-btn"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="watchlist-modal-content">
              {loading ? (
                <div className="watchlist-loading">Loading watchlists...</div>
              ) : (
                <>
                  {watchlists.length > 0 ? (
                    <div className="existing-watchlists">
                      <h4>Select a watchlist:</h4>
                      <div className="watchlist-select">
                        <select 
                          value={selectedWatchlist}
                          onChange={(e) => setSelectedWatchlist(e.target.value)}
                        >
                          <option value="">-- Select a watchlist --</option>
                          {watchlists.map((watchlist) => (
                            <option 
                              key={watchlist.watchlistid} 
                              value={watchlist.watchlistid}
                            >
                              {watchlist.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        className="add-btn"
                        onClick={handleAddToWatchlist}
                        disabled={addingToWatchlist || !selectedWatchlist}
                      >
                        {addingToWatchlist ? 'Adding...' : 'Add to Selected Watchlist'}
                      </button>
                    </div>
                  ) : null}
                  
                  <div className="create-new-watchlist">
                    <h4>Or create a new watchlist:</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Enter new watchlist title"
                        value={newWatchlistTitle}
                        onChange={(e) => setNewWatchlistTitle(e.target.value)}
                      />
                    </div>
                    <button 
                      className="create-btn"
                      onClick={handleCreateWatchlist}
                      disabled={creatingWatchlist || !newWatchlistTitle.trim()}
                    >
                      {creatingWatchlist ? 'Creating...' : 'Create New Watchlist'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddToWatchlist;
