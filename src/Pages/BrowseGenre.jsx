import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AddToWatchlist from '../Components/AddToWatchlist';
import './PageStyles/Movie.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const GENRES_PER_PAGE = 8;
const MEDIA_LIMIT = 4;

const BrowseGenre = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { user } = useContext(AuthContext) || {};

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/media-by-genre`);
        if (!response.ok) throw new Error('Failed to fetch genres');
        const data = await response.json();
        setGenres(data.mediaData || []);
      } catch (err) {
        setError('Failed to fetch genres. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  // Filter genres for dropdown options
  const filteredDropdownOptions = genres
    .filter(g => g.genrename.toLowerCase().includes(dropdownSearch.trim().toLowerCase()));

  const handleSearchBarChange = (e) => {
    setDropdownSearch(e.target.value);
    setDropdownVisible(true);
    setSelectedGenre('');
    setPage(1);
  };

  const handleDropdownSelect = (genreName) => {
    setSelectedGenre(genreName);
    setDropdownSearch(genreName);
    setDropdownVisible(false);
    setPage(1);
  };

  // Filter genres by search
  const filteredGenres = genres.filter(g =>
    g.genrename.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredGenres.length / GENRES_PER_PAGE);
  const paginatedGenres = filteredGenres.slice(
    (page - 1) * GENRES_PER_PAGE,
    page * GENRES_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading genres...</p>
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

  return (
    <div className="movie-dashboard youtube-style">
      <h1 className="movie-title">Browse by Genre</h1>
      <div className="genre-search-bar" style={{ position: 'relative', maxWidth: 350, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Type to search genres..."
          value={dropdownSearch}
          onChange={handleSearchBarChange}
          className="genre-dropdown-search"
          onFocus={() => dropdownSearch && setDropdownVisible(true)}
          onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
        />
        {dropdownVisible && dropdownSearch && (
          <ul className="genre-dropdown-list">
            {filteredDropdownOptions.length === 0 ? (
              <li className="genre-dropdown-item genre-dropdown-empty">No genres found</li>
            ) : (
              filteredDropdownOptions.map((genre) => (
                <li
                  key={genre.genrename}
                  className="genre-dropdown-item"
                  onClick={() => handleDropdownSelect(genre.genrename)}
                  tabIndex={0}
                >
                  {genre.genrename}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {selectedGenre ? (
        (() => {
          const genre = genres.find(g => g.genrename === selectedGenre);
          if (!genre) return <p className="no-movie">No genres found.</p>;
          return (
            <div key={genre.genrename} className="info-section genre-section">
              <h2>{genre.genrename}</h2>
              <div className="movies-grid">
                {genre.media.slice(0, MEDIA_LIMIT).map((item) => (
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
              <div className='view-more-button'>
                <Link
                  to={`/genre/${genre.media[0]?.genreid}`}
                  className="add-to-watchlist-btn"
                  style={{ width: 'auto', display: 'inline-block', padding: '8px 18px', fontSize: '1rem' }}
                >
                  View More
                </Link>
              </div>
            </div>
          );
        })()
      ) : paginatedGenres.length === 0 ? (
        <p className="no-movie">No genres found.</p>
      ) : (
        paginatedGenres.map((genre) => (
          <div key={genre.genrename} className="info-section genre-section">
            <h2>{genre.genrename}</h2>
            <div className="movies-grid">
              {genre.media.slice(0, MEDIA_LIMIT).map((item) => (
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
            <div className='view-more-button'>
              <Link
                to={`/genre/${genre.media[0]?.genreid}`}
                className="add-to-watchlist-btn"
                style={{ width: 'auto', display: 'inline-block', padding: '8px 18px', fontSize: '1rem' }}
              >
                View More
              </Link>
            </div>
          </div>
        ))
      )}
      {!selectedGenre && totalPages > 1 && (
        <div className="genre-pagination">
          <button
            className="genre-pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span className="genre-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="genre-pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseGenre;
