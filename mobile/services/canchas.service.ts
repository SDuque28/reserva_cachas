import apiClient from './apiClient';
import { Cancha, Horario } from './types';

interface CanchasFiltros {
  sedeId?: number;
  tipoId?: number;
  fecha?: string; // YYYY-MM-DD
}

export async function getCanchas(filtros?: CanchasFiltros): Promise<Cancha[]> {
  const { data } = await apiClient.get<Cancha[]>('/canchas', { params: filtros });
  return data;
}

export async function getCanchaById(id: number): Promise<Cancha> {
  const { data } = await apiClient.get<Cancha>(`/canchas/${id}`);
  return data;
}

export async function getHorariosDisponibles(canchaId: number, fecha: string): Promise<Horario[]> {
  const { data } = await apiClient.get<Horario[]>(`/canchas/${canchaId}/horarios`, {
    params: { fecha },
  });
  return data;
}
