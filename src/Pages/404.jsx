import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageStyles/UnAuthorizeAccess.css';

const NotFound = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Unauthorized Access | Movie Matrix";
    }, []);

    const username = localStorage.getItem('username');

    const handleReturn = () => {
        navigate('/profile/'+ username);
    };

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-content">
                <div className="lock-icon">
                    <i className="fas fa-exclamation"></i>
                </div>
                <h1 className="glitch" data-text="404">404</h1>
                <h2 className="message">PAGE NOT FOUND</h2>
                <p className="description">
                    The page you are looking for does not exist or has been moved.
                    Please check the URL or return to your profile.
                </p>
                <button className="return-button" onClick={handleReturn}>
                    <span className="button-text">Return to Profile</span>
                    <span className="button-icon">
                        <i className="fas fa-arrow-right"></i>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default NotFound;