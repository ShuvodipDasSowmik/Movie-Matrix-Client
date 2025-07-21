import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const renderStars = (rating) => {
  const value = parseFloat(rating);
  if (isNaN(value)) return null;
  const fullStars = Math.floor(value);
  const halfStar = value % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) stars.push(<span key={i}>★</span>);
  if (halfStar) stars.push(<span key="half">☆</span>);
  for (let i = stars.length; i < 10; i++) stars.push(<span key={i + 10} style={{ opacity: 0.2 }}>★</span>);
  return <span style={{ color: '#f57c00', fontSize: '1em', marginLeft: 4 }}>{stars}</span>;
};

const EpisodeReviews = ({ episodeId, seasonid, refreshKey = 0, onReviewChange }) => {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState('');
  const [editComment, setEditComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch reviews for the specific episode
        const res = await axios.get(`${API_URL}/episode-reviews/${seasonid}`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        setError('Could not load reviews');
      }
      setLoading(false);
    };
    if (episodeId) fetchReviews();
  }, [episodeId, refreshKey]);

  const handleDelete = async (reviewid) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`${API_URL}/delete-episode-review`, {
        data: {
          username: currentUser?.username,
          episodeid: episodeId
        }
      });
      if (onReviewChange) onReviewChange();
    } catch {
      setError('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    setEditReviewId(review.reviewid);
    setEditRating(review.userrating);
    setEditComment(review.comment);
  };

  const handleUpdate = async (reviewid) => {
    try {
      await axios.put(`${API_URL}/update-episode-review`, {
        episodeid: episodeId,
        userrating: editRating,
        comment: editComment,
        username: currentUser?.username,
        reviewdate: new Date().toISOString()
      });
      setEditReviewId(null);
      if (onReviewChange) onReviewChange();
    } catch {
      setError('Failed to update review');
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!reviews.length) return <div>No reviews yet.</div>;

  return (
    <div className="episode-reviews">
      <h5>Reviews</h5>
      {reviews
        .filter(
          review =>
            String(review.episodeid) === String(episodeId)
        )
        .map((review, idx) => (
          <div key={review.reviewid || idx} className="episode-review-item">
            <div>
              <strong>{review.username}</strong> &nbsp;
              <span>
                Rating: {review.userrating}
                {renderStars(review.userrating)}
              </span>
              {review.reviewdate && (
                <span style={{ marginLeft: 8, color: '#888', fontSize: '0.9em' }}>
                  {new Date(review.reviewdate).toLocaleDateString()}
                </span>
              )}
            </div>
            {editReviewId === review.reviewid ? (
              <div className="episode-review-actions">
                <input
                  type="text"
                  value={editRating}
                  onChange={e => setEditRating(e.target.value)}
                  style={{ width: 40 }}
                />
                <input
                  type="text"
                  value={editComment}
                  onChange={e => setEditComment(e.target.value)}
                  style={{ width: 200 }}
                />
                <button onClick={() => handleUpdate(review.reviewid)} title="Save">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 10.5l4 4 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => setEditReviewId(null)} title="Cancel">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ) : (
              <div>{review.comment}</div>
            )}
            {currentUser && review.username === currentUser.username && editReviewId !== review.reviewid && (
              <div className="episode-review-actions">
                <button onClick={() => handleEdit(review)} title="Edit">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5z" stroke="#fff" strokeWidth="1.5" /><path d="M13.5 6.5l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                <button onClick={() => handleDelete(review.reviewid)} title="Delete">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 7v7a2 2 0 002 2h4a2 2 0 002-2V7M9 10v4m2-4v4M4 7h12M8 7V5a2 2 0 012-2h0a2 2 0 012 2v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default EpisodeReviews;
