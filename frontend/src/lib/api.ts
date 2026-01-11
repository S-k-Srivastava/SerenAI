import axios from 'axios';
import { config } from '@/config/config';

const api = axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Skip auth for public chat routes
        const isPublicRoute = config.url?.includes('/public/chat');

        if (!isPublicRoute) {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't intercept errors from auth endpoints (login, register, SSO) or public chat routes
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                               originalRequest.url?.includes('/auth/register') ||
                               originalRequest.url?.includes('/auth/sso') ||
                               originalRequest.url?.includes('/auth/refresh');

        const isPublicRoute = originalRequest.url?.includes('/public/chat');

        // If it's an auth endpoint or public route, just return the error without token refresh logic
        if (isAuthEndpoint || isPublicRoute) {
            return Promise.reject(error);
        }

        // If it's a 401 and we've already retried, force logout
        if (error.response?.status === 401 && originalRequest._retry) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const { data } = await axios.post(`${config.apiBaseUrl}/auth/refresh`, { refreshToken });

                    // Fix: Extract from data.data if it exists, otherwise fallback to data (just in case)
                    const newAccessToken = data.data?.accessToken || data.accessToken;
                    const newRefreshToken = data.data?.refreshToken || data.refreshToken;

                    if (newAccessToken) {
                        localStorage.setItem('token', newAccessToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        // Notify AuthContext
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
                                detail: { token: newAccessToken }
                            }));
                        }
                    }

                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Redirect to login if refresh fails
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
