import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AddToWatchlist from '../Components/AddToWatchlist';
import './PageStyles/Movies.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Movies = () => {
  const [content, setContent] = useState([]);
  const [contentType, setContentType] = useState('movies'); // Default to movies
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('title'); // Default sort by title
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending order
  const { user } = useContext(AuthContext) || {};

  useEffect(() => {
    fetchContent(contentType);
  }, [contentType]);

  useEffect(() => {
    if (content.length > 0) {
      sortContent();
    }
  }, [sortBy, sortOrder]);

  const fetchContent = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = type === 'movies' ? 'movies' : 'series';
      const response = await fetch(`${API_URL}/${endpoint}`);
      
      if (!response.ok) {
        console.log(response);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle response data based on content type
      const responseData = type === 'movies' ? data.movieData : data.seriesData;
      setContent(responseData || []);
      setLoading(false);
      
      console.log(data);
    } catch (err) {
      setError(`Failed to fetch ${contentType}. Please try again later.`);
      setLoading(false);
      console.error(`Error fetching ${contentType}:`, err);
    }
  };

  const sortContent = () => {
    const sortedContent = [...content].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'releaseyear':
          aValue = parseInt(a.releaseyear) || 0;
          bValue = parseInt(b.releaseyear) || 0;
          break;
        case 'overallrating':
          aValue = parseFloat(a.overallrating) || 0;
          bValue = parseFloat(b.overallrating) || 0;
          break;
        default:
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setContent(sortedContent);
  };

  const handleContentTypeChange = (type) => {
    if (type !== contentType) {
      setContentType(type);
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Function to get the appropriate year field based on content type
  const getYearDisplay = (item) => {
    // Both movies and series use releaseyear from MEDIA table
    return item.releaseyear || 'N/A';
  };

  // Function to get the appropriate route based on content type
  const getRoutePrefix = () => {
    return contentType === 'movies' ? 'movie' : 'series1';
  };

  if (loading) {
    return (
      <div className="movies-loading">
        <div className="spinner"></div>
        <p>Loading {contentType}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movies-error">
        <h3>Oops!</h3>
        <p>{error}</p>
        <button onClick={() => fetchContent(contentType)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="movies-container">
      <h1 className="movies-title">
        Browse {contentType === 'movies' ? 'Movies' : 'TV Series'}
      </h1>
      
      <div className="content-controls">
        <div className="content-type-selector">
          <button 
            className={`content-type-btn ${contentType === 'movies' ? 'active' : ''}`}
            onClick={() => handleContentTypeChange('movies')}
          >
            Movies
          </button>
          <button 
            className={`content-type-btn ${contentType === 'series' ? 'active' : ''}`}
            onClick={() => handleContentTypeChange('series')}
          >
            Series
          </button>
        </div>
        
        <div className="sort-selector">
          <label htmlFor="sort-dropdown" className="sort-label">Sort by:</label>
          <select 
            id="sort-dropdown"
            className="sort-dropdown"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="releaseyear-desc">Release Year (Newest)</option>
            <option value="releaseyear-asc">Release Year (Oldest)</option>
            <option value="overallrating-desc">Rating (Highest)</option>
            <option value="overallrating-asc">Rating (Lowest)</option>
          </select>
        </div>
      </div>
      
      {content.length === 0 ? (
        <p className="no-movies">No {contentType} found.</p>
      ) : (
        <div className="movies-grid">
          {content.map((item) => (
            <div className="movies-list-card-wrapper" key={`${item.mediaid}-${item.title}`}>
              <Link 
                to={`/${getRoutePrefix()}/${item.mediaid}`} 
                className="movies-list-card"
              >
                <div className="movies-list-card-inner">
                  <div className="movies-list-image-container">
                    <img 
                      src={item.poster || 'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png'} 
                      alt={item.title} 
                      className="movies-list-image" 
                    />
                  </div>
                  <div className="movies-list-info">
                    <h3 className="movies-list-title">{item.title}</h3>
                    <div className="movies-list-details">
                      <span className="movies-list-year">{getYearDisplay(item)}</span>
                      <span className="movies-list-rating">{item.pgrating}</span>
                    </div>
                    <div className="movies-list-meta">
                      <div className="movies-list-language">{item.language}</div>
                      <div className="movies-list-score">
                        <span className="star-icon">★</span>
                        <span>{item.overallrating}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {user && AddToWatchlist && (
                <div className="movies-list-actions">
                  <AddToWatchlist 
                    mediaId={item.mediaid}
                    mediaType={contentType === 'movies' ? 'movie' : 'series'}
                    buttonText="+ Watchlist"
                    buttonClassName="movies-watchlist-btn"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;