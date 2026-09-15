import axios from 'axios';
import Cookies from 'js-cookie';
import { endpoints } from '@/services/endpoints';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

// Automatically attach the access token to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request fails with 401 (expired access token), try refreshing it
// once, then retry the original request. This mirrors the refresh-token
// flow already built on the backend.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoints.auth.refresh}`, {
          refreshToken,
        });

        Cookies.set('accessToken', data.accessToken, { expires: 1 / 96 }); // ~15 minutes
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token itself is invalid/expired — force logout
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
