import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: lee el JWT desde SecureStore y lo añade a cada request
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
