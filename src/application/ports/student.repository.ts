import { Student, CreateStudentDto, UpdateStudentDto } from '../../domain/models/student.model';
import { StudentFilters } from '../../domain/models/filters.model';
import { Payment } from '../../domain/models/payment.model';

/**
 * Puerto para el repositorio de estudiantes
 * Define las operaciones disponibles para gestionar estudiantes
 */
export interface StudentRepository {
  /**
   * Obtiene todos los estudiantes
   * @returns Promise con array de estudiantes
   */
  getAll(): Promise<Student[]>;

  /**
   * Obtiene un estudiante por su código
   * @param codigo Código único del estudiante
   * @returns Promise con el estudiante o null si no existe
   */
  getByCode(codigo: string): Promise<Student | null>;

  /**
   * Obtiene estudiantes que coinciden con los filtros especificados
   * @param filters Filtros para buscar estudiantes
   * @returns Promise con array de estudiantes filtrados
   */
  getByFilters(filters: StudentFilters): Promise<Student[]>;

  /**
   * Obtiene estudiantes por programa académico
   * @param programaId ID del programa académico
   * @returns Promise con array de estudiantes del programa
   */
  getByProgram(programaId: string): Promise<Student[]>;

  /**
   * Obtiene los pagos de un estudiante
   * @param codigo Código del estudiante
   * @returns Promise con array de pagos del estudiante
   */
  getPayments(codigo: string): Promise<Payment[]>;

  /**
   * Crea un nuevo estudiante
   * @param student Datos del estudiante a crear
   * @returns Promise con el estudiante creado
   */
  create(student: CreateStudentDto): Promise<Student>;

  /**
   * Actualiza un estudiante existente
   * @param codigo Código del estudiante a actualizar
   * @param studentData Datos actualizados del estudiante
   * @returns Promise con el estudiante actualizado
   */
  update(codigo: string, studentData: UpdateStudentDto): Promise<Student>;

  /**
   * Elimina un estudiante por su código
   * @param codigo Código del estudiante a eliminar
   * @returns Promise que resuelve cuando se completa la eliminación
   */
  delete(codigo: string): Promise<void>;
}
