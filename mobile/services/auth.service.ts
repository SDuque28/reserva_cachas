import apiClient from './apiClient';
import { Usuario } from './types';

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

interface ApiAuthResponse {
  token: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

function mapAuthResponse(data: ApiAuthResponse): AuthResponse {
  return {
    token: data.token,
    usuario: {
      username: data.username,
      nombre: data.username,
      email: data.email,
      token: data.token,
      roles: data.roles,
    },
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiAuthResponse>('/auth/login', payload);
  return mapAuthResponse(data);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiAuthResponse>('/auth/register', {
    username: payload.nombre,
    email: payload.email,
    password: payload.password,
  });
  return mapAuthResponse(data);
}
