import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            ...notification,
            createdAt: Date.now()
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove notification after duration (default 5 seconds)
        // Use undefined check instead of falsy check to handle duration: 0 correctly
        const duration = notification.duration !== undefined ? notification.duration : 5000;
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    const updateNotification = useCallback((id, updates) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id 
                    ? { ...notif, ...updates }
                    : notif
            )
        );

        // If the update includes a duration, set up auto-removal
        if (updates.duration !== undefined && updates.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, updates.duration);
        }
    }, [removeNotification]);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        updateNotification,
        clearAllNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
