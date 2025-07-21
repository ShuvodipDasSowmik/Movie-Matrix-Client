import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { IoMdArrowDropdown } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import SearchBar from './SearchBar';
import './ComponentStyles/Header.css';
import { useAuth } from '../context/AuthContext';

const navigationItems = [
  {
    label: 'Home',
    navigationLink: '/'
  },
  {
    label: 'Movies | Series',
    navigationLink: '/tv-shows'
  },
  {
    label: 'Actors',
    navigationLink: '/actors',
  },
  {
    label: 'Posts',
    navigationLink: '/posts'
  }
];

const Header = () => {
  const { user, isLoggedIn, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Check if viewport is mobile size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
      if (window.innerWidth > 767) {
        setDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Control body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('drawer-open');
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      document.body.classList.remove('drawer-open');
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('drawer-open');
      document.body.style.top = '';
    };
  }, [drawerOpen]);

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
  const handleLogout = async () => {
    // Use AuthContext's logout function
    await logout();

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
                  <a href={`/profile/${user?.username}`} className="nav-link profile-icon">
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
        <div className={`mobile-actions ${isMobile ? '' : 'hidden'}`}>
          {/* Mobile Search Bar */}
          <div className="mobile-search">
            <SearchBar />
          </div>

          {/* Mobile Navigation Button */}
          <button
            className="mobile-nav-toggle"
            onClick={toggleDrawer}
            aria-label="Toggle navigation menu"
          >
            <FiMenu />
          </button>
        </div>

        {/* Mobile Drawer - Only render on mobile/tablet */}
        {isMobile && (
          <>
            <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
              <div className="drawer-header">
                <span className="drawer-title">Menu</span>
                <button
                  className="drawer-close"
                  onClick={toggleDrawer}
                  aria-label="Close navigation menu"
                >
                  <IoClose />
                </button>
              </div>
              <div className="drawer-content">
                <ul className="drawer-nav-list">
                  {navigationItems.map((item, index) => (
                    <li key={index} className="drawer-nav-item">
                      <a 
                        href={item.navigationLink} 
                        className="drawer-nav-link"
                        onClick={() => setDrawerOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                  {isLoggedIn && (
                    <li className="drawer-nav-item">
                      <a
                        href={`/profile/${user?.username}`}
                        className="drawer-nav-link"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <FaUserCircle size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        My Profile
                      </a>
                    </li>
                  )}
                </ul>
                <div className="drawer-user-section">
                  {isLoggedIn ? (
                    <>                    
                      <div className="drawer-user-info">
                        <FaUserCircle size={20} />
                        <span>Welcome, {user?.username}</span>
                      </div>
                      <button onClick={handleLogout} className="drawer-logout-button">
                        <FaSignOutAlt size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <a 
                      href="/signin" 
                      className="drawer-login-button"
                      onClick={() => setDrawerOpen(false)}
                    >
                      Login
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* Backdrop */}
            <div 
              className={`mobile-drawer-backdrop ${drawerOpen ? 'show' : ''}`} 
              onClick={toggleDrawer}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
