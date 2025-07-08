import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PageStyles/Movie.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Movie = () => {
  const { mediaid } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        // Replace with your actual backend URL
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!movie) return <div className="no-movie">Movie not found</div>;

  const getYoutubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(movie.trailerlink);

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
        </div>
        
        <div className="secondary-content">
          <div className="movie-metadata">
            <div className="poster-small">
              <img src={movie.poster} alt={`${movie.title} poster`} />
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
    </div>
  );
};

export default Movie;
