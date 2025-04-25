/**
 * Modelo que representa a un estudiante en el sistema
 */
export interface Student {
  /** Identificador único del estudiante (UUID) */
  id: string;
  /** Código único del estudiante */
  codigo: string;
  /** Nombre del estudiante */
  nombre: string;
  /** Apellido del estudiante */
  apellido: string;
  /** Identificador del programa académico al que pertenece */
  programaId: string;
  /** URL o referencia a la foto del estudiante */
  foto: string | null;
}

/**
 * Estados posibles de un estudiante
 */
export enum StudentStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  GRADUADO = 'GRADUADO',
  SUSPENDIDO = 'SUSPENDIDO'
}

/**
 * Modelo para la creación de un nuevo estudiante
 */
export type CreateStudentDto = Omit<Student, 'id'>;

/**
 * Modelo para la actualización de un estudiante existente
 */
export type UpdateStudentDto = Partial<CreateStudentDto>; 