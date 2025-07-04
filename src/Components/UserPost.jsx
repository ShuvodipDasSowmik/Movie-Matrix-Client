import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserPost = ({ username }) => {
    const { user: authUser } = useAuth();
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

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!username) return;
            
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`http://localhost:3000/posts/${username}`);
                
                if (response.status === 200) {
                    const userPosts = response.data.userBlogData || response.data;
                    // Initialize reactions for each post from backend data
                    const initialReactions = {};
                    if (Array.isArray(userPosts)) {
                        userPosts.forEach(post => {
                            if (post.reactions) {
                                initialReactions[post.blogid] = {};
                                post.reactions.forEach(reaction => {
                                    initialReactions[post.blogid][reaction.reactiontype] = parseInt(reaction.count);
                                });
                            }
                        });
                    }
                    setPostReactions(initialReactions);
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
    }, [username]);

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
        try {
            const response = await axios.post(`http://localhost:3000/posts/${postId}/react`, {
                reactionType
            });
            
            if (response.status === 200) {
                setPostReactions(prev => ({
                    ...prev,
                    [postId]: {
                        ...prev[postId],
                        [reactionType]: (prev[postId]?.[reactionType] || 0) + 1,
                        userReaction: reactionType
                    }
                }));
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
        setShowReactions(prev => ({ ...prev, [postId]: false }));
    };

    const toggleComments = async (postId) => {
        const isExpanding = !expandedComments[postId];
        
        setExpandedComments(prev => ({
            ...prev,
            [postId]: isExpanding
        }));

        if (isExpanding && !postComments[postId]) {
            try {
                const response = await axios.get(`http://localhost:3000/posts/${postId}/comments`);
                if (response.status === 200) {
                    setPostComments(prev => ({
                        ...prev,
                        [postId]: response.data.comments || []
                    }));
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
                setPostComments(prev => ({
                    ...prev,
                    [postId]: []
                }));
            }
        }
    };

    const handleAddComment = async (postId) => {
        const commentText = newComment[postId]?.trim();
        if (!commentText) return;

        try {
            const response = await axios.post(`http://localhost:3000/posts/${postId}/comment`, {
                content: commentText
            });

            if (response.status === 200) {
                const newCommentData = response.data.comment;
                setPostComments(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), newCommentData]
                }));
                setNewComment(prev => ({ ...prev, [postId]: '' }));
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getReactionEmoji = (type) => {
        switch (type) {
            case 'like': return '👍';
            case 'love': return '❤️';
            case 'wow': return '😮';
            default: return '👍';
        }
    };

    const getReactionCount = (postId, type) => {
        return postReactions[postId]?.[type] || 0;
    };

    const getTotalReactions = (postId) => {
        const reactions = postReactions[postId];
        if (!reactions) return 0;
        return (reactions.like || 0) + (reactions.love || 0) + (reactions.wow || 0);
    };

    const handleEditPost = (post) => {
        setEditingPost(post.blogid);
        setEditContent(post.content);
        setOriginalContent(post.content); // Store the original content
        setDeleteImage(false);
    };

    const handleUpdatePost = async (postId) => {
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
            const response = await axios.put(`http://localhost:3000/update/${postId}`, updatedPost);

            if (response.status === 200) {
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
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                // Fix the delete endpoint path
                const response = await axios.delete(`http://localhost:3000/delete/${postId}`);

                if (response.status === 200) {
                    setPosts(prev => prev.filter(post => post.blogid !== postId));
                }
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const cancelEdit = () => {
        setEditingPost(null);
        setEditContent('');
        setOriginalContent('');
        setDeleteImage(false);
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
                                            {getReactionCount(post.blogid, 'like') > 0 && '👍'}
                                            {getReactionCount(post.blogid, 'love') > 0 && '❤️'}
                                            {getReactionCount(post.blogid, 'wow') > 0 && '😮'}
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
                                            onClick={() => setShowReactions(prev => ({ 
                                                ...prev, 
                                                [post.blogid]: !prev[post.blogid] 
                                            }))}
                                        >
                                            {postReactions[post.blogid]?.userReaction ? 
                                                getReactionEmoji(postReactions[post.blogid].userReaction) : 
                                                '👍'
                                            } Like
                                        </button>
                                        
                                        {showReactions[post.blogid] && (
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
                                                        onClick={() => handleReaction(post.blogid, 'like')}
                                                    >
                                                        👍
                                                    </button>
                                                    <button 
                                                        className="reaction-option"
                                                        onClick={() => handleReaction(post.blogid, 'love')}
                                                    >
                                                        ❤️
                                                    </button>
                                                    <button 
                                                        className="reaction-option"
                                                        onClick={() => handleReaction(post.blogid, 'wow')}
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

                                {expandedComments[post.blogid] && (
                                    <div className="comments-section">
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

                                        <div className="comments-list">
                                            {postComments[post.blogid]?.map((comment, index) => (
                                                <div key={index} className="comment-item">
                                                    <div className="comment-avatar">
                                                        {comment.username?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="comment-content">
                                                        <div className="comment-header">
                                                            <span className="comment-username">
                                                                @{comment.username || 'Anonymous'}
                                                            </span>
                                                            <span className="comment-date">
                                                                {formatDate(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="comment-text">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserPost;