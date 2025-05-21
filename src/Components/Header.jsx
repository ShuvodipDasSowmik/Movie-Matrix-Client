import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { IoMdArrowDropdown } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import SearchBar from './SearchBar';
import './Header.css';

const navigationItems = [
  { 
    label: 'Movies', 
    subItems: ['Popular', 'Top Rated', 'Upcoming', 'Now Playing'] 
  },
  { 
    label: 'TV Shows', 
    subItems: ['Popular', 'Top Rated', 'On The Air', 'Airing Today'] 
  },
  { 
    label: 'People', 
    subItems: ['Popular People'] 
  },
];

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Check if viewport is mobile size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null && !event.target.closest('.nav-item')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleMobileExpand = (index) => {
    setExpandedItems({
      ...expandedItems,
      [index]: !expandedItems[index]
    });
  };

  const handleMenuItemClick = (path) => {
    // Handle navigation here
    setActiveDropdown(null);
    setDrawerOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <a href="/">MovieMatrix</a>
        </div>

        {/* Desktop Navigation */}
        <nav className={`desktop-nav ${isMobile ? 'hidden' : ''}`}>
          <ul className="nav-menu">
            {navigationItems.map((item, index) => (
              <li key={index} className="nav-item">
                <button 
                  className="nav-link dropdown-toggle"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    handleDropdownToggle(index);
                  }}
                >
                  {item.label} <IoMdArrowDropdown />
                </button>
                {activeDropdown === index && (
                  <ul className="dropdown-menu">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <a 
                          href={`/${item.label.toLowerCase().replace(/\s+/g, '-')}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => handleMenuItemClick(`/${item.label}/${subItem}`)}
                        >
                          {subItem}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="nav-item">
              <SearchBar />
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link login-btn">Login</a>
            </li>
          </ul>
        </nav>
        
        {/* Mobile actions group: search + toggle button */}
        <div className="mobile-actions">
          {/* Mobile Search Bar */}
          <div className="mobile-search">
            <SearchBar />
          </div>

          {/* Mobile Navigation Button */}
          <button 
            className={`mobile-nav-toggle ${isMobile ? '' : 'hidden'}`} 
            onClick={toggleDrawer}
            aria-label="Toggle navigation menu"
          >
            <FiMenu />
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <button 
              className="close-drawer" 
              onClick={toggleDrawer}
              aria-label="Close navigation menu"
            >
              <IoClose />
            </button>
          </div>
          <nav className="drawer-nav">
            <ul className="drawer-menu">
              {navigationItems.map((item, index) => (
                <li key={index} className="drawer-item">
                  <div 
                    className="drawer-dropdown"
                    onClick={() => handleMobileExpand(index)}
                  >
                    <span>{item.label}</span>
                    <IoMdArrowDropdown className={expandedItems[index] ? 'rotated' : ''} />
                  </div>
                  {expandedItems[index] && (
                    <ul className="drawer-submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a 
                            href={`/${item.label.toLowerCase().replace(/\s+/g, '-')}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => handleMenuItemClick(`/${item.label}/${subItem}`)}
                          >
                            {subItem}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li className="drawer-item">
                <a href="/login" className="drawer-login-btn">Login</a>
              </li>
            </ul>
          </nav>
        </div>
        
        {drawerOpen && <div className="drawer-backdrop" onClick={toggleDrawer}></div>}
      </div>
    </header>
  );
};

export default Header;
