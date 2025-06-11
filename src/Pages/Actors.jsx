import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PageStyles/Actors.css';

const Actors = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/actors');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setActors(data.actorsData);
        setLoading(false);
        
        console.log(data);
        

      } catch (err) {
        setError('Failed to fetch actors. Please try again later.');
        setLoading(false);
        console.error('Error fetching actors:', err);
      }
    };

    fetchActors();
  }, []);

  if (loading) {
    return (
      <div className="actors-loading">
        <div className="spinner"></div>
        <p>Loading actors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="actors-error">
        <h3>Oops!</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="actors-container">
      <h1 className="actors-title">Browse Actors</h1>
      
      {actors.length === 0 ? (
        <p className="no-actors">No actors found.</p>
      ) : (
        <div className="actors-grid">
          {actors.map((actor) => (
            <Link 
              to={`/actor/${actor.actorname}`} 
              className="actors-list-card" 
              key={actor.actorname}
            >
              <div className="actors-list-card-inner">
                <div className="actors-list-image-container">
                  <img 
                    src={actor.picture || 'https://uniprints.co.uk/wp-content/uploads/woocommerce-placeholder-375x400.png'} 
                    alt={actor.actorname} 
                    className="actors-list-image" 
                  />
                </div>
                <div className="actors-list-info">
                  <h3 className="actors-list-name">{actor.actorname}</h3>
                  <p className="actors-list-nationality">{actor.nationality || 'Unknown'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Actors;
