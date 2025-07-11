import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotificationHelpers } from '../Hooks/useNotificationHelpers';
import './PostPopUp.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PostPopUp = ({ onClose, userInfo }) => {
    const [postText, setPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const { user: authUser, token } = useAuth();
    const { showError, showWarning, showLoading, updateToSuccess, updateToError } = useNotificationHelpers();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showError(
                    'File Too Large',
                    'Image size should be less than 5MB'
                );
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        document.getElementById('image-upload').value = '';
    };

    const handlePost = async () => {
        if (!postText.trim() && !selectedImage) {
            showWarning(
                'Empty Post',
                'Please add some content to your post'
            );
            return;
        }

        setIsPosting(true);
        
        // Close the popup immediately
        onClose();
        
        // Show loading notification
        const loadingNotificationId = showLoading(
            'Uploading Post',
            'Your post is being uploaded...'
        );
        
        try {
            // Create FormData to send file as buffer
            const formData = new FormData();
            
            // Add text content and user data
            formData.append('userId', authUser.id || authUser.username);
            formData.append('username', authUser.username);
            formData.append('fullname', authUser.fullname || authUser.username);
            formData.append('content', postText.trim());
            formData.append('createdate', new Date().toISOString());
            
            // Add image file if selected
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await axios.post(`${API_URL}/create-blog`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                // Update the loading notification to success
                updateToSuccess(
                    loadingNotificationId,
                    'Post Created!',
                    'Your post has been uploaded successfully'
                );
            }
        } catch (error) {
            console.error('Error creating post:', error);
            
            // Update the loading notification to error
            const errorMessage = error.response?.data?.message || 'Error creating post. Please try again.';
            updateToError(
                loadingNotificationId,
                'Upload Failed',
                errorMessage
            );
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="post-popup-overlay" onClick={onClose}>
            <div className="post-popup" onClick={(e) => e.stopPropagation()}>
                <div className="post-popup-header">
                    <h3>Create Post</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="post-popup-content">
                    <div className="user-info">
                        <div className="user-avatar">
                            {(userInfo.fullname || userInfo.username)[0].toUpperCase()}
                        </div>
                        <div className="user-details">
                            <h4>{userInfo.fullname || userInfo.username}</h4>
                            <p>@{userInfo.username}</p>
                        </div>
                    </div>

                    <textarea
                        className="post-textarea"
                        placeholder="What's on your mind about movies?"
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        rows={4}
                        maxLength={1000}
                    />

                    <div className="character-count">
                        {postText.length}/1000
                    </div>

                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" />
                            <button className="remove-image-btn" onClick={removeImage}>
                                ×
                            </button>
                        </div>
                    )}

                    <div className="post-actions">
                        <div className="upload-section">
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="image-upload" className="upload-btn">
                                📷 Add Photo
                            </label>
                        </div>

                        <button 
                            className="post-submit-btn"
                            onClick={handlePost}
                            disabled={isPosting || (!postText.trim() && !selectedImage)}
                        >
                            {isPosting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPopUp;
