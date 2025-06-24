import React, { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import './ComponentStyles/SearchBar.css';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search functionality here
      // e.g., navigate to search results page with the query
      // window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

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
            placeholder="Search for movies, TV shows, people..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            type="button" 
            className="search-clear"
            onClick={() => setSearchQuery('')}
            style={{ visibility: searchQuery ? 'visible' : 'hidden' }}
          >
            <IoMdClose />
          </button>
          <button type="submit" className="search-button">
            <FiSearch />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;