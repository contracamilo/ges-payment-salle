import { StudentRepository } from '../../../application/ports/student.repository';
import { Student, CreateStudentDto, UpdateStudentDto } from '../../../domain/models/student.model';
import { StudentFilters } from '../../../domain/models/filters.model';
import { Payment } from '../../../domain/models/payment.model';
import { MOCK_STUDENTS, getStudentPayments } from './mock-data';

/**
 * Implementación del repositorio de estudiantes usando datos mock
 */
export class MockStudentRepository implements StudentRepository {
  private students: Student[] = [...MOCK_STUDENTS];
  private nextId: number = this.students.length + 1;

  /**
   * Obtiene todos los estudiantes
   */
  async getAll(): Promise<Student[]> {
    return Promise.resolve([...this.students]);
  }

  /**
   * Obtiene un estudiante por su código
   */
  async getByCode(codigo: string): Promise<Student | null> {
    const student = this.students.find(s => s.codigo === codigo);
    return Promise.resolve(student || null);
  }

  /**
   * Obtiene estudiantes por filtros
   */
  async getByFilters(filters: StudentFilters): Promise<Student[]> {
    let filteredStudents = [...this.students];

    if (filters.codigo) {
      filteredStudents = filteredStudents.filter(s =>
        s.codigo.toLowerCase().includes(filters.codigo!.toLowerCase())
      );
    }

    if (filters.programaId) {
      filteredStudents = filteredStudents.filter(s => s.programaId === filters.programaId);
    }

    return Promise.resolve(filteredStudents);
  }

  /**
   * Obtiene estudiantes por programa académico
   */
  async getByProgram(programaId: string): Promise<Student[]> {
    const filtered = this.students.filter(s => s.programaId === programaId);
    return Promise.resolve(filtered);
  }

  /**
   * Obtiene los pagos de un estudiante
   */
  async getPayments(codigo: string): Promise<Payment[]> {
    return Promise.resolve(getStudentPayments(codigo));
  }

  /**
   * Crea un nuevo estudiante
   */
  async create(studentData: CreateStudentDto): Promise<Student> {
    const newStudent: Student = {
      id: String(this.nextId++),
      ...studentData,
    };

    this.students.push(newStudent);
    return Promise.resolve({ ...newStudent });
  }

  /**
   * Actualiza un estudiante existente
   */
  async update(codigo: string, studentData: UpdateStudentDto): Promise<Student> {
    const index = this.students.findIndex(s => s.codigo === codigo);

    if (index === -1) {
      throw new Error(`Estudiante con código ${codigo} no encontrado`);
    }

    const updatedStudent = {
      ...this.students[index],
      ...studentData,
      codigo, // Mantenemos el código original
    };

    this.students[index] = updatedStudent;
    return Promise.resolve({ ...updatedStudent });
  }

  /**
   * Elimina un estudiante por su código
   */
  async delete(codigo: string): Promise<void> {
    const index = this.students.findIndex(s => s.codigo === codigo);

    if (index !== -1) {
      this.students.splice(index, 1);
    }

    return Promise.resolve();
  }
}
