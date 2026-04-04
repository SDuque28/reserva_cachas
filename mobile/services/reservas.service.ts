import apiClient from './apiClient';
import { Reserva } from './types';

interface CrearReservaPayload {
  canchaId: number;
  horarioId: number;
  fecha: string; // YYYY-MM-DD
}

interface ApiReserva {
  id: number;
  canchaId: number;
  canchaNombre: string;
  sedeId: number;
  sedeNombre: string;
  horarioId: number;
  horaInicio: string;
  horaFin: string;
  fecha: string;
  estado: string;
}

function normalizeReserva(apiReserva: ApiReserva): Reserva {
  return {
    id: apiReserva.id,
    fecha: apiReserva.fecha,
    estado: apiReserva.estado,
    canchaId: apiReserva.canchaId,
    canchaNombre: apiReserva.canchaNombre,
    sedeId: apiReserva.sedeId,
    sedeNombre: apiReserva.sedeNombre,
    horarioId: apiReserva.horarioId,
    horaInicio: apiReserva.horaInicio,
    horaFin: apiReserva.horaFin,
    cancha: {
      id: apiReserva.canchaId,
      nombre: apiReserva.canchaNombre,
      descripcion: '',
      capacidad: 0,
      imagenUrl: '',
      sede: {
        id: apiReserva.sedeId,
        nombre: apiReserva.sedeNombre,
        direccion: '',
      },
      tipo: {
        id: 0,
        nombre: '',
      },
      sedeId: apiReserva.sedeId,
      sedeNombre: apiReserva.sedeNombre,
    },
    horario: {
      id: apiReserva.horarioId,
      diaSemana: '',
      horaInicio: apiReserva.horaInicio,
      horaFin: apiReserva.horaFin,
    },
  };
}

export async function getReservas(): Promise<Reserva[]> {
  const { data } = await apiClient.get<ApiReserva[]>('/reservas/mis-reservas');
  return data.map(normalizeReserva);
}

export async function getReservaById(id: number): Promise<Reserva> {
  const { data } = await apiClient.get<ApiReserva>(`/reservas/${id}`);
  return normalizeReserva(data);
}

export async function crearReserva(payload: CrearReservaPayload): Promise<Reserva> {
  const { data } = await apiClient.post<Reserva>('/reservas', payload);
  return data;
}

export async function cancelarReserva(id: number): Promise<void> {
  await apiClient.delete(`/reservas/${id}`);
}
