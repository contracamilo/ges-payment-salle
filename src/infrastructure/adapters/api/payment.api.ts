import { PaymentRepository } from '../../../application/ports/payment.repository';
import {
  Payment,
  CreatePaymentDto,
  UpdatePaymentStatusDto,
  PaymentStatus,
  PaymentType,
} from '../../../domain/models/payment.model';
import { PaymentFilters } from '../../../domain/models/filters.model';
import { fetchApi } from './api.config';

/**
 * Implementación del repositorio de pagos usando la API REST
 */
export class PaymentApiRepository implements PaymentRepository {
  /**
   * Obtiene todos los pagos
   */
  async getAll(): Promise<Payment[]> {
    return fetchApi<Payment[]>('/pagos');
  }

  /**
   * Obtiene un pago por su ID
   */
  async getById(id: number): Promise<Payment | null> {
    try {
      return await fetchApi<Payment>(`/pagos/${id}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtiene pagos por filtros
   */
  async getByFilters(filters: PaymentFilters): Promise<Payment[]> {
    // Construimos la URL con los parámetros de filtro
    const params = new URLSearchParams();

    if (filters.estudiante_codigo) {
      params.append('estudiante_codigo', filters.estudiante_codigo);
      console.log(`Filtrando pagos por estudiante: ${filters.estudiante_codigo}`);
    }
    if (filters.fechaInicio) {
      params.append('fechaInicio', filters.fechaInicio);
    }
    if (filters.fechaFin) {
      params.append('fechaFin', filters.fechaFin);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.type) {
      params.append('type', filters.type);
    }

    const url = `/pagos?${params.toString()}`;
    console.log(`Realizando petición API: ${url}`);

    try {
      const payments = await fetchApi<Payment[]>(url);
      console.log(`Pagos recibidos: ${payments.length}`);
      return payments;
    } catch (error) {
      console.error('Error al obtener pagos con filtros:', error);
      throw error;
    }
  }

  /**
   * Obtiene pagos por su estado
   */
  async getByStatus(status: PaymentStatus): Promise<Payment[]> {
    return fetchApi<Payment[]>(`/pagosPorStatus?status=${status}`);
  }

  /**
   * Obtiene pagos por su tipo
   */
  async getByType(type: PaymentType): Promise<Payment[]> {
    return fetchApi<Payment[]>(`/pagos/porTipo?type=${type}`);
  }

  /**
   * Obtiene un enlace al archivo de comprobante de pago
   */
  async getPaymentFile(pagoId: number): Promise<string | null> {
    try {
      const response = await fetchApi<{ fileUrl: string }>(`/pagoFile/${pagoId}`);
      return response.fileUrl;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Crea un nuevo pago
   */
  async create(payment: CreatePaymentDto): Promise<Payment> {
    console.log('PaymentApiRepository - Creando nuevo pago:', payment);

    // Verificar que el pago incluya la información del estudiante
    if (!payment.estudiante) {
      console.error('PaymentApiRepository - Error: El pago no incluye información del estudiante');
    } else {
      console.log('PaymentApiRepository - Información de estudiante incluida:', payment.estudiante);
    }

    try {
      const result = await fetchApi<Payment>('/pagos', {
        method: 'POST',
        body: JSON.stringify(payment),
      });

      console.log('PaymentApiRepository - Pago creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('PaymentApiRepository - Error al crear pago:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un pago existente
   */
  async updateStatus(pagoId: number, statusData: UpdatePaymentStatusDto): Promise<Payment> {
    return fetchApi<Payment>(`/pagos/${pagoId}/actualizarPago`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }
}
