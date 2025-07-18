import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './ComponentStyles/MediaReview.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MediaReview = ({ mediaid, onReviewSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [userrating, setUserrating] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch reviews
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${API_URL}/reviews/${mediaid}`);
      setReviews(res.data.reviews);
      
    } catch (err) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (mediaid) fetchReviews();
    // eslint-disable-next-line
  }, [mediaid]);

  // Refetch reviews after submit
  const handleReviewSubmitted = () => {
    if (onReviewSubmitted) onReviewSubmitted();
    fetchReviews();
  };

  const handleRatingChange = (e) => {
    let value = e.target.value;
    // Allow only numbers, max 10, 1 decimal
    if (value === '') {
      setUserrating('');
      return;
    }
    if (!/^\d{0,2}(\.\d?)?$/.test(value)) return;
    let num = parseFloat(value);
    if (num > 10) num = 10;
    setUserrating(num.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) {
      setError('You must be logged in to submit a review.');
      return;
    }
    if (!userrating || isNaN(userrating) || userrating < 0 || userrating > 10) {
      setError('Please enter a valid rating (0-10, up to 1 decimal).');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter your review.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        username: user.username,
        mediaid,
        comment: comment.trim(),
        userrating: parseFloat(userrating),
        reviewdate: new Date().toISOString().split('T')[0]
      };

      const res = await axios.post(`${API_URL}/create-review`, payload);

      if (res.status === 200) {
        setSuccess('Review submitted!');
        setComment('');
        setUserrating('');
        handleReviewSubmitted();
      } else {
        setError('Failed to submit review.');
      }
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="media-review-container">
      <h3>Write a Review</h3>
      {error && <div className="review-error">{error}</div>}
      {success && <div className="review-success">{success}</div>}
      <form onSubmit={handleSubmit} className="media-review-form">
        <div className="form-group">
          <label htmlFor="userrating">Rating (out of 10):</label>
          <input
            type="number"
            id="userrating"
            name="userrating"
            min="0"
            max="10"
            step="0.1"
            value={userrating}
            onChange={handleRatingChange}
            disabled={submitting}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Review:</label>
          <textarea
            id="comment"
            name="comment"
            rows="3"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={submitting}
            required
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews Section */}
      <div className="all-reviews-section">
        <h3>All Reviews</h3>
        {loadingReviews ? (
          <div className="reviews-loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">No reviews yet.</div>
        ) : (
          <ul className="reviews-list">
            {reviews.map((r) => (
              <li className="review-item">
                <div className="review-header">
                  <span className="review-username">{r.username}</span>
                  <span className="review-rating">{r.userrating}/10</span>
                  <span className="review-date">
                    {r.reviewdate ? r.reviewdate.slice(0, 10) : ''}
                  </span>
                </div>
                <div className="review-comment">{r.comment}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MediaReview;
