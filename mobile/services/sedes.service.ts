import apiClient from './apiClient';
import { Sede } from './types';

export async function getSedes(): Promise<Sede[]> {
  const { data } = await apiClient.get<Sede[]>('/sedes');
  return data;
}
