import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import './ComponentStyles/Notification.css';

const Notification = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        
        // Show progress bar for timed notifications
        if (notification.duration && notification.duration > 0) {
            const progressTimer = setTimeout(() => setShowProgress(true), 200);
            return () => {
                clearTimeout(timer);
                clearTimeout(progressTimer);
            };
        }
        
        return () => clearTimeout(timer);
    }, [notification.duration]);

    const handleRemove = () => {
        setIsRemoving(true);
        setTimeout(() => {
            onRemove(notification.id);
        }, 300); // Match CSS animation duration
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '⚠';
            case 'warning':
                return '⚠';
            case 'info':
            case 'loading':
                return 'ℹ';
            default:
                return 'ℹ';
        }
    };

    return (
        <div 
            className={`notification ${notification.type} ${isVisible ? 'visible' : ''} ${isRemoving ? 'removing' : ''}`}
            onClick={handleRemove}
            role="alert"
            aria-live="polite"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRemove();
                }
            }}
        >
            <div className="notification-content">
                <div className="notification-icon">
                    {notification.type === 'loading' ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        getNotificationIcon(notification.type)
                    )}
                </div>
                <div className="notification-text">
                    <div className="notification-title">{notification.title}</div>
                    {notification.message && (
                        <div className="notification-message">{notification.message}</div>
                    )}
                </div>
                <button 
                    className="notification-close"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                    }}
                    aria-label="Close notification"
                    tabIndex={0}
                >
                    ×
                </button>
            </div>
            {showProgress && notification.duration && notification.duration > 0 && (
                <div 
                    className="notification-progress"
                    style={{
                        animationDuration: `${notification.duration}ms`
                    }}
                />
            )}
        </div>
    );
};

const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="notification-container">
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onRemove={removeNotification}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;