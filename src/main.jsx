import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Ensure html classes match body classes for theme consistency
const syncInitialTheme = () => {
  const isDarkMode = document.documentElement.classList.contains('dark-theme');
  if (isDarkMode && !document.body.classList.contains('dark-mode')) {
    document.body.classList.add('dark-mode');
  }
};

// Run sync before rendering
syncInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
