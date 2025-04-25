import { PaymentStatus, PaymentType } from './payment.model';

/**
 * Filtros para búsqueda de estudiantes
 */
export interface StudentFilters {
  /** Código del estudiante para búsqueda exacta */
  codigo?: string;
  /** ID del programa académico */
  programaId?: string;
  /** Término de búsqueda general (nombre, apellido, código) */
  search?: string;
}

/**
 * Filtros para búsqueda de pagos
 */
export interface PaymentFilters {
  /** Código del estudiante asociado al pago */
  estudiante_codigo?: string;
  /** Fecha de inicio para filtro por rango */
  fechaInicio?: string;
  /** Fecha de fin para filtro por rango */
  fechaFin?: string;
  /** Estado del pago */
  status?: PaymentStatus;
  /** Tipo de pago */
  type?: PaymentType;
}

/**
 * Estructura de datos para programa académico
 */
export interface Program {
  /** Identificador único del programa */
  id: string;
  /** Nombre del programa */
  nombre: string;
} 