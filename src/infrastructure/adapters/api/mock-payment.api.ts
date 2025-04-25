import { PaymentRepository } from '../../../application/ports/payment.repository';
import { Payment, CreatePaymentDto, UpdatePaymentStatusDto, PaymentStatus, PaymentType } from '../../../domain/models/payment.model';
import { PaymentFilters } from '../../../domain/models/filters.model';
import { MOCK_PAYMENTS } from './mock-data';

/**
 * Implementación del repositorio de pagos usando datos mock
 */
export class MockPaymentRepository implements PaymentRepository {
  private payments: Payment[] = [...MOCK_PAYMENTS];
  private nextId: number = this.payments.length + 1;

  /**
   * Obtiene todos los pagos
   */
  async getAll(): Promise<Payment[]> {
    return Promise.resolve([...this.payments]);
  }

  /**
   * Obtiene un pago por su ID
   */
  async getById(id: number): Promise<Payment | null> {
    const payment = this.payments.find(p => p.id === id);
    return Promise.resolve(payment || null);
  }

  /**
   * Obtiene pagos por filtros
   */
  async getByFilters(filters: PaymentFilters): Promise<Payment[]> {
    let filteredPayments = [...this.payments];
    
    if (filters.estudiante_codigo) {
      filteredPayments = filteredPayments.filter(p => 
        p.estudiante.codigo === filters.estudiante_codigo
      );
    }
    
    if (filters.fechaInicio) {
      const fechaInicio = new Date(filters.fechaInicio);
      filteredPayments = filteredPayments.filter(p => 
        new Date(p.fecha) >= fechaInicio
      );
    }
    
    if (filters.fechaFin) {
      const fechaFin = new Date(filters.fechaFin);
      filteredPayments = filteredPayments.filter(p => 
        new Date(p.fecha) <= fechaFin
      );
    }
    
    if (filters.status) {
      filteredPayments = filteredPayments.filter(p => 
        p.status === filters.status
      );
    }
    
    if (filters.type) {
      filteredPayments = filteredPayments.filter(p => 
        p.type === filters.type
      );
    }
    
    return Promise.resolve(filteredPayments);
  }

  /**
   * Obtiene pagos por su estado
   */
  async getByStatus(status: PaymentStatus): Promise<Payment[]> {
    const filtered = this.payments.filter(p => p.status === status);
    return Promise.resolve(filtered);
  }

  /**
   * Obtiene pagos por su tipo
   */
  async getByType(type: PaymentType): Promise<Payment[]> {
    const filtered = this.payments.filter(p => p.type === type);
    return Promise.resolve(filtered);
  }

  /**
   * Obtiene un enlace al archivo de comprobante de pago
   */
  async getPaymentFile(pagoId: number): Promise<string | null> {
    const payment = this.payments.find(p => p.id === pagoId);
    return Promise.resolve(payment?.file || null);
  }

  /**
   * Crea un nuevo pago
   */
  async create(paymentData: CreatePaymentDto): Promise<Payment> {
    // Simular la obtención de información del estudiante
    const estudiante = {
      id: '999',
      codigo: paymentData.estudianteId,
      nombre: 'Estudiante',
      apellido: 'Prueba',
      programaId: 'PROG1',
      foto: null
    };
    
    const newPayment: Payment = {
      id: this.nextId++,
      fecha: paymentData.fecha,
      monto: paymentData.monto,
      type: paymentData.type,
      status: paymentData.status,
      file: paymentData.file,
      estudiante
    };
    
    this.payments.push(newPayment);
    return Promise.resolve({...newPayment});
  }

  /**
   * Actualiza el estado de un pago existente
   */
  async updateStatus(pagoId: number, statusData: UpdatePaymentStatusDto): Promise<Payment> {
    const index = this.payments.findIndex(p => p.id === pagoId);
    
    if (index === -1) {
      throw new Error(`Pago con ID ${pagoId} no encontrado`);
    }
    
    const updatedPayment = {
      ...this.payments[index],
      status: statusData.status
    };
    
    this.payments[index] = updatedPayment;
    return Promise.resolve({...updatedPayment});
  }
} 