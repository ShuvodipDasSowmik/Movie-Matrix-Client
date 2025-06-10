import React from 'react';
import './Footer.css';
import { FaFacebook, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const contributors = [
    {
      name: "Shuvodip Das Sowmik",
      facebook: "*",
      github: "*"
    },
    {
      name: "Mahinur Rahman",
      facebook: "*",
      github: "*"
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h3>MovieMatrix</h3>
          <p>Your ultimate movie companion</p>
        </div>
        
        <div className="contributors-section">
          <h4>Contributors</h4>
          <div className="contributors-list">
            {contributors.map((contributor, index) => (
              <div key={index} className="contributor-card">
                <h5>{contributor.name}</h5>
                <div className="social-links">
                  <a href={contributor.facebook} target="_blank" rel="noopener noreferrer">
                    <FaFacebook className="social-icon" />
                  </a>
                  <a href={contributor.github} target="_blank" rel="noopener noreferrer">
                    <FaGithub className="social-icon" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MovieMatrix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
