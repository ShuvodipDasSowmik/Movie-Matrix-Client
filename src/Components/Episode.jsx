import React, { useState } from 'react';
import './ComponentStyles/Episode.css';
import EpisodeReviews from './EpisodeReviews';

const EpisodeReviewForm = ({ episodeId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
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
      await onSubmit(episodeId, rating, comment);
      setSuccess('Rating submitted!');
      setRating('');
      setComment('');
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
      <textarea
        className="episode-review-comment"
        placeholder="Write a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        cols={80}
        style={{ resize: 'vertical', minWidth: 250, maxWidth: 500, minHeight: 24, fontSize: '0.95em' }}
        disabled={submitting}
        required
      />
      <button type="submit" disabled={submitting || !rating || !comment.trim()} className="episode-rating-submit">
        {submitting ? 'Submitting...' : 'Rate'}
      </button>
      <button type="button" onClick={onCancel} disabled={submitting} className="episode-rating-cancel">
        Cancel
      </button>
      {success && <div className="episode-rating-success">{success}</div>}
      {error && <div className="episode-rating-error">{error}</div>}
    </form>
  );
};

const Episode = ({ isExpanded, isLoadingEpisodes, seasonEpisodes, onReviewSubmit, currentUser, seasonid }) => {
  const [showReviewForm, setShowReviewForm] = useState({});
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState({});

  const handleShowForm = (episodeId) => {
    setShowReviewForm(prev => ({ ...prev, [episodeId]: true }));
  };

  const handleHideForm = (episodeId) => {
    setShowReviewForm(prev => ({ ...prev, [episodeId]: false }));
  };

  // Called after review submit/update/delete to trigger refresh
  const triggerReviewsRefresh = (episodeId) => {
    setReviewsRefreshKey(prev => ({
      ...prev,
      [episodeId]: (prev[episodeId] || 0) + 1
    }));
  };

  // Wrap onReviewSubmit to refresh reviews after submit
  const handleReviewSubmit = async (episodeId, rating, comment) => {
    await onReviewSubmit(episodeId, rating, comment);
    triggerReviewsRefresh(episodeId);
  };

  return (
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
                {!showReviewForm[episode.episodeid] ? (
                  <button
                    className="episode-add-review-btn"
                    onClick={() => handleShowForm(episode.episodeid)}
                  >
                    Add Review
                  </button>
                ) : (
                  <EpisodeReviewForm
                    episodeId={episode.episodeid}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => handleHideForm(episode.episodeid)}
                  />
                )}
                <EpisodeReviews
                  episodeId={episode.episodeid}
                  seasonid={seasonid}
                  currentUser={currentUser}
                  refreshKey={reviewsRefreshKey[episode.episodeid] || 0}
                  onReviewChange={() => triggerReviewsRefresh(episode.episodeid)}
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
};

export default Episode;
