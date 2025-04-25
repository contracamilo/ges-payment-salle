import { Payment, CreatePaymentDto, UpdatePaymentStatusDto, PaymentStatus, PaymentType } from '../../domain/models/payment.model';
import { PaymentFilters } from '../../domain/models/filters.model';

/**
 * Puerto para el repositorio de pagos
 * Define las operaciones disponibles para gestionar pagos
 */
export interface PaymentRepository {
  /**
   * Obtiene todos los pagos
   * @returns Promise con array de pagos
   */
  getAll(): Promise<Payment[]>;

  /**
   * Obtiene un pago por su ID
   * @param id ID único del pago
   * @returns Promise con el pago o null si no existe
   */
  getById(id: number): Promise<Payment | null>;

  /**
   * Obtiene pagos que coinciden con los filtros especificados
   * @param filters Filtros para buscar pagos
   * @returns Promise con array de pagos filtrados
   */
  getByFilters(filters: PaymentFilters): Promise<Payment[]>;

  /**
   * Obtiene pagos por su estado
   * @param status Estado de los pagos a buscar
   * @returns Promise con array de pagos con el estado especificado
   */
  getByStatus(status: PaymentStatus): Promise<Payment[]>;

  /**
   * Obtiene pagos por su tipo
   * @param type Tipo de los pagos a buscar
   * @returns Promise con array de pagos del tipo especificado
   */
  getByType(type: PaymentType): Promise<Payment[]>;

  /**
   * Obtiene un enlace al archivo de comprobante de pago
   * @param pagoId ID del pago
   * @returns Promise con la URL del archivo o null si no existe
   */
  getPaymentFile(pagoId: number): Promise<string | null>;

  /**
   * Crea un nuevo pago
   * @param payment Datos del pago a crear
   * @returns Promise con el pago creado
   */
  create(payment: CreatePaymentDto): Promise<Payment>;

  /**
   * Actualiza el estado de un pago existente
   * @param pagoId ID del pago a actualizar
   * @param statusData Datos de estado actualizados
   * @returns Promise con el pago actualizado
   */
  updateStatus(pagoId: number, statusData: UpdatePaymentStatusDto): Promise<Payment>;
} 