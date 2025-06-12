import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { IoMdArrowDropdown } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import SearchBar from './SearchBar';
import './Header.css';

const navigationItems = [
  {
    label: 'Home',
    navigationLink: '/'
  },
  { 
    label: 'TV Shows', 
    navigationLink: '/tv-shows'
  },
  { 
    label: 'Actors', 
    navigationLink: '/actors',
  },
];

const Header = () => {
  // Check auth status before initial render to prevent flickering
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    return { 
      isAuthenticated: Boolean(token && storedUsername), 
      username: storedUsername || ''
    };
  };

  const initialAuth = checkAuthStatus();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuth.isAuthenticated);
  const [username, setUsername] = useState(initialAuth.username);
  const [isAuthLoaded, setIsAuthLoaded] = useState(true);

  // Re-check auth status if localStorage changes
  useEffect(() => {
    // Listen for storage changes (if user logs in/out in another tab)
    const handleStorageChange = () => {
      const authStatus = checkAuthStatus();
      setIsLoggedIn(authStatus.isAuthenticated);
      setUsername(authStatus.username);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const handleLogout = () => {
    // Remove authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // Update state to reflect logged out status
    setIsLoggedIn(false);
    setUsername('');
    
    // Navigate to home page (client-side navigation without full page reload)
    window.location.href = '/';
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
                {item.subItems ? (
                  <button 
                    className="nav-link dropdown-toggle"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      handleDropdownToggle(index);
                    }}
                  >
                    {item.label} <IoMdArrowDropdown />
                  </button>
                ) : (
                  <a href={item.navigationLink} className="nav-link">
                    {item.label}
                  </a>
                )}
                {activeDropdown === index && item.subItems && (
                  <ul className="dropdown-menu">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <a 
                          href={subItem.navigationLink}
                          onClick={() => handleMenuItemClick(subItem.navigationLink)}
                        >
                          {subItem.label}
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
            <li className="nav-item user-actions">
              {isLoggedIn ? (
                <>
                  <a href={`/profile/${username}`} className="nav-link profile-icon">
                    <FaUserCircle size={24} title="My Profile" />
                  </a>
                  <button onClick={handleLogout} className="nav-link logout-btn" title="Logout">
                    <FaSignOutAlt size={20} />
                  </button>
                </>
              ) : (
                <a href="/signin" className="nav-link login-btn">Login</a>
              )}
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
                  {item.subItems ? (
                    <div 
                      className="drawer-dropdown"
                      onClick={() => handleMobileExpand(index)}
                    >
                      <span>{item.label}</span>
                      <IoMdArrowDropdown className={expandedItems[index] ? 'rotated' : ''} />
                    </div>
                  ) : (
                    <a href={item.navigationLink} className="drawer-link">
                      {item.label}
                    </a>
                  )}
                  
                  {expandedItems[index] && item.subItems && (
                    <ul className="drawer-submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a 
                            href={subItem.navigationLink}
                            onClick={() => handleMenuItemClick(subItem.navigationLink)}
                          >
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              
              <li className="drawer-item">
                {isLoggedIn ? (
                  <>
                    <a href={`/profile/${username}`} className="drawer-profile-btn">
                      <FaUserCircle size={20} /> My Profile
                    </a>
                    <button onClick={handleLogout} className="drawer-logout-btn">
                      <FaSignOutAlt size={20} /> Logout
                    </button>
                  </>
                ) : (
                  <a href="/signin" className="drawer-login-btn">Login</a>
                )}
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
