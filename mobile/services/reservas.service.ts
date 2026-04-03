import apiClient from './apiClient';
import { Reserva } from './types';

interface CrearReservaPayload {
  canchaId: number;
  horarioId: number;
  fecha: string; // YYYY-MM-DD
}

export async function getReservas(): Promise<Reserva[]> {
  const { data } = await apiClient.get<Reserva[]>('/reservas/mis-reservas');
  return data;
}

export async function getReservaById(id: number): Promise<Reserva> {
  const { data } = await apiClient.get<Reserva>(`/reservas/${id}`);
  return data;
}

export async function crearReserva(payload: CrearReservaPayload): Promise<Reserva> {
  const { data } = await apiClient.post<Reserva>('/reservas', payload);
  return data;
}

export async function cancelarReserva(id: number): Promise<void> {
  await apiClient.delete(`/reservas/${id}`);
}
