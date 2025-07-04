import { useNotification } from '../context/NotificationContext';

export const useNotificationHelpers = () => {
    const { addNotification, updateNotification, removeNotification } = useNotification();

    const showSuccess = (title, message = '', duration = 4000) => {
        return addNotification({
            type: 'success',
            title,
            message,
            duration
        });
    };

    const showError = (title, message = '', duration = 5000) => {
        return addNotification({
            type: 'error',
            title,
            message,
            duration
        });
    };

    const showWarning = (title, message = '', duration = 4000) => {
        return addNotification({
            type: 'warning',
            title,
            message,
            duration
        });
    };

    const showInfo = (title, message = '', duration = 4000) => {
        return addNotification({
            type: 'info',
            title,
            message,
            duration
        });
    };

    const showLoading = (title, message = '', persistent = true) => {
        return addNotification({
            type: 'loading',
            title,
            message,
            duration: persistent ? 0 : 5000
        });
    };

    const updateToSuccess = (id, title, message = '', duration = 4000) => {
        updateNotification(id, {
            type: 'success',
            title,
            message,
            duration
        });
    };

    const updateToError = (id, title, message = '', duration = 5000) => {
        updateNotification(id, {
            type: 'error',
            title,
            message,
            duration
        });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
        updateToSuccess,
        updateToError,
        updateNotification,
        removeNotification
    };
};
