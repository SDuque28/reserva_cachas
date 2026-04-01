import apiClient from './apiClient';
import { TipoCancha } from './types';

export async function getTiposCanchas(): Promise<TipoCancha[]> {
  const { data } = await apiClient.get<TipoCancha[]>('/tipos-cancha');
  return data;
}
