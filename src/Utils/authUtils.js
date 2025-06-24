import axios from 'axios';

// Create an authenticated fetch function that uses the stored token
export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        throw new Error('No access token found');
    }

    const config = {
        url,
        method: options.method || 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (options.body) {
        config.data = options.body;
    }

    try {
        const response = await axios(config);
        return {
            ok: true,
            status: response.status,
            json: async () => response.data
        };
    }
    
    catch (error) {
        return {
            ok: false,
            status: error.response?.status || 500,
            json: async () => error.response?.data || { message: 'Network error' }
        };
    }
};

export default authFetch;