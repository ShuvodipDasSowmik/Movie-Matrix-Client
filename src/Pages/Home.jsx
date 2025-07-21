import React from "react";
import "./PageStyles/Home.css";
import { FaStar, FaSearch, FaHeart, FaTicketAlt, FaList } from "react-icons/fa";

const Home = () => {
  

  return (
    <div className="home-landing-bg">
      {/* Animated floating shapes */}
      <div className="home-bg-shape shape1" />
      <div className="home-bg-shape shape2" />
      <div className="home-bg-shape shape3" />

      <div className="home-page-container">
        {/* Hero Section */}
        <section className="home-hero-section">
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              Welcome to MovieMatrix
            </h1>
            <p className="home-hero-subtitle">
              Your personal cinema companion. Discover, track, and share your movie experiences in a community of film enthusiasts.
            </p>
            <div className="home-hero-actions">
              <button className="home-btn primary" onClick={() => window.location.href = '/signup'}>
                Get Started
              </button>
              <button className="home-btn secondary" onClick={() => window.location.href = '/tv-shows'}>
                Explore Movies
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="home-section">
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title">Why Choose MovieMatrix</h2>
              <p className="home-section-subtitle">
                Designed by movie lovers for movie lovers, our platform offers everything you need to enhance your cinema experience.
              </p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaSearch />
                </div>
                <h3 className="feature-title">Smart Discovery</h3>
                <p className="feature-description">
                  Find your next favorite film with our intelligent recommendation system tailored to your preferences.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaList />
                </div>
                <h3 className="feature-title">Track Your Journey</h3>
                <p className="feature-description">
                  Keep a record of films you've watched, loved, and want to explore in your personalized lists.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaHeart />
                </div>
                <h3 className="feature-title">Join the Community</h3>
                <p className="feature-description">
                  Connect with fellow film enthusiasts, share reviews, and participate in discussions about cinema.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="home-section">
          <div className="home-section-inner">
            <div className="newsletter-container">
              <div className="home-section-header">
                <h2 className="home-section-title">Stay Updated</h2>
                <p className="home-section-subtitle">
                  Subscribe to our newsletter for the latest movie releases, reviews, and MovieMatrix updates.
                </p>
              </div>
              
              <form className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input" 
                  required 
                />
                <button type="submit" className="newsletter-button">Subscribe</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};



export default Home;
