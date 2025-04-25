import { Student } from '../../../domain/models/student.model';
import { Payment, PaymentStatus, PaymentType } from '../../../domain/models/payment.model';

// Datos de estudiantes de prueba
export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    codigo: 'EST-001',
    nombre: 'Juan',
    apellido: 'Pérez',
    programaId: 'ING1',
    foto: null,
  },
  {
    id: '2',
    codigo: 'EST-002',
    nombre: 'María',
    apellido: 'González',
    programaId: 'MED1',
    foto: null,
  },
  {
    id: '3',
    codigo: 'EST-003',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    programaId: 'ADM1',
    foto: null,
  },
];

// Datos de pagos de prueba
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 1,
    fecha: '2025-04-01',
    monto: 500000,
    type: PaymentType.TRANSFERENCIA,
    status: PaymentStatus.PAGADO,
    file: null,
    estudiante: {
      id: '1',
      codigo: 'EST-001',
      nombre: 'Juan',
      apellido: 'Pérez',
      programaId: 'ING1',
      foto: null,
    },
  },
  {
    id: 2,
    fecha: '2025-04-10',
    monto: 750000,
    type: PaymentType.EFECTIVO,
    status: PaymentStatus.PENDIENTE,
    file: null,
    estudiante: {
      id: '2',
      codigo: 'EST-002',
      nombre: 'María',
      apellido: 'González',
      programaId: 'MED1',
      foto: null,
    },
  },
  {
    id: 3,
    fecha: '2025-04-15',
    monto: 350000,
    type: PaymentType.CHEQUE,
    status: PaymentStatus.RECHAZADO,
    file: null,
    estudiante: {
      id: '3',
      codigo: 'EST-003',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      programaId: 'ADM1',
      foto: null,
    },
  },
  {
    id: 4,
    fecha: '2025-04-20',
    monto: 600000,
    type: PaymentType.TARJETA,
    status: PaymentStatus.PAGADO,
    file: null,
    estudiante: {
      id: '1',
      codigo: 'EST-001',
      nombre: 'Juan',
      apellido: 'Pérez',
      programaId: 'ING1',
      foto: null,
    },
  },
];

// Función para obtener pagos de un estudiante específico
export function getStudentPayments(codigo: string): Payment[] {
  return MOCK_PAYMENTS.filter(payment => payment.estudiante.codigo === codigo);
}
