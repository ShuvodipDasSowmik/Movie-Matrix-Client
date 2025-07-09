import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles/Movies.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Movies = () => {
  const [content, setContent] = useState([]);
  const [contentType, setContentType] = useState('movies'); // Default to movies
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent(contentType);
  }, [contentType]);

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

  const handleContentTypeChange = (type) => {
    if (type !== contentType) {
      setContentType(type);
    }
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
      
      {content.length === 0 ? (
        <p className="no-movies">No {contentType} found.</p>
      ) : (
        <div className="movies-grid">
          {content.map((item) => (
            <Link 
              to={`/${getRoutePrefix()}/${item.mediaid}`} 
              className="movies-list-card" 
              key={`${item.mediaid}-${item.title}`}
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
                  {/* This section is removed since seasoncount and isOngoing are not available in getAllSeries */}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;