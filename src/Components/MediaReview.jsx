import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './ComponentStyles/MediaReview.css';
import { useNotification } from '../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MediaReview = ({ mediaid, onReviewSubmitted }) => {
  const { user } = useContext(AuthContext);
  const { addNotification } = useNotification();
  const [userrating, setUserrating] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // For editing reviews
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Confirmation popup state
  const [confirmDelete, setConfirmDelete] = useState({ show: false, reviewId: null });

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
        addNotification({
          type: 'success',
          title: 'Review Submitted',
          message: 'Your review has been submitted successfully!'
        });
      } else {
        setError('Failed to submit review.');
      }
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review (show confirmation popup)
  const handleDeleteReview = (reviewId) => {
    setConfirmDelete({ show: true, reviewId });
  };

  // Confirm delete action
  const confirmDeleteReview = async () => {
    const reviewId = confirmDelete.reviewId;
    setConfirmDelete({ show: false, reviewId: null });
    try {
      await axios.delete(`${API_URL}/delete-review/${reviewId}`, {
        data: { username: user.username , mediaid: mediaid }
      });
      fetchReviews();
      addNotification({
        type: 'success',
        title: 'Review Deleted',
        message: 'Your review has been deleted successfully!'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete review.'
      });
    }
  };

  // Cancel delete action
  const cancelDeleteReview = () => {
    setConfirmDelete({ show: false, reviewId: null });
  };

  // Start editing
  const handleEditReview = (review) => {
    setEditingReviewId(review._id || review.id);
    setEditRating(review.userrating.toString());
    setEditComment(review.comment);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating('');
    setEditComment('');
  };

  // Submit edit
  const handleEditSubmit = async (reviewId) => {
    setEditSubmitting(true);
    try {
      await axios.put(`${API_URL}/update-review/${reviewId}`, {
        username: user.username,
        userrating: parseFloat(editRating),
        comment: editComment.trim(),
        mediaid: mediaid,
        reviewdate: new Date().toISOString().split('T')[0]
      });
      setEditingReviewId(null);
      setEditRating('');
      setEditComment('');
      fetchReviews();
      addNotification({
        type: 'success',
        title: 'Review Updated',
        message: 'Your review has been updated successfully!'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update review.'
      });
    } finally {
      setEditSubmitting(false);
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

      {/* Confirmation Popup */}
      {confirmDelete.show && (
        <div className="review-confirm-popup-overlay">
          <div className="review-confirm-popup">
            <div className="review-confirm-title">Delete Review?</div>
            <div className="review-confirm-message">
              Are you sure you want to delete this review? This action cannot be undone.
            </div>
            <div className="review-confirm-actions">
              <button className="review-confirm-btn" onClick={confirmDeleteReview}>
                Yes, Delete
              </button>
              <button className="review-cancel-btn" onClick={cancelDeleteReview}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="all-reviews-section">
        <h3>All Reviews</h3>
        {loadingReviews ? (
          <div className="reviews-loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">No reviews yet.</div>
        ) : (
          <ul className="reviews-list">
            {reviews.map((r) => {
              const isCurrentUser = user && r.username === user.username;
              const reviewId = r._id || r.id;
              return (
                <li className="review-item" key={reviewId}>
                  <div className="review-header">
                    <span className="review-username">{r.username}</span>
                    <span className="review-rating">{r.userrating}/10</span>
                    <span className="review-date">
                      {r.reviewdate ? r.reviewdate.slice(0, 10) : ''}
                    </span>
                    {isCurrentUser && editingReviewId !== reviewId && (
                      <span className="review-actions">
                        <button
                          className="review-edit-btn"
                          onClick={() => handleEditReview(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="review-delete-btn"
                          onClick={() => handleDeleteReview(reviewId)}
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </div>
                  {isCurrentUser && editingReviewId === reviewId ? (
                    <form
                      className="edit-review-form"
                      onSubmit={e => {
                        e.preventDefault();
                        handleEditSubmit(reviewId);
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={editRating}
                        onChange={e => {
                          let value = e.target.value;
                          if (value === '') {
                            setEditRating('');
                            return;
                          }
                          if (!/^\d{0,2}(\.\d?)?$/.test(value)) return;
                          let num = parseFloat(value);
                          if (num > 10) num = 10;
                          setEditRating(num.toString());
                        }}
                        disabled={editSubmitting}
                        required
                      />
                      <textarea
                        rows="2"
                        value={editComment}
                        onChange={e => setEditComment(e.target.value)}
                        disabled={editSubmitting}
                        required
                      />
                      <button type="submit" disabled={editSubmitting}>
                        {editSubmitting ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={handleCancelEdit} disabled={editSubmitting}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="review-comment">{r.comment}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MediaReview;
