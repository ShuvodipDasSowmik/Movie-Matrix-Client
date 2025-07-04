import React from 'react';
import { useNotificationHelpers } from '../Hooks/useNotificationHelpers';

const NotificationDemo = () => {
    const { showSuccess, showError, showWarning, showInfo, showLoading, updateToSuccess } = useNotificationHelpers();

    const handleSuccessDemo = () => {
        showSuccess('Success!', 'This is a success notification');
    };

    const handleErrorDemo = () => {
        showError('Error!', 'This is an error notification');
    };

    const handleWarningDemo = () => {
        showWarning('Warning!', 'This is a warning notification');
    };

    const handleInfoDemo = () => {
        showInfo('Info', 'This is an info notification');
    };

    const handleLoadingDemo = () => {
        const id = showLoading('Loading...', 'Please wait while we process your request');
        
        // Simulate an async operation
        setTimeout(() => {
            updateToSuccess(id, 'Completed!', 'The operation was successful');
        }, 3000);
    };

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <h3>Notification Demo</h3>
            <button onClick={handleSuccessDemo}>Show Success</button>
            <button onClick={handleErrorDemo}>Show Error</button>
            <button onClick={handleWarningDemo}>Show Warning</button>
            <button onClick={handleInfoDemo}>Show Info</button>
            <button onClick={handleLoadingDemo}>Show Loading → Success</button>
        </div>
    );
};

export default NotificationDemo;
