import React, { useState, useEffect } from 'react';
import './ComponentStyles/DatabaseOverview.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DatabaseOverview = () => {
    const [stats, setStats] = useState({
        userCount: 0,
        avgAge: 0,
        totalMedia: 0,
        movieCount: 0,
        seriesCount: 0,
        actorCount: 0,
        directorCount: 0,
        studioCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/adminStat`);
                
                // if (!response.ok) {
                //     throw new Error('Failed to fetch database statistics');
                // }
                
                // const data = await response.json();
                setStats(response.data.statResult);

                console.log(response.data.statResult);
                
                setLoading(false);

            }
            
            catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="stats-loading">Loading statistics...</div>;
    }

    if (error) {
        return <div className="stats-error">Error: {error}</div>;
    }

    return (
        <div className="database-overview">
            <h2>Database Overview</h2>
            <div className="stats-grid">
                <div className="stats-card">
                    <h3>Users</h3>
                    <div className="stat-value">{stats.usercount}</div>
                    <div className="sub-stat">Avg Age: {stats.avgage} Yrs</div>
                </div>
                
                <div className="stats-card">
                    <h3>Media</h3>
                    <div className="stat-value">{stats.mediacount}</div>
                    <div className="sub-stats">
                        <div className="sub-stat">Movies: {stats.moviecount}</div>
                        <div className="sub-stat">Series: {stats.seriescount}</div>
                    </div>
                </div>

                <div className="stats-card">
                    <h3>Actors</h3>
                    <div className="stat-value">{stats.actorcount}</div>
                </div>

                <div className="stats-card">
                    <h3>Directors</h3>
                    <div className="stat-value">{stats.directorcount}</div>
                </div>

                <div className="stats-card">
                    <h3>Studios</h3>
                    <div className="stat-value">{stats.studiocount}</div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseOverview;