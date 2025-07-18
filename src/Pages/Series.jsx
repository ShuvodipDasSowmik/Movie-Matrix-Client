import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PageStyles/Series.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Series = () => {
  const { mediaid } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [episodes, setEpisodes] = useState({});
  const [loadingEpisodes, setLoadingEpisodes] = useState({});

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/series1/${mediaid}`);

        if (!response.ok) {
          throw new Error('Failed to fetch TV series data');
        }

        const data = await response.json();
        console.log('Fetched series data:', data.seriesData);
        console.log('Seasons data:', data.seriesData?.seasons);
        setSeries(data.seriesData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (mediaid) {
      fetchSeries();
    }
  }, [mediaid]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!series) return <div className="no-series">TV Series not found</div>;

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchEpisodes = async (seasonId) => {
    try {
      console.log('Fetching episodes for seasonId:', seasonId); // Debug log
      setLoadingEpisodes(prev => ({ ...prev, [seasonId]: true }));
      
      // Replace this URL with your actual episodes endpoint
      const response = await fetch(`${API_URL}/episodes/${seasonId}`);
      
      console.log('Episodes API response status:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error('Failed to fetch episodes data');
      }
      
      const data = await response.json();
      console.log('Episodes API response data:', data); // Debug log
      console.log('Episodes data length:', data.episodesData?.length); // Debug log
      
      setEpisodes(prev => ({ ...prev, [seasonId]: data.episodesData || [] }));
      setLoadingEpisodes(prev => ({ ...prev, [seasonId]: false }));
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setEpisodes(prev => ({ ...prev, [seasonId]: [] }));
      setLoadingEpisodes(prev => ({ ...prev, [seasonId]: false }));
    }
  };

  const handleSeasonClick = (season, index) => {
    const seasonKey = season.seasonid || index;
    
    if (expandedSeason === seasonKey) {
      // Collapse if already expanded
      setExpandedSeason(null);
    } else {
      // Expand and fetch episodes if not already fetched
      setExpandedSeason(seasonKey);
      if (!episodes[seasonKey]) {
        fetchEpisodes(seasonKey);
      }
    }
  };

  const youtubeId = getYoutubeId(series.trailerlink);

  return (
    <div className="series-dashboard youtube-style">
      <div className="content-container">
        <div className="primary-content">
          {youtubeId ? (
            <div className="trailer-container">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${series.title || 'Series'} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="poster-container">
              <img 
                src={series.poster || 'https://via.placeholder.com/400x600?text=No+Image'} 
                alt={`${series.title || 'Series'} poster`} 
              />
            </div>
          )}

          <div className="series-info">
            <h1 className="series-title">{series.title || 'Unknown Title'}</h1>
            <p className="series-description">{series.description || 'No description available'}</p>
            
            {series.seasons && series.seasons.length > 0 && (
              <div className="seasons-section">
                <h3 className="seasons-title">Seasons</h3>
                <div className="seasons-list">
                  {series.seasons.map((season, index) => {
                    const seasonKey = season.seasonid || index;
                    const isExpanded = expandedSeason === seasonKey;
                    const seasonEpisodes = episodes[seasonKey] || [];
                    const isLoadingEpisodes = loadingEpisodes[seasonKey];
                    
                    return (
                      <div key={index} className="season-container">
                        <button 
                          className={`season-button ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => handleSeasonClick(season, index)}
                        >
                          <span>{season.seasontitle}</span>
                          <span className={`arrow ${isExpanded ? 'rotated' : ''}`}>▼</span>
                        </button>
                        
                        <div className={`episodes-container ${isExpanded ? 'expanded' : ''}`}>
                          {isLoadingEpisodes ? (
                            <div className="episodes-loading">Loading episodes...</div>
                          ) : seasonEpisodes.length > 0 ? (
                            <div className="episodes-list">
                              {seasonEpisodes.map((episode, episodeIndex) => (
                                <div key={episodeIndex} className="episode-item">
                                  <div className="episode-number">
                                    {episodeIndex + 1}
                                  </div>
                                  <div className="episode-details">
                                    <div className="episode-header">
                                      <h4 className="episode-title">
                                        {episode.episodetitle || `Episode ${episodeIndex + 1}`}
                                      </h4>
                                      {episode.avgrating && (
                                        <div className="episode-rating">
                                          <span className="rating-star">⭐</span>
                                          <span className="rating-value">{episode.avgrating}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="episode-meta">
                                      {episode.duration && (
                                        <span className="episode-runtime">
                                          <span className="meta-icon">🕒</span>
                                          {episode.duration} min
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : isExpanded ? (
                            <div className="no-episodes">No episodes found for this season</div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="secondary-content">
          <div className="series-metadata">
            <div className="poster-small">
              <img 
                src={series.poster || 'https://via.placeholder.com/200x300?text=No+Image'} 
                alt={`${series.title || 'Series'} poster`} 
              />
            </div>

            <div className="meta-details">
              <div className="rating-container">
                <span className="rating-value">{series.overallrating || 'N/A'}</span>
                <span className="rating-max">/10</span>
              </div>

              <div className="series-meta">
                <div className="meta-item">
                  <span className="meta-label">Release Year:</span>
                  <span className="meta-value">{series.releaseyear || 'N/A'}</span>
                </div>

                {/* <div className="meta-item">
                  <span className="meta-label">Seasons:</span>
                  <span className="meta-value">{series.seasons || 'N/A'}</span>
                </div> */}

                <div className="meta-item">
                  <span className="meta-label">Ongoing:</span>
                  <span className="meta-value">{series.isongoing ? "Yes" : "No"}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">Language:</span>
                  <span className="meta-value">{series.language || 'N/A'}</span>
                </div>

                <div className="meta-item">
                  <span className="meta-label">PG Rating:</span>
                  <span className="meta-value">{series.pgrating || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Awards Section */}
          {series.awards && series.awards.length > 0 && (
            <div className="info-section awards-section">
              <h2>Awards</h2>
              <div className="awards-list">
                {series.awards.map((award, index) => (
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

          {series.genre && series.genre.length > 0 && (
            <div className="info-section genre-section">
              <h2>Genres</h2>
              <div className="genre-list">
                {series.genre.map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre.genrename}
                  </span>
                ))}
              </div>
            </div>
          )}

          {series.cast && series.cast.length > 0 && (
            <div className="cast-section">
              <h2>Cast</h2>
              <div className="cast-list">
                {series.cast.map((actor, index) => (
                  <Link to={`/actor/${actor.actorid}`} className="cast-item" key={index}>
                    <div className="actor-image">
                      <img 
                        src={actor.picture || 'https://via.placeholder.com/100x150?text=No+Image'} 
                        alt={actor.actorname || 'Actor'} 
                      />
                    </div>
                    <div className="actor-name">{actor.actorname || 'Unknown Actor'}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {series.director && series.director.length > 0 && (
            <div className="info-section director-section">
              <h2>Directors</h2>
              <div className="person-list">
                {series.director.map((director, index) => (
                  <div key={index} className="person-item">
                    <div className="person-image">
                      <img 
                        src={director.picture || 'https://via.placeholder.com/100x150?text=No+Image'} 
                        alt={director.directorname || 'Director'} 
                      />
                    </div>
                    <div className="person-name">{director.directorname || 'Unknown Director'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {series.studio && series.studio.length > 0 && (
            <div className="info-section studio-section">
              <h2>Studios</h2>
              <div className="studio-list">
                {series.studio.map((studio, index) => (
                  <div key={index} className="studio-item">
                    <div className="studio-logo">
                      <img 
                        src={studio.picture || 'https://via.placeholder.com/100x100?text=No+Logo'} 
                        alt={studio.studioname || 'Studio'} 
                      />
                    </div>
                    <div className="studio-name">{studio.studioname || 'Unknown Studio'}</div>
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

export default Series;