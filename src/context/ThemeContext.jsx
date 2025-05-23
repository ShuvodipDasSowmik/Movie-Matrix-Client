import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has a theme preference stored in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    // If there's a saved preference, use it; otherwise check system preference
    if (savedTheme !== null) {
      return savedTheme === 'true';
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // Handle initial render and theme changes
  useEffect(() => {
    const applyTheme = () => {
      // Apply theme to both html and body elements
      if (darkMode) {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-mode');
      }
      
      // Store the user's preference
      localStorage.setItem('darkMode', darkMode);
    };
    
    applyTheme();
    
    // Enable transitions after initial render to prevent flickering
    setTimeout(() => {
      document.body.classList.add('theme-transitions-enabled');
    }, 100);
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('theme-transitions-enabled');
    };
  }, [darkMode]);

  // Function to toggle between light and dark mode
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
