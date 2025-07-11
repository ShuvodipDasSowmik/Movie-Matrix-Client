import React from "react";
import "./PageStyles/Home.css";
import { FaStar, FaSearch, FaHeart, FaTicketAlt, FaList } from "react-icons/fa";

const Home = () => {
  // Mock data for movies
  const featuredMovies = [
    { id: 1, title: "Interstellar", rating: 8.6, poster: "https://via.placeholder.com/180x270/2a2a45/ffffff?text=Interstellar" },
    { id: 2, title: "Inception", rating: 8.8, poster: "https://via.placeholder.com/180x270/2a2a45/ffffff?text=Inception" },
    { id: 3, title: "The Dark Knight", rating: 9.0, poster: "https://via.placeholder.com/180x270/2a2a45/ffffff?text=The+Dark+Knight" },
    { id: 4, title: "Pulp Fiction", rating: 8.9, poster: "https://via.placeholder.com/180x270/2a2a45/ffffff?text=Pulp+Fiction" },
    { id: 5, title: "The Shawshank Redemption", rating: 9.3, poster: "https://via.placeholder.com/180x270/2a2a45/ffffff?text=Shawshank" }
  ];
  
  // Mock data for testimonials
  const testimonials = [
    {
      id: 1,
      quote: "MovieMatrix completely transformed how I discover new films. The recommendations are spot-on!",
      name: "Emma Thompson",
      role: "Film Enthusiast",
      avatar: "https://via.placeholder.com/50x50/2a2a45/ffffff?text=ET"
    },
    {
      id: 2,
      quote: "I love how easy it is to track what I've watched and create watchlists for future viewing.",
      name: "Michael Chen",
      role: "Cinema Blogger",
      avatar: "https://via.placeholder.com/50x50/2a2a45/ffffff?text=MC"
    },
    {
      id: 3,
      quote: "The community discussions helped me appreciate films I would have otherwise overlooked.",
      name: "Sophia Rodriguez",
      role: "Film Student",
      avatar: "https://via.placeholder.com/50x50/2a2a45/ffffff?text=SR"
    }
  ];

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
              <button className="home-btn primary">
                Get Started
              </button>
              <button className="home-btn secondary">
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

        {/* Movie Showcase Section */}
        <section className="home-section">
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title">Featured Films</h2>
              <p className="home-section-subtitle">
                Explore some of the highest-rated and most discussed movies on our platform.
              </p>
            </div>
            
            <div className="movies-showcase">
              {featuredMovies.map(movie => (
                <div className="movie-card" key={movie.id}>
                  <img src={movie.poster} alt={movie.title} className="movie-poster" />
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <div className="movie-rating">
                      <FaStar /> {movie.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="home-section">
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title">What Our Users Say</h2>
              <p className="home-section-subtitle">
                Join thousands of satisfied movie enthusiasts who've enhanced their cinema experience with MovieMatrix.
              </p>
            </div>
            
            <div className="testimonials-container">
              {testimonials.map(testimonial => (
                <div className="testimonial-card" key={testimonial.id}>
                  <p className="testimonial-quote">{testimonial.quote}</p>
                  <div className="testimonial-author">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="testimonial-avatar" 
                    />
                    <div>
                      <p className="testimonial-name">{testimonial.name}</p>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
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
