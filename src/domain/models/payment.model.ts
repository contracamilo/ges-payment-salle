/**
 * Modelo que representa un pago en el sistema
 */
export interface Payment {
  /** Identificador único del pago */
  id: number;
  /** Fecha en que se realizó el pago */
  fecha: string;
  /** Monto del pago */
  monto: number;
  /** Tipo de pago */
  type: PaymentType;
  /** Estado actual del pago */
  status: PaymentStatus;
  /** Referencia al archivo de comprobante */
  file: string | null;
  /** Estudiante asociado al pago */
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    codigo: string;
    programaId: string;
    foto: string | null;
  };
}

/**
 * Tipos de pago soportados por el sistema
 */
export enum PaymentType {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE',
  TARJETA = 'TARJETA',
  OTRO = 'OTRO'
}

/**
 * Estados posibles de un pago
 */
export enum PaymentStatus {
  CREADO = 'CREADO',
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO'
}

/**
 * Modelo para la creación de un nuevo pago
 */
export type CreatePaymentDto = Omit<Payment, 'id' | 'estudiante'> & { 
  estudianteId: string 
};

/**
 * Modelo para la actualización del estado de un pago
 */
export interface UpdatePaymentStatusDto {
  status: PaymentStatus;
} 