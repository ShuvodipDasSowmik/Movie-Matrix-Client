import { Link } from 'react-router-dom';
import './PageStyles/Home.css';
import SearchBar from '../Components//SearchBar';

const Home = () => {
    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    {/* <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <SearchBar />
                    </div> */}
                    <h1>Discover Your Next Favorite Movie</h1>
                    <p>Explore thousands of movies, create watchlists, and get personalized recommendations.</p>
                    <div className="hero-buttons">
                        <Link to="/signup" className="btn btn-primary">Get Started</Link>
                        <Link to="/movies" className="btn btn-secondary">Browse Movies</Link>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2>Why MovieMatrix?</h2>
                <div className="features-container">
                    <div className="feature-card">
                        <div className="feature-icon">🎬</div>
                        <h3>Extensive Library</h3>
                        <p>Access to thousands of movies across all genres and decades.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3>Watch Anywhere</h3>
                        <p>Enjoy on your phone, tablet, or computer anywhere, anytime.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Smart Recommendations</h3>
                        <p>Get personalized movie suggestions based on your preferences.</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <h2>Ready to Start Your Movie Journey?</h2>
                <Link to="/signup" className="btn btn-large">Join MovieMatrix Today</Link>
                <div className="admin-link">
                    <Link to="/admin" className="subtle-link">Admin Portal</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;