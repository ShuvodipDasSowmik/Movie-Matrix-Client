import React, { useState } from "react";
import "./PageStyles/About.css";
import sdp from "../assets/sdp.jpg";
import mhn from "../assets/Mahin.jpg";

const developers = [
  {
    name: "Shuvodip Das Sowmik",
    role: "Student ID - 2205150",
    email: "shuvodipsowmik@gmail.com",
    github: "https://github.com/ShuvodipDasSowmik",
    image: sdp,
  },
  {
    name: "Mahinur Rahman",
    role: "Student ID - 2205148",
    email: "mahinurrahman404@gmail.com",
    github: "https://github.com/mahinurrahman404",
    image: mhn,
  },
];

const techStack = [
  "ReactJS (Client)",
  "Node.js & Express (Server)",
  "PostgreSQL (Database)",
  "Axios (API calls)",
  "Recharts (Charts)",
  "ImagekitIO (Cloud Image Hosting)",
  "JWT (Authentication)",
];

const backendStats = {
  queries: 96,
  triggers: 3,
  tables: 31
};

const clientLines = 9450;
const serverLines = 3250;

const About = () => {
  const [showErdModal, setShowErdModal] = useState(false);

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Movie Matrix</h1>
        <p>
          Movie Matrix is a full-featured movie and series platform built by two passionate developers.
        </p>
      </div>

      <div className="about-section">
        <h2>Developers</h2>
        <div className="dev-list">
          {developers.map((dev, idx) => (
            <div className="dev-card" key={idx}>
              <div className="dev-image-circle">
                <img src={dev.image} alt={dev.name} />
              </div>
              <div className="dev-info">
                <h3>{dev.name}</h3>
                <p className="dev-role">{dev.role}</p>
                <p className="dev-email">Email: <a href={`mailto:${dev.email}`}>{dev.email}</a></p>
                <p className="dev-github">GitHub: <a href={dev.github} target="_blank" rel="noopener noreferrer">{dev.github}</a></p>
                <p className="dev-bio">{dev.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2>Project Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Client-side Lines of Code</span>
            <span className="stat-value">{clientLines}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Server-side Lines of Code</span>
            <span className="stat-value">{serverLines}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Backend Queries</span>
            <span className="stat-value">{backendStats.queries}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Database Triggers</span>
            <span className="stat-value">{backendStats.triggers}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Database Tables</span>
            <span className="stat-value">{backendStats.tables}</span>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>Tech Stack</h2>
        <ul className="tech-list">
          {techStack.map((tech, idx) => (
            <li key={idx}>{tech}</li>
          ))}
        </ul>
      </div>

      <div className="about-section">
        <h2>Entity Relationship Diagram</h2>
        <div className="erd-placeholder">
          <div className="erd-image-placeholder" style={{ position: "relative" }}>
            <img
              src='ERD.png'
              alt="ERD Diagram Placeholder"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onClick={() => setShowErdModal(true)}
            />
            <button
              className="zoom-btn"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "6px 12px",
                fontSize: "1rem",
                cursor: "pointer",
                zIndex: 2
              }}
              onClick={() => setShowErdModal(true)}
            >
              Zoom
            </button>
          </div>
          {showErdModal && (
            <div
              className="erd-modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999
              }}
              onClick={() => setShowErdModal(false)}
            >
              <img
                src="ERD.png"
                alt="ERD Diagram Fullscreen"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  boxShadow: "0 0 20px #000",
                  borderRadius: "8px"
                }}
              />
              <button
                className="close-modal-btn"
                style={{
                  position: "absolute",
                  top: 30,
                  right: 40,
                  fontSize: "2rem",
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={e => {
                  e.stopPropagation();
                  setShowErdModal(false);
                }}
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="about-section">
        <h2>More Information</h2>
        <p>
          Movie Matrix is a project developed as part of our Database Sessional [CSE - 216] Project. The project was meant to be a clone of IMDB but we wanted to push out limits, and added any relevant features that popped into our minds. We started this project as early as we could, and worked on it for 3 months starting from submitting the ERD until the final submission.
        </p>
      </div>
    </div>
  );
}

export default About;
