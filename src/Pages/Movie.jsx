import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './PageStyles/Movie.css';
import MediaReview from '../Components/MediaReview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Movie = () => {
  const { mediaid } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  
  // Watchlist related state
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlists, setWatchlists] = useState([]);
  const [loadingWatchlists, setLoadingWatchlists] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [watchlistSuccess, setWatchlistSuccess] = useState('');
  const [watchlistError, setWatchlistError] = useState('');
  const [newWatchlistTitle, setNewWatchlistTitle] = useState('');
  const [creatingWatchlist, setCreatingWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/movie/${mediaid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movie data');
        }
        
        const data = await response.json();
        setMovie(data.movieData);
        setLoading(false);

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (mediaid) {
      fetchMovie();
    }
  }, [mediaid]);

  // Fetch watchlists when modal is opened
  useEffect(() => {
    if (showWatchlistModal && user) {
      fetchWatchlists();
    }
  }, [showWatchlistModal, user]);

  const fetchWatchlists = async () => {
    try {
      setLoadingWatchlists(true);
      const response = await axios.get(`${API_URL}/watchlist/${user.username}`);
      
      if (response.data.success) {
        setWatchlists(response.data.watchlist || []);
      } else {
        setWatchlistError('Failed to fetch watchlists');
      }
    } catch (err) {
      console.error('Error fetching watchlists:', err);
      setWatchlistError('Failed to load watchlists');
    } finally {
      setLoadingWatchlists(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlist) {
      setWatchlistError('Please select a watchlist');
      return;
    }

    try {
      setAddingToWatchlist(true);
      setWatchlistError('');

      const mediaData = {
        watchlistid: selectedWatchlist,
        medias: [mediaid]
      };

      const response = await axios.post(`${API_URL}/add-media`, mediaData);

      if (response.data.success) {
        setWatchlistSuccess('Added to watchlist successfully');
        setTimeout(() => {
          setShowWatchlistModal(false);
          setWatchlistSuccess('');
        }, 1500);
      } else {
        setWatchlistError('Failed to add to watchlist');
      }
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      setWatchlistError('Failed to add to watchlist');
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistTitle.trim()) {
      setWatchlistError('Watchlist title is required');
      return;
    }

    try {
      setCreatingWatchlist(true);
      setWatchlistError('');

      const watchlistData = {
        title: newWatchlistTitle.trim(),
        username: user.username,
        medias: [mediaid]
      };

      const response = await axios.post(`${API_URL}/create-watchlist`, watchlistData);

      if (response.data.success) {
        setWatchlistSuccess('Created watchlist and added movie successfully');
        setNewWatchlistTitle('');
        setTimeout(() => {
          setShowWatchlistModal(false);
          setWatchlistSuccess('');
        }, 1500);
      } else {
        setWatchlistError('Failed to create watchlist');
      }
    } catch (err) {
      console.error('Error creating watchlist:', err);
      setWatchlistError('Failed to create watchlist');
    } finally {
      setCreatingWatchlist(false);
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = movie?.trailerlink ? getYoutubeId(movie.trailerlink) : null;

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!movie) return <div className="no-movie">Movie not found</div>;

  return (
    <div className="movie-dashboard youtube-style">
      <div className="content-container">
        <div className="primary-content">
          {/* Trailer Section */}
          {youtubeId ? (
            <div className="trailer-container">
              <iframe 
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${movie.title} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="poster-container">
              <img src={movie.poster} alt={`${movie.title} poster`} />
            </div>
          )}
          
          <div className="movie-info">
            <h1 className="movie-title">{movie.title}</h1>
            <p className="movie-description">{movie.description}</p>
          </div>

          {/* Show reviews to all users, but only logged-in users can add reviews */}
          <MediaReview mediaid={mediaid} />
        </div>
        
        <div className="secondary-content">
          <div className="movie-metadata">
            <div className="poster-small">
              <img src={movie.poster} alt={`${movie.title} poster`} />
              {user && (
                <button 
                  className="add-to-watchlist-btn"
                  onClick={() => setShowWatchlistModal(true)}
                >
                  + Add to Watchlist
                </button>
              )}
            </div>
            
            <div className="meta-details">
              <div className="rating-container">
                <span className="rating-value">{movie.overallrating}</span>
                <span className="rating-max">/10</span>
              </div>
              
              <div className="movie-meta">
                <div className="meta-item">
                  <span className="meta-label">Release Year:</span>
                  <span className="meta-value">{movie.releaseyear}</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Duration:</span>
                  <span className="meta-value">{movie.duration} min</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Language:</span>
                  <span className="meta-value">{movie.language}</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">PG Rating:</span>
                  <span className="meta-value">{movie.pgrating}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Awards Section */}
          {movie.awards && movie.awards.length > 0 && (
            <div className="info-section awards-section">
              <h2>Awards</h2>
              <div className="awards-list">
                {movie.awards.map((award, index) => (
                  <div key={index} className="award-item">
                    <div className="award-name">{award.awardname}</div>
                    <div className="award-details">
                      <span className="award-category">{award.awardcategory}</span>
                      <span className="award-year">({award.year})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Genres Section */}
          {movie.genre && movie.genre.length > 0 && (
            <div className="info-section genre-section">
              <h2>Genres</h2>
              <div className="genre-list">
                {movie.genre.map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre.genrename}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Cast Section - Moved under Genres */}
          <div className="cast-section">
            <h2>Cast</h2>
            <div className="cast-list">
              {movie.cast && movie.cast.map((actor, index) => (
                <Link 
                  to={`/actor/${actor.actorid}`} 
                  className="cast-item" 
                  key={index}
                >
                  <div className="actor-image">
                    <img src={actor.picture} alt={actor.actorname} />
                  </div>
                  <div className="actor-name">{actor.actorname}</div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Directors Section */}
          {movie.director && movie.director.length > 0 && (
            <div className="info-section director-section">
              <h2>Directors</h2>
              <div className="person-list">
                {movie.director.map((director, index) => (
                  <div key={index} className="person-item">
                    <div className="person-image">
                      <img src={director.picture} alt={director.directorname} />
                    </div>
                    <div className="person-name">{director.directorname}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Studios Section */}
          {movie.studio && movie.studio.length > 0 && (
            <div className="info-section studio-section">
              <h2>Studios</h2>
              <div className="studio-list">
                {movie.studio.map((studio, index) => (
                  <div key={index} className="studio-item">
                    <div className="studio-logo">
                      <img src={studio.picture} alt={studio.studioname} />
                    </div>
                    <div className="studio-name">{studio.studioname}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add to Watchlist Modal */}
      {showWatchlistModal && (
        <div className="watchlist-modal-overlay">
          <div className="watchlist-modal">
            <div className="watchlist-modal-header">
              <h3>Add to Watchlist</h3>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setShowWatchlistModal(false);
                  setWatchlistError('');
                  setWatchlistSuccess('');
                  setSelectedWatchlist('');
                }}
              >
                ×
              </button>
            </div>
            
            {watchlistSuccess && (
              <div className="success-message">
                {watchlistSuccess}
              </div>
            )}
            
            {watchlistError && (
              <div className="error-message">
                {watchlistError}
              </div>
            )}
            
            <div className="watchlist-modal-content">
              {loadingWatchlists ? (
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
    </div>
  );
};

export default Movie;
