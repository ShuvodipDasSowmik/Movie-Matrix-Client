import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserPost = ({ username }) => {
    const { user: authUser } = useAuth();
    const { addNotification, removeNotification } = useNotification();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReactions, setShowReactions] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [newComment, setNewComment] = useState({});
    const [postReactions, setPostReactions] = useState({});
    const [postComments, setPostComments] = useState({});
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [deleteImage, setDeleteImage] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!username) return;
            
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`${API_URL}/posts/${username}`);
                
                if (response.status === 200) {
                    const userPosts = response.data.userBlogData || response.data;
                    // Initialize reactions for each post from backend data
                    const initialReactions = {};
                    const initialComments = {};
                    
                    if (Array.isArray(userPosts)) {
                        userPosts.forEach(post => {
                            // Initialize reactions
                            if (post.reactions) {
                                initialReactions[post.blogid] = {};
                                post.reactions.forEach(reaction => {
                                    initialReactions[post.blogid][reaction.reactiontype] = parseInt(reaction.count);
                                });
                            }
                            
                            // Initialize comments from post data
                            if (post.comments) {
                                initialComments[post.blogid] = post.comments.map(comment => ({
                                    blogcommentid: comment.blogcommentid,
                                    content: comment.commenttext,
                                    username: comment.username,
                                    createdAt: comment.commentdate
                                }));
                            }
                        });
                    }
                    
                    setPostReactions(initialReactions);
                    setPostComments(initialComments);
                    setPosts(userPosts);
                } else {
                    throw new Error('Failed to fetch posts');
                }
            } catch (err) {
                console.error('Error fetching user posts:', err);
                setError('Failed to load posts');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [username]); // Remove authUser dependency

    // Separate useEffect to handle user reactions after posts are loaded
    useEffect(() => {
        if (authUser && posts.length > 0) {
            setPostReactions(prev => {
                const updated = { ...prev };
                posts.forEach(post => {
                    // Check if current user has reacted to this post
                    if (post.reactors) {
                        const userReaction = post.reactors.find(reactor => 
                            reactor.username === authUser.username
                        );
                        if (userReaction) {
                            if (!updated[post.blogid]) {
                                updated[post.blogid] = {};
                            }
                            updated[post.blogid].userReaction = userReaction.reactiontype;
                            console.log(`User ${authUser.username} has ${userReaction.reactiontype} reaction on post ${post.blogid}`);
                        }
                    }
                });
                return updated;
            });
        }
    }, [authUser, posts]); // Run when authUser or posts change

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleReaction = async (postId, reactionType) => {
        if (!authUser) {
            alert('Please log in to react to posts');
            return;
        }
        
        // Check if user already has this reaction
        const currentUserReaction = postReactions[postId]?.userReaction;
        const isRemovingReaction = currentUserReaction === reactionType;
        
        try {
            let response;
            
            if (isRemovingReaction) {
                // Remove the reaction
                response = await axios.delete(`${API_URL}/remove-reaction`, {
                    data: {
                        blogid: postId,
                        username: authUser.username
                    }
                });
            } else {
                // Add new reaction (backend will handle replacing existing reaction)
                response = await axios.post(`${API_URL}/add-reaction`, {
                    blogid: postId,
                    username: authUser.username,
                    reaction: reactionType
                });
            }
            
            if (response.status === 200) {
                setPostReactions(prev => ({
                    ...prev,
                    [postId]: {
                        ...prev[postId],
                        [reactionType]: isRemovingReaction 
                            ? Math.max(0, (prev[postId]?.[reactionType] || 0) - 1)
                            : (prev[postId]?.[reactionType] || 0) + 1,
                        // If removing current reaction, clear userReaction, otherwise set new reaction
                        userReaction: isRemovingReaction ? null : reactionType,
                        // If user had different reaction before, decrease that count
                        ...(currentUserReaction && currentUserReaction !== reactionType ? {
                            [currentUserReaction]: Math.max(0, (prev[postId]?.[currentUserReaction] || 0) - 1)
                        } : {})
                    }
                }));
            }
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
        setShowReactions(prev => ({ ...prev, [postId]: false }));
    };

    const toggleComments = (postId) => {
        const isExpanding = !expandedComments[postId];
        
        setExpandedComments(prev => ({
            ...prev,
            [postId]: isExpanding
        }));
    };

    const handleAddComment = async (postId) => {
        if (!authUser) {
            alert('Please log in to comment');
            return;
        }
        
        const commentText = newComment[postId]?.trim();
        if (!commentText) return;

        // Show uploading notification
        const uploadingNotificationId = addNotification({
            type: 'loading',
            title: 'Uploading Comment',
            message: 'Please wait...'
        });

        try {
            const response = await axios.post(`${API_URL}/add-comment`, {
                commenttext: commentText,
                blogid: postId,
                username: authUser.username,
                commentdate: new Date().toISOString()
            });

            if (response.status === 200) {
                // Remove loading notification
                removeNotification(uploadingNotificationId);
                
                // Only update UI after successful server response
                const newCommentData = {
                    blogcommentid: Date.now(), // Temporary ID, will be replaced when comments are fetched again
                    content: commentText,
                    username: authUser.username,
                    createdAt: new Date().toISOString()
                };
                
                setPostComments(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), newCommentData]
                }));
                setNewComment(prev => ({ ...prev, [postId]: '' }));

                // Show success notification
                addNotification({
                    type: 'success',
                    title: 'Comment Added',
                    message: 'Your comment has been posted successfully!'
                });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            // Remove loading notification
            removeNotification(uploadingNotificationId);
            
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to add comment. Please try again.'
            });
        }
    };

    const getReactionEmoji = (type) => {
        switch (type) {
            case 'Like': return '👍';
            case 'Love': return '❤️';
            case 'Wow': return '😮';
            default: return '👍';
        }
    };

    const getReactionCount = (postId, type) => {
        return postReactions[postId]?.[type] || 0;
    };

    const getTotalReactions = (postId) => {
        const reactions = postReactions[postId];
        if (!reactions) return 0;
        return (reactions.Like || 0) + (reactions.Love || 0) + (reactions.Wow || 0);
    };

    const handleEditPost = (post) => {
        setEditingPost(post.blogid);
        setEditContent(post.content);
        setOriginalContent(post.content); // Store the original content
        setDeleteImage(false);
    };

    const handleUpdatePost = async (postId) => {
        // Show uploading notification
        const uploadingNotificationId = addNotification({
            type: 'loading',
            title: 'Updating Post',
            message: 'Please wait...'
        });

        try {
            const currentPost = posts.find(post => post.blogid === postId);
            
            // Determine if content was actually changed
            const finalContent = editContent !== originalContent ? editContent : currentPost.content;
            
            const updatedPost = {
                content: finalContent,
                updatedate: new Date().toISOString(),
                image: deleteImage ? null : currentPost.image,
                blogid: postId
            };

            // Send the updated post directly
            const response = await axios.put(`${API_URL}/update/${postId}`, updatedPost);

            if (response.status === 200) {
                // Remove loading notification
                removeNotification(uploadingNotificationId);
                
                // Only update UI after successful server response
                setPosts(prev => prev.map(post => 
                    post.blogid === postId 
                        ? { 
                            ...post, 
                            content: finalContent,
                            updatedate: new Date().toISOString(),
                            image: deleteImage ? null : post.image
                        }
                        : post
                ));
                setEditingPost(null);
                setEditContent('');
                setDeleteImage(false);
                setOriginalContent('');

                // Show success notification
                addNotification({
                    type: 'success',
                    title: 'Post Updated',
                    message: 'Your post has been updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating post:', error);
            // Remove loading notification
            removeNotification(uploadingNotificationId);
            
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to update post. Please try again.'
            });
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            // Show deleting notification
            const deletingNotificationId = addNotification({
                type: 'loading',
                title: 'Deleting Post',
                message: 'Please wait...'
            });

            try {
                // Send delete request to server first
                const response = await axios.delete(`${API_URL}/delete/${postId}`);

                if (response.status === 200) {
                    // Remove loading notification
                    removeNotification(deletingNotificationId);
                    
                    // Only update UI after successful server response
                    setPosts(prev => prev.filter(post => post.blogid !== postId));
                    
                    // Show success notification
                    addNotification({
                        type: 'success',
                        title: 'Post Deleted',
                        message: 'Your post has been deleted successfully!'
                    });
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                // Remove loading notification
                removeNotification(deletingNotificationId);
                
                addNotification({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to delete post. Please try again.'
                });
            }
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment.blogcommentid);
        setEditCommentContent(comment.content);
    };

    const handleUpdateComment = async (commentId) => {
        // Show uploading notification
        const uploadingNotificationId = addNotification({
            type: 'loading',
            title: 'Updating Comment',
            message: 'Please wait...'
        });

        try {
            const response = await axios.put(`${API_URL}/update-comment/${commentId}`, {
                blogcommentid: commentId,
                commenttext: editCommentContent
            });

            if (response.status === 200) {
                // Remove loading notification
                removeNotification(uploadingNotificationId);
                
                // Only update UI after successful server response
                setPostComments(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(postId => {
                        updated[postId] = updated[postId].map(comment =>
                            comment.blogcommentid === commentId
                                ? { ...comment, content: editCommentContent }
                                : comment
                        );
                    });
                    return updated;
                });
                setEditingComment(null);
                setEditCommentContent('');

                // Show success notification
                addNotification({
                    type: 'success',
                    title: 'Comment Updated',
                    message: 'Your comment has been updated successfully!'
                });
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            // Remove loading notification
            removeNotification(uploadingNotificationId);
            
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to update comment. Please try again.'
            });
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            // Show deleting notification
            const deletingNotificationId = addNotification({
                type: 'loading',
                title: 'Deleting Comment',
                message: 'Please wait...'
            });

            try {
                const response = await axios.delete(`${API_URL}/delete-comment/${commentId}`);

                if (response.status === 200) {
                    // Remove loading notification
                    removeNotification(deletingNotificationId);
                    
                    // Only update UI after successful server response
                    setPostComments(prev => {
                        const updated = { ...prev };
                        Object.keys(updated).forEach(postId => {
                            updated[postId] = updated[postId].filter(comment =>
                                comment.blogcommentid !== commentId
                            );
                        });
                        return updated;
                    });

                    // Show success notification
                    addNotification({
                        type: 'success',
                        title: 'Comment Deleted',
                        message: 'Your comment has been deleted successfully!'
                    });
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
                // Remove loading notification
                removeNotification(deletingNotificationId);
                
                addNotification({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to delete comment. Please try again.'
                });
            }
        }
    };

    const cancelEdit = () => {
        setEditingPost(null);
        setEditContent('');
        setOriginalContent('');
        setDeleteImage(false);
    };

    const cancelCommentEdit = () => {
        setEditingComment(null);
        setEditCommentContent('');
    };

    if (loading) {
        return (
            <div className="posts-section">
                <h2>Your Posts</h2>
                <div className="posts-loading">Loading your posts...</div>
            </div>
        );
    }

    return (
        <div className="posts-section">
            <h2>Your Posts</h2>
            
            {error && (
                <div className="posts-error">{error}</div>
            )}
            
            {posts.length === 0 ? (
                <div className="posts-placeholder">
                    <p>You haven't made any posts yet</p>
                    <p>Share your thoughts about movies to get started!</p>
                </div>
            ) : (
                <div className="posts-container">
                    {posts.map((post) => (
                        <div key={post.blogid} className="post-card">
                            <div className="post-header">
                                <div className="post-user">
                                    <div className="post-avatar">
                                        {username[0].toUpperCase()}
                                    </div>
                                    <div className="post-user-info">
                                        <span className="post-username">@{username}</span>
                                        <span className="post-date">{formatDate(post.updatedate)}</span>
                                    </div>
                                </div>
                                {authUser && authUser.username === username && (
                                    <div className="post-actions-menu">
                                        <button 
                                            className="edit-post-btn"
                                            onClick={() => handleEditPost(post)}
                                            title="Edit post"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                            </svg>
                                        </button>
                                        <button 
                                            className="delete-post-btn"
                                            onClick={() => handleDeletePost(post.blogid)}
                                            title="Delete post"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="post-content">
                                {editingPost === post.blogid ? (
                                    <div className="edit-post-form">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="edit-textarea"
                                            rows="4"
                                        />
                                        
                                        {post.image && (
                                            <div className="edit-image-container">
                                                <div className="edit-image-preview">
                                                    <img 
                                                        src={post.image} 
                                                        alt="Post image" 
                                                        className={deleteImage ? "image-to-delete" : ""}
                                                    />
                                                    <label className="delete-image-checkbox">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={deleteImage} 
                                                            onChange={(e) => setDeleteImage(e.target.checked)}
                                                        />
                                                        Delete image
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="edit-buttons">
                                            <button 
                                                className="save-edit-btn"
                                                onClick={() => handleUpdatePost(post.blogid)}
                                            >
                                                Save
                                            </button>
                                            <button 
                                                className="cancel-edit-btn"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>{post.content}</p>
                                )}
                                
                                {post.image && !editingPost && (
                                    <div className="post-image">
                                        <img 
                                            src={post.image} 
                                            alt="Post content" 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="post-actions">
                                <div className="post-stats">
                                    {getTotalReactions(post.blogid) > 0 && (
                                        <span className="reaction-count">
                                            {getReactionCount(post.blogid, 'Like') > 0 && '👍'}
                                            {getReactionCount(post.blogid, 'Love') > 0 && '❤️'}
                                            {getReactionCount(post.blogid, 'Wow') > 0 && '😮'}
                                            {getTotalReactions(post.blogid)}
                                        </span>
                                    )}
                                    {postComments[post.blogid]?.length > 0 && (
                                        <span className="comment-count">
                                            {postComments[post.blogid].length} comments
                                        </span>
                                    )}
                                </div>

                                <div className="action-buttons">
                                    <div className="reaction-container">
                                        <button 
                                            className={`action-btn reaction-btn ${postReactions[post.blogid]?.userReaction ? 'reacted' : ''}`}
                                            onClick={() => {
                                                console.log('Current user reaction:', postReactions[post.blogid]?.userReaction);
                                                console.log('Post reactions:', postReactions[post.blogid]);
                                                return authUser ? setShowReactions(prev => ({ 
                                                    ...prev, 
                                                    [post.blogid]: !prev[post.blogid] 
                                                })) : alert('Please log in to react');
                                            }}
                                            disabled={!authUser}
                                        >
                                            {postReactions[post.blogid]?.userReaction ? 
                                                `${getReactionEmoji(postReactions[post.blogid].userReaction)} ${postReactions[post.blogid].userReaction}` : 
                                                '👍 Like'
                                            }
                                        </button>
                                        
                                        {showReactions[post.blogid] && authUser && (
                                            <>
                                                <div 
                                                    className="reaction-overlay"
                                                    onClick={() => setShowReactions(prev => ({ 
                                                        ...prev, 
                                                        [post.blogid]: false 
                                                    }))}
                                                />
                                                <div className="reaction-popup">
                                                    <button 
                                                        className="reaction-option"
                                                        onClick={() => handleReaction(post.blogid, 'Like')}
                                                    >
                                                        👍
                                                    </button>
                                                    <button 
                                                        className="reaction-option"
                                                        onClick={() => handleReaction(post.blogid, 'Love')}
                                                    >
                                                        ❤️
                                                    </button>
                                                    <button 
                                                        className="reaction-option"
                                                        onClick={() => handleReaction(post.blogid, 'Wow')}
                                                    >
                                                        😮
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button 
                                        className="action-btn comment-btn"
                                        onClick={() => toggleComments(post.blogid)}
                                    >
                                        💬 Comment
                                    </button>
                                </div>
                            </div>

                            {expandedComments[post.blogid] && (
                                <div className="comments-section">
                                        {authUser && (
                                            <div className="add-comment">
                                                <input
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={newComment[post.blogid] || ''}
                                                    onChange={(e) => setNewComment(prev => ({
                                                        ...prev,
                                                        [post.blogid]: e.target.value
                                                    }))}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddComment(post.blogid);
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    className="comment-submit-btn"
                                                    onClick={() => handleAddComment(post.blogid)}
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        )}

                                        <div className="comments-list">
                                            {postComments[post.blogid]?.map((comment, index) => (
                                                <div key={index} className="comment-item">
                                                    <div className="comment-avatar">
                                                        {comment.username?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="comment-content">
                                                        <div className="comment-header">
                                                            <div className="comment-user-info">
                                                                <span className="comment-username">
                                                                    @{comment.username || 'Anonymous'}
                                                                </span>
                                                                <span className="comment-date">
                                                                    {formatDate(comment.createdAt)}
                                                                </span>
                                                            </div>
                                                            {authUser && authUser.username === comment.username && (
                                                                <div className="comment-actions">
                                                                    <button 
                                                                        className="comment-edit-btn"
                                                                        onClick={() => handleEditComment(comment)}
                                                                        title="Edit comment"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                                                        </svg>
                                                                    </button>
                                                                    <button 
                                                                        className="comment-delete-btn"
                                                                        onClick={() => handleDeleteComment(comment.blogcommentid)}
                                                                        title="Delete comment"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {editingComment === comment.blogcommentid ? (
                                                            <div className="edit-comment-form">
                                                                <textarea
                                                                    value={editCommentContent}
                                                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                                                    className="edit-comment-textarea"
                                                                    rows="2"
                                                                />
                                                                <div className="edit-comment-buttons">
                                                                    <button 
                                                                        className="save-comment-btn"
                                                                        onClick={() => handleUpdateComment(comment.blogcommentid)}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button 
                                                                        className="cancel-comment-btn"
                                                                        onClick={cancelCommentEdit}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="comment-text">{comment.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserPost;