export interface Usuario {
  id?: number;
  username: string;
  nombre?: string;
  email: string;
  token: string;
  roles?: string[];
}

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
}

export interface TipoCancha {
  id: number;
  nombre: string;
}

export interface Cancha {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  imagenUrl: string;
  sede: Sede;
  tipo: TipoCancha;
  sedeId?: number;
  sedeNombre?: string;
  tipoId?: number;
  tipoNombre?: string;
}

export interface Horario {
  id: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface Reserva {
  id: number;
  fecha: string;
  cancha: Cancha;
  horario: Horario;
  usuario: Usuario;
}
