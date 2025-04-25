import { Payment, CreatePaymentDto, UpdatePaymentStatusDto, PaymentStatus, PaymentType } from '../../domain/models/payment.model';
import { PaymentFilters } from '../../domain/models/filters.model';
import { PaymentRepository } from '../ports/payment.repository';

/**
 * Casos de uso para la gestión de pagos
 */
export class PaymentUseCase {
  constructor(private repository: PaymentRepository) {}

  /**
   * Obtiene todos los pagos
   * @returns Promise con array de pagos
   */
  async getAllPayments(): Promise<Payment[]> {
    return this.repository.getAll();
  }

  /**
   * Obtiene un pago por su ID
   * @param id ID único del pago
   * @returns Promise con el pago o null si no existe
   */
  async getPaymentById(id: number): Promise<Payment | null> {
    return this.repository.getById(id);
  }

  /**
   * Obtiene pagos que coinciden con los filtros especificados
   * @param filters Filtros para buscar pagos
   * @returns Promise con array de pagos filtrados
   */
  async getPaymentsByFilters(filters: PaymentFilters): Promise<Payment[]> {
    return this.repository.getByFilters(filters);
  }

  /**
   * Obtiene pagos por su estado
   * @param status Estado de los pagos a buscar
   * @returns Promise con array de pagos con el estado especificado
   */
  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.repository.getByStatus(status);
  }

  /**
   * Obtiene pagos por su tipo
   * @param type Tipo de los pagos a buscar
   * @returns Promise con array de pagos del tipo especificado
   */
  async getPaymentsByType(type: PaymentType): Promise<Payment[]> {
    return this.repository.getByType(type);
  }

  /**
   * Obtiene un enlace al archivo de comprobante de pago
   * @param pagoId ID del pago
   * @returns Promise con la URL del archivo o null si no existe
   */
  async getPaymentFile(pagoId: number): Promise<string | null> {
    // Verificamos que el pago exista
    const payment = await this.repository.getById(pagoId);
    if (!payment) {
      throw new Error(`Pago con ID ${pagoId} no encontrado`);
    }
    return this.repository.getPaymentFile(pagoId);
  }

  /**
   * Crea un nuevo pago
   * @param payment Datos del pago a crear
   * @returns Promise con el pago creado
   */
  async createPayment(payment: CreatePaymentDto): Promise<Payment> {
    return this.repository.create(payment);
  }

  /**
   * Actualiza el estado de un pago existente
   * @param pagoId ID del pago a actualizar
   * @param statusData Datos de estado actualizados
   * @returns Promise con el pago actualizado
   */
  async updatePaymentStatus(pagoId: number, statusData: UpdatePaymentStatusDto): Promise<Payment> {
    // Verificamos que el pago exista
    const existingPayment = await this.repository.getById(pagoId);
    if (!existingPayment) {
      throw new Error(`Pago con ID ${pagoId} no encontrado`);
    }
    return this.repository.updateStatus(pagoId, statusData);
  }
} 