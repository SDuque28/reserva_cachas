import apiClient from './apiClient';
import { Cancha, Horario } from './types';

interface CanchasFiltros {
  sedeId?: number;
  tipoId?: number;
  fecha?: string; // YYYY-MM-DD
}

interface ApiCancha {
  id: number;
  nombre: string;
  descripcion?: string | null;
  capacidad?: number | null;
  imagenUrl?: string | null;
  sedeId?: number | null;
  sedeNombre?: string | null;
  tipoId?: number | null;
  tipoNombre?: string | null;
  sede?: {
    id: number;
    nombre: string;
    direccion?: string;
  } | null;
  tipo?: {
    id: number;
    nombre: string;
  } | null;
}

function normalizeCancha(apiCancha: ApiCancha): Cancha {
  const sedeNombre = apiCancha.sede?.nombre ?? apiCancha.sedeNombre ?? 'Sede sin asignar';
  const tipoNombre = apiCancha.tipo?.nombre ?? apiCancha.tipoNombre ?? 'Tipo no especificado';

  return {
    id: apiCancha.id,
    nombre: apiCancha.nombre,
    descripcion:
      apiCancha.descripcion ??
      `${tipoNombre} disponible en ${sedeNombre}. Selecciona la cancha para revisar horarios.`,
    capacidad: apiCancha.capacidad ?? 0,
    imagenUrl: apiCancha.imagenUrl ?? '',
    sede: {
      id: apiCancha.sede?.id ?? apiCancha.sedeId ?? 0,
      nombre: sedeNombre,
      direccion: apiCancha.sede?.direccion ?? '',
    },
    tipo: {
      id: apiCancha.tipo?.id ?? apiCancha.tipoId ?? 0,
      nombre: tipoNombre,
    },
    sedeId: apiCancha.sede?.id ?? apiCancha.sedeId ?? 0,
    sedeNombre,
    tipoId: apiCancha.tipo?.id ?? apiCancha.tipoId ?? 0,
    tipoNombre,
  };
}

export async function getCanchas(filtros?: CanchasFiltros): Promise<Cancha[]> {
  const { data } = await apiClient.get<ApiCancha[] | Record<string, ApiCancha>>('/canchas', {
    params: filtros,
  });
  const canchas = Array.isArray(data) ? data : Object.values(data);
  return canchas.map(normalizeCancha);
}

export async function getCanchaById(id: number): Promise<Cancha> {
  const { data } = await apiClient.get<ApiCancha>(`/canchas/${id}`);
  return normalizeCancha(data);
}

export async function getHorariosDisponibles(canchaId: number, fecha: string): Promise<Horario[]> {
  const { data } = await apiClient.get<Horario[]>(`/canchas/${canchaId}/disponibilidad`, {
    params: { fecha },
  });
  return data;
}
