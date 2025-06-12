import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PageStyles/Actor.css';

const Actor = () => {
    const { actorid } = useParams();
    const navigate = useNavigate();
    const [actor, setActor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track the current actor name to detect changes
    const previousActorRef = useRef('');

    useEffect(() => {
        // Reset the loading state when actor changes
        if (previousActorRef.current !== actorid) {
            setLoading(true);
            setActor(null);
            setError(null);
            previousActorRef.current = actorid;
        }

        console.log(`Attempting to fetch data for actor: ${actorid}`);

        const fetchActorData = async () => {
            if (!actorid) return;

            try {
                console.log(`Starting fetch request for actor: ${actorid}`);
                const response = await fetch(`http://localhost:3000/actors/${actorid}`);

                console.log('Full response object:', response);
                console.log('Response status:', response.status);
                console.log('Response headers:', [...response.headers.entries()]);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const jsonData = await response.json();
                console.log('API response data:', jsonData);


                console.log('Actor data:', jsonData.actorData);
                setActor(jsonData.actorData);


                setLoading(false);

            } catch (err) {
                console.error("Error fetching actor data:", err);
                setError(`Failed to load actor information: ${err.message}`);
                setLoading(false);
            }
        };

        fetchActorData();

    }, [actorid]); // Only depend on the actor name

    // Debug logging for component state changes
    useEffect(() => {
        console.log('Component state updated:', {
            actorid,
            loading,
            error,
            'actor data': actor ? 'present' : 'null'
        });
    }, [actor, loading, error, actorid]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="actor-loading">Loading information for requested actor...</div>;
    }

    if (error) {
        return <div className="actor-error">{error}</div>;
    }

    if (!actor) {
        return <div className="actor-not-found">Actor data not found for requested actor</div>;
    }

    // Debug render - dump the actor object to console
    console.log('Rendering actor data:', actor);

    return (
        <div className="actor-container">
            <div className="actor-header">
                <h1>{actor.actorname || actor.name || actorname}</h1>
            </div>

            <div className="actor-content">
                <div className="actor-image-container">
                    {actor.image || actor.picture ? (
                        <img src={actor.picture || actor.image} alt={actor.actorname || actor.name} className="actor-image" />
                    ) : (
                        <div className="actor-image-placeholder">
                            {(actor.actorname || actor.name || actorname).charAt(0)}
                        </div>
                    )}
                    <div className="actor-quick-info">
                        <p><strong>Born:</strong> {formatDate(actor.dob || actor.dateOfBirth)}</p>
                        <p><strong>Nationality:</strong> {actor.nationality || 'Unknown'}</p>
                    </div>
                </div>

                <div className="actor-details">
                    <div className="actor-biography">
                        <h2>Biography</h2>
                        <pre className="debug-data" style={{ display: 'none' }}>{JSON.stringify(actor, null, 2)}</pre>
                        <p>{actor.biography || 'No biography available.'}</p>
                    </div>

                    <div className="actor-filmography">
                        <h2>Filmography</h2>
                        {actor.medias && actor.medias.length > 0 ? (
                            <div className="actor-movies-grid">
                                {actor.medias.map(media => (
                                    <div
                                        key={media.id}
                                        className="movie-card"
                                        onClick={() => navigate(`/media/${media.id}`)}
                                    >
                                        {media.poster ? (
                                            <img src={media.poster} alt={media.title} className="movie-poster" />
                                        ) : (
                                            <div className="movie-poster-placeholder">
                                                <div className="placeholder-content">
                                                    <span className="placeholder-icon">🎬</span>
                                                    <span className="placeholder-text">{media.title}</span>
                                                </div>
                                            </div>
                                        )}
                                        <h3>{media.title}</h3>
                                        <p>{media.releaseyear}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No movies found for this actor.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Actor;