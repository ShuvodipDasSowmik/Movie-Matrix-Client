import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Pages/PageStyles/NotFound.css';

const NotFound = () => {
  const [randomQuote, setRandomQuote] = useState('');
  
  const movieQuotes = [
    "Houston, we have a problem. This page doesn't exist.",
    "Frankly, my dear, I don't give a damn about this page because it's not here.",
    "May the force be with you as you navigate back to our existing pages.",
    "You can't handle the truth! This page doesn't exist.",
    "There's no place like home. Click below to go back.",
    "I'm going to make you a page you can't refuse. But it's not this one.",
    "E.T. Phone Home... because this page is lost in space."
  ];
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * movieQuotes.length);
    setRandomQuote(movieQuotes[randomIndex]);
  }, []);
  
  return (
    <div className="not-found-container">
        
      <div className="film-reel-top"></div>
      
      <div className="not-found-content">
        <h1 className="error-code">4<span className="film-reel">🎬</span>4</h1>
        <h2 className="error-title">Scene Missing</h2>
        
        <p className="error-message">
          {randomQuote}
        </p>
        
        
        <Link to="/" className="home-button">
          Back to Featured Films
        </Link>
      </div>
      
      <div className="film-reel-bottom"></div>
    </div>
  );
};

export default NotFound;