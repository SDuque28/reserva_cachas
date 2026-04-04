import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'http://192.168.88.168:8080';

function maskSensitiveData(data: unknown) {
  if (!data || typeof data !== 'object') return data;

  const safeData = { ...(data as Record<string, unknown>) };

  if (typeof safeData.password === 'string') {
    safeData.password = '****';
  }

  if (typeof safeData.token === 'string') {
    safeData.token = `${safeData.token.slice(0, 12)}...`;
  }

  return safeData;
}

function logRequest(config: InternalAxiosRequestConfig) {
  if (!__DEV__) return;

  console.log('[API REQUEST]', {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    params: config.params,
    data: maskSensitiveData(config.data),
    hasAuthHeader: Boolean(config.headers?.Authorization),
  });
}

function logResponse(status: number, url: string | undefined, data: unknown) {
  if (!__DEV__) return;

  console.log('[API RESPONSE]', {
    status,
    url,
    data: maskSensitiveData(data),
  });
}

function logError(error: AxiosError) {
  if (!__DEV__) return;

  console.error('[API ERROR]', {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    url: `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
    requestData: maskSensitiveData(error.config?.data),
    responseData: maskSensitiveData(error.response?.data),
  });
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token && config?.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  logRequest(config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    logResponse(response.status, response.config?.url, response.data);
    return response;
  },
  (error) => {
    logError(error);
    return Promise.reject(error);
  }
);

export default api;
