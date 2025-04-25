import { StudentRepository } from '../../../application/ports/student.repository';
import { Student, CreateStudentDto, UpdateStudentDto } from '../../../domain/models/student.model';
import { StudentFilters } from '../../../domain/models/filters.model';
import { Payment } from '../../../domain/models/payment.model';
import { fetchApi } from './api.config';

/**
 * Implementación del repositorio de estudiantes usando la API REST
 */
export class StudentApiRepository implements StudentRepository {
  /**
   * Obtiene todos los estudiantes
   */
  async getAll(): Promise<Student[]> {
    return fetchApi<Student[]>('/estudiantes');
  }

  /**
   * Obtiene un estudiante por su código
   */
  async getByCode(codigo: string): Promise<Student | null> {
    try {
      return await fetchApi<Student>(`/estudiantes/${codigo}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtiene estudiantes por filtros
   */
  async getByFilters(filters: StudentFilters): Promise<Student[]> {
    // Construimos la URL con los parámetros de filtro
    const params = new URLSearchParams();
    if (filters.codigo) {
      params.append('codigo', filters.codigo);
    }
    if (filters.programaId) {
      params.append('programaId', filters.programaId);
    }

    return fetchApi<Student[]>(`/estudiantes?${params.toString()}`);
  }

  /**
   * Obtiene estudiantes por programa académico
   */
  async getByProgram(programaId: string): Promise<Student[]> {
    return fetchApi<Student[]>(`/estudiantesPorPrograma/${programaId}`);
  }

  /**
   * Obtiene los pagos de un estudiante
   */
  async getPayments(codigo: string): Promise<Payment[]> {
    return fetchApi<Payment[]>(`/estudiantes/${codigo}/pagos`);
  }

  /**
   * Crea un nuevo estudiante
   */
  async create(student: CreateStudentDto): Promise<Student> {
    return fetchApi<Student>('/estudiantes', {
      method: 'POST',
      body: JSON.stringify(student)
    });
  }

  /**
   * Actualiza un estudiante existente
   */
  async update(codigo: string, studentData: UpdateStudentDto): Promise<Student> {
    return fetchApi<Student>(`/estudiantes/${codigo}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  /**
   * Elimina un estudiante por su código
   */
  async delete(codigo: string): Promise<void> {
    await fetchApi<void>(`/estudiantes/${codigo}`, {
      method: 'DELETE'
    });
  }
} 