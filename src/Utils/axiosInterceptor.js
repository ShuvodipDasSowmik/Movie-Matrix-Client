import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AxiosInterceptor = (setToken, setUser) => {
    axios.interceptors.response.use(
        res => res,
        async error => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    console.warn("No refresh token available.");
                    return Promise.reject(error);
                }

                try {
                    const response = await axios.post(`${API_URL}/refresh`, { refreshToken });

                    const newAccessToken = response.data.accessToken;
                    const newUser = response.data.user;

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('user', JSON.stringify(newUser));
                    setToken(newAccessToken);
                    setUser(newUser);

                    axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    return axios(originalRequest); // Retry original request
                }
                
                catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    localStorage.clear();
                    window.location.href = '/login'; // or trigger logout
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        }
    );
};
