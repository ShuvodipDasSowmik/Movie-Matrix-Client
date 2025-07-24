import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './PageStyles/Actors.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ITEMS_PER_PAGE = 12;

const Actors = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/actors`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setActors(data.actorsData || []);
        
      } catch (err) {
        setError('Failed to fetch actors. Please try again later.');
        console.error('Error fetching actors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, []);

  // Filter actors based on search term
  const filteredActors = useMemo(() => {
    if (!searchTerm) return actors;
    return actors.filter(actor =>
      actor.actorname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [actors, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredActors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActors = filteredActors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="actors-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading actors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="actors-container">
        <div className="error-state">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="actors-container">
      <div className="actors-header">
        <h1>Actors</h1>
        <p className="actors-count">{filteredActors.length} actors</p>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search actors or nationality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredActors.length === 0 ? (
        <div className="empty-state">
          <p>No actors found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="actors-grid">
            {paginatedActors.map((actor) => (
              <Link 
                to={`/actor/${actor.actorid}`} 
                className="actor-card" 
                key={actor.actorid}
              >
                <div className="actor-image-container">
                  <img 
                    src={actor.picture || '/placeholder-actor.jpg'} 
                    alt={actor.actorname} 
                    className="actor-image"
                    loading="lazy"
                  />
                </div>
                <div className="actor-info">
                  <h3 className="actor-name">{actor.actorname}</h3>
                  {actor.nationality && (
                    <p className="actor-nationality">{actor.nationality}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="pagination-numbers">
                {generatePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    className={`pagination-number ${
                      page === currentPage ? 'active' : ''
                    } ${page === '...' ? 'dots' : ''}`}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredActors.length)} of {filteredActors.length} actors
          </div>
        </>
      )}
    </div>
  );
};

export default Actors;