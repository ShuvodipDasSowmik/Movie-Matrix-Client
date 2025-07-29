import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AddToWatchlist from '../Components/AddToWatchlist';
import './PageStyles/Movie.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GenrePage = () => {
  const { genreid } = useParams();
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext) || {};

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/media-by-genre/${genreid}`);
        if (!response.ok) throw new Error('Failed to fetch genre');
        const data = await response.json();
        setGenre(data.mediaData || []);
      }
      
      catch (err) {
        setError('Failed to fetch genre. Please try again later.');
      }
      finally {
        setLoading(false);
      }
    };

    if (genreid) fetchGenre();
  }, [genreid]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading genre...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Oops!</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!genre || genre.length === 0) {
    return <div className="no-movie">No media found for this genre.</div>;
  }

  return (
    <div className="movie-dashboard youtube-style">
      <h1 className="movie-title">{genre[0].genrename} Shows</h1>
      <div className="info-section genre-section">
        <div className="movies-grid">
          {genre.map((item) => (
            <div className="movies-list-card-wrapper" key={`${item.mediaid}-${item.title}`}>
              <Link
                to={`/${item.mediatype === 'movie' ? 'movie' : 'series1'}/${item.mediaid}`}
                className="movies-list-card"
              >
                <div className="movies-list-card-inner">
                  <div className="movies-list-image-container">
                    <img
                      src={
                        item.poster ||
                        'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png'
                      }
                      alt={item.title}
                      className="movies-list-image"
                    />
                  </div>
                  <div className="movies-list-info">
                    <h3 className="movies-list-title">{item.title}</h3>
                    <div className="movies-list-details">
                      <span className="movies-list-year">{item.releaseyear || 'N/A'}</span>
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
                    mediaType={item.mediatype}
                    buttonText="+ Watchlist"
                    buttonClassName="movies-watchlist-btn"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenrePage;
