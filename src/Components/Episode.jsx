import React, { useState } from 'react';
import './ComponentStyles/Episode.css';

const EpisodeReviewForm = ({ episodeId, onSubmit }) => {
  const [rating, setRating] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    if ((val.match(/\./g) || []).length > 1) return;
    // Only allow up to one digit after decimal
    if (val.includes('.')) {
      const [intPart, decPart] = val.split('.');
      val = intPart + '.' + decPart.slice(0, 1);
    }
    // Only allow 0-10
    if (val === '' || (!isNaN(val) && Number(val) >= 0 && Number(val) <= 10)) {
      setRating(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await onSubmit(episodeId, rating, '');
      setSuccess('Rating submitted!');
      setRating('');
    } catch (err) {
      setError('Failed to submit rating');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="episode-review-form">
      <input
        type="text"
        inputMode="decimal"
        pattern="^(10(\.0)?|[0-9](\.[0-9])?)$"
        maxLength={4}
        placeholder="(0-10)"
        value={rating}
        onChange={handleChange}
        className="episode-rating-input wide"
        required
        autoComplete="off"
      />
      <button type="submit" disabled={submitting || !rating} className="episode-rating-submit">
        {submitting ? 'Submitting...' : 'Rate'}
      </button>
      {success && <div className="episode-rating-success">{success}</div>}
      {error && <div className="episode-rating-error">{error}</div>}
    </form>
  );
};

const Episode = ({ isExpanded, isLoadingEpisodes, seasonEpisodes, onReviewSubmit }) => (
  <div className={`youtube-style episodes-container${isExpanded ? ' expanded' : ''}`}>
    {isLoadingEpisodes ? (
      <div className="episodes-loading">Loading episodes...</div>
    ) : seasonEpisodes.length > 0 ? (
      <div className="episodes-list">
        {seasonEpisodes.map((episode, episodeIndex) => (
          <div key={episodeIndex} className="episode-item">
            <div className="episode-number">
              {episodeIndex + 1}
            </div>
            <div className="episode-details">
              <div className="episode-header">
                <h4 className="episode-title">
                  {episode.episodetitle || `Episode ${episodeIndex + 1}`}
                </h4>
                {episode.avgrating && (
                  <div className="episode-rating">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{episode.avgrating}</span>
                  </div>
                )}
              </div>
              <div className="episode-meta">
                {episode.duration && (
                  <span className="episode-runtime">
                    <span className="meta-icon">🕒</span>
                    {episode.duration} min
                  </span>
                )}
              </div>
              <EpisodeReviewForm
                episodeId={episode.episodeid}
                onSubmit={onReviewSubmit}
              />
            </div>
          </div>
        ))}
      </div>
    ) : isExpanded ? (
      <div className="no-episodes">No episodes found for this season</div>
    ) : null}
  </div>
);


export default Episode;
