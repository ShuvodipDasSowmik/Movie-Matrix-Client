import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ComponentStyles/GenrePreference.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GenrePreference = ({ username }) => {
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(async () => {
        await fetchGenrePreferences();
        await fetchAvailableGenres();
    }, [username]);

    // Fetch user's genre preferences
    const fetchGenrePreferences = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await axios.get(`${API_URL}/genre-pref/${username}`);
            
            if (response.status === 200) {
                setPreferences(response.data.genreData || []);
            } else {
                setError('Failed to fetch genre preferences');
            }
        } catch (err) {
            console.error('Error fetching genre preferences:', err);
            setError('Failed to load genre preferences');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all available genres
    const fetchAvailableGenres = async () => {
        try {
            const response = await axios.get(`${API_URL}/available-genres`);
            
            if (response.status === 200) {
                setAvailableGenres(response.data.genres || []);
            } else {
                console.error('Failed to fetch available genres');
            }
        } catch (err) {
            console.error('Error fetching available genres:', err);
        }
    };

    // Add a new genre preference
    const handleAddGenrePreference = async () => {
        if (!selectedGenre.trim()) {
            setError('Please select a genre');
            return;
        }

        // Check if genre already exists in preferences
        if (preferences.some(pref => pref.genrename.toLowerCase() === selectedGenre.toLowerCase())) {
            setError('This genre is already in your preferences');
            return;
        }

        try {
            setAdding(true);
            setError('');

            // Find the genre ID from available genres
            const genreObj = availableGenres.find(g => g.genrename === selectedGenre);
            if (!genreObj) {
                setError('Invalid genre selected');
                return;
            }

            const response = await axios.post(`${API_URL}/add-genre-pref`, {
                username: username,
                genreid: genreObj.genreid
            });

            if (response.status === 200) {
                setSelectedGenre('');
                setShowAddForm(false);
                await fetchGenrePreferences(); // Refresh preferences
            } else {
                setError('Failed to add genre preference');
            }
        } catch (err) {
            console.error('Error adding genre preference:', err);
            if (err.response?.status === 500 && err.response?.data?.message?.includes('already exists')) {
                setError('This genre is already in your preferences');
            } else {
                setError('Failed to add genre preference');
            }
        } finally {
            setAdding(false);
        }
    };

    // Remove a genre preference
    const handleRemoveGenrePreference = async (genreId) => {
        try {
            setRemoving(true);
            setError('');

            const response = await axios.delete(`${API_URL}/remove-genre-pref/${username}/${genreId}`);

            if (response.status === 200) {
                await fetchGenrePreferences(); // Refresh preferences
            } else {
                setError('Failed to remove genre preference');
            }
        } catch (err) {
            console.error('Error removing genre preference:', err);
            setError('Failed to remove genre preference');
        } finally {
            setRemoving(false);
        }
    };

    // Get genres that are not already in user's preferences
    const getAvailableGenresForSelection = () => {
        return availableGenres.filter(genre => 
            !preferences.some(pref => pref.genrename.toLowerCase() === genre.genrename.toLowerCase())
        );
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
        setSelectedGenre('');
        setError('');
    };

    if (loading) {
        return <div className="genre-preference-loading">Loading genre preferences...</div>;
    }

    return (
        <div className="genre-preference-section">
            <div className="genre-preference-header">
                <h2>Genre Preferences</h2>
                <div className="genre-preference-controls">
                    <button 
                        className="add-genre-btn"
                        onClick={() => setShowAddForm(true)}
                        disabled={getAvailableGenresForSelection().length === 0}
                    >
                        + Add Genre
                    </button>
                    <button 
                        className={`toggle-btn ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Add Genre Form */}
            {showAddForm && (
                <div className="add-genre-form">
                    <div className="form-group">
                        <label htmlFor="genre-select">Select Genre</label>
                        <select
                            id="genre-select"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        >
                            <option value="">Choose a genre...</option>
                            {getAvailableGenresForSelection().map((genre) => (
                                <option key={genre.genreid} value={genre.genrename}>
                                    {genre.genrename}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <button 
                            onClick={handleAddGenrePreference}
                            disabled={adding || !selectedGenre.trim()}
                            className="save-btn"
                        >
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                        <button 
                            onClick={handleCancelAdd}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Preferences Display */}
            <div className={`genre-preference-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                {preferences.length === 0 ? (
                    <div className="no-preferences">
                        <p>No genre preferences set</p>
                        <button 
                            className="add-genre-btn"
                            onClick={() => setShowAddForm(true)}
                            disabled={getAvailableGenresForSelection().length === 0}
                        >
                            + Add Your First Genre
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="preference-stats">
                            <span className="stat-item">
                                Total Preferences: <strong>{preferences.length}</strong>
                            </span>
                        </div>

                        <div className="preferences-grid">
                            {preferences.map((preference) => (
                                <div key={preference.genreid} className="preference-card">
                                    <div className="preference-header">
                                        <h3>{preference.genrename}</h3>
                                        <button 
                                            className="remove-preference-btn"
                                            onClick={() => handleRemoveGenrePreference(preference.genreid)}
                                            disabled={removing}
                                            title="Remove preference"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {!isExpanded && preferences.length > 0 && (
                <div className="preference-summary">
                    <div className="summary-tags">
                        {preferences.slice(0, 5).map((preference) => (
                            <span key={preference.genreid} className="preference-tag">
                                {preference.genrename}
                            </span>
                        ))}
                        {preferences.length > 5 && (
                            <span className="more-tag">
                                +{preferences.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenrePreference;