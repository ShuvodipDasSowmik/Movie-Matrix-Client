import React, { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import './ComponentStyles/SearchBar.css';
import { Link } from 'react-router-dom';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ actors: [], media: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      await fetchSearchResults(searchQuery);
    }
  };

  const fetchSearchResults = async (query) => {
    if (!query) {
      setSearchResults({ actors: [], media: [] });
      return;
    }
  
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Starting fetch request for search keyword: ${query}`);
      const response = await fetch(`http://localhost:3000/search/${encodeURIComponent(query)}`); //sends command to backend
  
      console.log('Full response object:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const jsonData = await response.json(); //fetches the resulting search results
      console.log('API response data:', jsonData);
  
      // HANDLES COMBINED DATA
      if (jsonData.results) {
        console.log('Actor search results:', jsonData.results.actors);
        console.log('Media search results:', jsonData.results.media);
        setSearchResults({
          actors: jsonData.results.actors || [],
          media: jsonData.results.media || []
        });
      } else {
        setSearchResults({
          actors: jsonData.actorSearch || [],
          media: jsonData.mediaSearch || []
        });
      }
  
    } catch (error) {
      console.error('Error fetching search results:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('Failed to fetch search results. Please try again.');
      }
      setSearchResults({ actors: [], media: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const delayDebounce = setTimeout(() => {
        fetchSearchResults(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults({ actors: [], media: [] });
      setError(null);
    }
  }, [searchQuery]);

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalResults = searchResults.actors.length + searchResults.media.length;








  //HTML
  return (
    <div className="search-wrapper" ref={searchRef}>
      <button 
        className="search-toggle" 
        onClick={toggleSearch}
        aria-label="Toggle search"
      >
        <FiSearch />
      </button>
      
      <div className={`search-dropdown ${isOpen ? 'open' : ''}`}>
        <form onSubmit={handleSubmit} className="search-form">
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search for actors, movies, series..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            type="button" 
            className="search-clear"
            onClick={() => {
              setSearchQuery('');
              setSearchResults({ actors: [], media: [] });
              setError(null);
            }}
            style={{ visibility: searchQuery ? 'visible' : 'hidden' }}
          >
            <IoMdClose />
          </button>
          <button type="submit" className="search-button" disabled={isLoading}>
            <FiSearch />
          </button>
        </form>

        {isLoading && (
          <div className="search-loading">
            <p>Searching...</p>
          </div>
        )}

        {error && (
          <div className="search-error">
            <p>{error}</p>
          </div>
        )}

        {/* RENDERING SEARCHES */}
        {!isLoading && !error && totalResults > 0 && (
          <div className="search-results">
            {/* ACTORS */}
            {searchResults.actors.length > 0 && (
              <div className="search-section">
                <h3 className="search-section-title">Actors ({searchResults.actors.length})</h3>
                <div className="search-results-grid">
                  {searchResults.actors.map((actor) => (
                    <Link 
                      to={`/actor/${actor.actorid}`} 
                      className="search-result-card actor-result" 
                      key={`actor-${actor.actorid}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {actor.picture ? (
                        <img 
                          src={actor.picture} 
                          alt={actor.actorname} 
                          className="search-result-actor-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="search-result-actor-placeholder">
                          <span className="actor-initial">
                            {(actor.actorname || 'Unknown').charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="search-result-info">
                        <h4>{actor.actorname}</h4>
                        <p>{actor.nationality || 'Actor'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* MEDIA */}
            {searchResults.media.length > 0 && (
              <div className="search-section">
                <h3 className="search-section-title">Movies & Shows ({searchResults.media.length})</h3>
                <div className="search-results-grid">
                  {searchResults.media.map((media) => (
                    <Link 
                      to={media.mediatype === 'series' ? `/series1/${media.mediaid}` : `/movie/${media.mediaid}`}
                      className="search-result-card media-result" 
                      key={`media-${media.mediaid}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="search-result-media-placeholder">
                        <span className="media-initial">
                          {(media.title || 'Unknown').charAt(0)}
                        </span>
                      </div>
                      <div className="search-result-info">
                        <h4>{media.title}</h4>
                        <p className="media-type">{media.mediatype || 'Media'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NO RESULT */}
        {!isLoading && !error && searchQuery.trim() && totalResults === 0 && (
          <div className="search-no-results">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;