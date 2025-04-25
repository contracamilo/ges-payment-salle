import { Student, CreateStudentDto, UpdateStudentDto } from '../../domain/models/student.model';
import { StudentFilters } from '../../domain/models/filters.model';
import { StudentRepository } from '../ports/student.repository';
import { Payment } from '../../domain/models/payment.model';

/**
 * Casos de uso para la gestión de estudiantes
 */
export class StudentUseCase {
  constructor(private repository: StudentRepository) {}

  /**
   * Obtiene todos los estudiantes
   * @returns Promise con array de estudiantes
   */
  async getAllStudents(): Promise<Student[]> {
    return this.repository.getAll();
  }

  /**
   * Obtiene un estudiante por su código
   * @param codigo Código único del estudiante
   * @returns Promise con el estudiante o null si no existe
   */
  async getStudentByCode(codigo: string): Promise<Student | null> {
    return this.repository.getByCode(codigo);
  }

  /**
   * Obtiene estudiantes que coinciden con los filtros especificados
   * @param filters Filtros para buscar estudiantes
   * @returns Promise con array de estudiantes filtrados
   */
  async getStudentsByFilters(filters: StudentFilters): Promise<Student[]> {
    return this.repository.getByFilters(filters);
  }

  /**
   * Obtiene estudiantes por programa académico
   * @param programaId ID del programa académico
   * @returns Promise con array de estudiantes del programa
   */
  async getStudentsByProgram(programaId: string): Promise<Student[]> {
    return this.repository.getByProgram(programaId);
  }

  /**
   * Obtiene los pagos de un estudiante
   * @param codigo Código del estudiante
   * @returns Promise con array de pagos del estudiante
   */
  async getStudentPayments(codigo: string): Promise<Payment[]> {
    // Primero verificamos que el estudiante exista
    const student = await this.repository.getByCode(codigo);
    if (!student) {
      throw new Error(`Estudiante con código ${codigo} no encontrado`);
    }
    return this.repository.getPayments(codigo);
  }

  /**
   * Crea un nuevo estudiante
   * @param student Datos del estudiante a crear
   * @returns Promise con el estudiante creado
   */
  async createStudent(student: CreateStudentDto): Promise<Student> {
    return this.repository.create(student);
  }

  /**
   * Actualiza un estudiante existente
   * @param codigo Código del estudiante a actualizar
   * @param studentData Datos actualizados del estudiante
   * @returns Promise con el estudiante actualizado
   */
  async updateStudent(codigo: string, studentData: UpdateStudentDto): Promise<Student> {
    // Verificamos que el estudiante exista
    const existingStudent = await this.repository.getByCode(codigo);
    if (!existingStudent) {
      throw new Error(`Estudiante con código ${codigo} no encontrado`);
    }
    return this.repository.update(codigo, studentData);
  }

  /**
   * Elimina un estudiante por su código
   * @param codigo Código del estudiante a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   */
  async deleteStudent(codigo: string): Promise<void> {
    // Verificamos que el estudiante exista
    const existingStudent = await this.repository.getByCode(codigo);
    if (!existingStudent) {
      throw new Error(`Estudiante con código ${codigo} no encontrado`);
    }
    return this.repository.delete(codigo);
  }
} 