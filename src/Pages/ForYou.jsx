import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddToWatchlist from '../Components/AddToWatchlist';
import './PageStyles/ForYou.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ForYou = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('overallrating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [username, setUsername] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Default 4 items per page
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setError('Please log in to see personalized content');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetchPersonalizedContent();
    }
  }, [username]);

  useEffect(() => {
    if (content.length > 0) {
      sortContent();
    }
  }, [sortBy, sortOrder]);

  // Update total pages when content or itemsPerPage changes
  useEffect(() => {
    setTotalPages(Math.ceil(content.length / itemsPerPage));
    // Reset to page 1 if current page exceeds total pages
    if (currentPage > Math.ceil(content.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [content, itemsPerPage, currentPage]);

  const fetchPersonalizedContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_URL}/media-by-genre-pref/${username}`);
      
      if (response.status === 200) {
        setContent(response.data.mediaData || []);
        setCurrentPage(1); // Reset to first page when fetching new data
      } else {
        setError('Failed to fetch personalized content');
      }
    } catch (err) {
      console.error('Error fetching personalized content:', err);
      if (err.response?.status === 404) {
        setError('No personalized content found. Please set your genre preferences first.');
      } else if (err.response?.status === 401) {
        setError('Please log in to see personalized content');
      } else {
        setError('Failed to load personalized content');
      }
    } finally {
      setLoading(false);
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
        case 'mediatype':
          aValue = a.mediatype?.toLowerCase() || '';
          bValue = b.mediatype?.toLowerCase() || '';
          break;
        default:
          aValue = parseFloat(a.overallrating) || 0;
          bValue = parseFloat(b.overallrating) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setContent(sortedContent);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleRetry = () => {
    if (username) {
      fetchPersonalizedContent();
    }
  };

  // Pagination functions
  const getCurrentPageContent = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return content.slice(startIndex, endIndex);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis logic
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const getRoutePrefix = (mediaType) => {
    return mediaType === 'movie' ? 'movie' : 'series1';
  };

  const getMediaTypeDisplay = (mediaType) => {
    return mediaType === 'movie' ? 'Movie' : 'Series';
  };

  const getContentStats = () => {
    const movies = content.filter(item => item.mediatype === 'movie').length;
    const series = content.filter(item => item.mediatype === 'series').length;
    return { movies, series, total: content.length };
  };

  if (!username) {
    return (
      <div className="for-you-container">
        <div className="for-you-auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to see your personalized recommendations based on your genre preferences.</p>
          <Link to="/signin" className="login-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="for-you-loading">
        <div className="spinner"></div>
        <p>Finding your perfect matches...</p>
      </div>
    );
  }

  const stats = getContentStats();
  const currentPageContent = getCurrentPageContent();

  return (
    <div className="for-you-container">
      <div className="for-you-header">
        <h1 className="for-you-title">For You</h1>
        <p className="for-you-subtitle">
          Personalized recommendations based on your favorite genres
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
      
      {!error && (
        <>
          <div className="for-you-controls">
            <div className="controls-row">
              <div className="sort-selector">
                <label htmlFor="sort-dropdown" className="sort-label">Sort by:</label>
                <select 
                  id="sort-dropdown"
                  className="sort-dropdown"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                >
                  <option value="overallrating-desc">Rating (Highest)</option>
                  <option value="overallrating-asc">Rating (Lowest)</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="releaseyear-desc">Release Year (Newest)</option>
                  <option value="releaseyear-asc">Release Year (Oldest)</option>
                  <option value="mediatype-asc">Type (Movies First)</option>
                  <option value="mediatype-desc">Type (Series First)</option>
                </select>
              </div>

              <div className="items-per-page-selector">
                <label htmlFor="items-per-page" className="items-label">Items per page:</label>
                <select 
                  id="items-per-page"
                  className="items-dropdown"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>
            
            {content.length > 0 && (
              <div className="content-stats">
                <div className="stats-breakdown">
                  <span className="stat-item">
                    Total: <strong>{stats.total}</strong>
                  </span>
                  <span className="stat-item">
                    Movies: <strong>{stats.movies}</strong>
                  </span>
                  <span className="stat-item">
                    Series: <strong>{stats.series}</strong>
                  </span>
                  <span className="stat-item">
                    Page: <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <span className="stat-item">
                    Showing: <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, stats.total)}</strong>-<strong>{Math.min(currentPage * itemsPerPage, stats.total)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {content.length === 0 ? (
            <div className="no-content">
              <h3>No recommendations found</h3>
              <p>It looks like we couldn't find any content matching your genre preferences.</p>
              <div className="no-content-actions">
                <Link to="/profile" className="preferences-link">
                  Update Genre Preferences
                </Link>
                <button onClick={handleRetry} className="retry-btn">
                  Refresh Recommendations
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="for-you-grid">
                {currentPageContent.map((item) => (
                  <div className="for-you-card-wrapper" key={`${item.mediaid}-${item.title}`}>
                    <Link 
                      to={`/${getRoutePrefix(item.mediatype)}/${item.mediaid}`} 
                      className="for-you-card"
                    >
                      <div className="for-you-card-inner">
                        <div className="for-you-image-container">
                          <img 
                            src={item.poster || 'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png'} 
                            alt={item.title} 
                            className="for-you-image"
                            onError={(e) => {
                              e.target.src = 'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png';
                            }}
                          />
                          <div className="media-type-badge">
                            {getMediaTypeDisplay(item.mediatype)}
                          </div>
                        </div>
                        <div className="for-you-info">
                          <h3 className="for-you-title-text">{item.title}</h3>
                          <div className="for-you-details">
                            <span className="for-you-year">{item.releaseyear || 'N/A'}</span>
                            <span className="for-you-rating">{item.pgrating || 'Not Rated'}</span>
                          </div>
                          <div className="for-you-meta">
                            <div className="for-you-language">{item.language || 'Unknown'}</div>
                            <div className="for-you-score">
                              <span className="star-icon">★</span>
                              <span>{item.overallrating ? `${item.overallrating}/10` : 'N/R'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {username && AddToWatchlist && (
                      <div className="for-you-actions">
                        <AddToWatchlist 
                          mediaId={item.mediaid}
                          mediaType={item.mediatype}
                          buttonText="+ Watchlist"
                          buttonClassName="for-you-watchlist-btn"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button 
                      className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {currentPage > 3 && totalPages > 5 && (
                        <>
                          <button 
                            className="pagination-number"
                            onClick={() => goToPage(1)}
                          >
                            1
                          </button>
                          {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                        </>
                      )}
                      
                      {getPageNumbers().map(pageNum => (
                        <button
                          key={pageNum}
                          className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                          <button 
                            className="pagination-number"
                            onClick={() => goToPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button 
                      className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                  
                  <div className="pagination-info">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, stats.total)}-{Math.min(currentPage * itemsPerPage, stats.total)} of {stats.total} items
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ForYou;