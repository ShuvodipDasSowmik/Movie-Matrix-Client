import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageStyles/UnAuthorizeAccess.css';

const UnauthorizeAccess = () => {
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
                    <i className="fas fa-lock"></i>
                </div>
                <h1 className="glitch" data-text="401">401</h1>
                <h2 className="message">ACCESS DENIED</h2>
                <p className="description">
                    You don't have permission to access this page.
                    This incident will be reported.
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

export default UnauthorizeAccess;