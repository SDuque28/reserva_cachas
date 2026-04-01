import apiClient from './apiClient';
import { Usuario } from './types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  return data;
}
