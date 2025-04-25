import { html } from 'lit';

// Importar los componentes
import '../infrastructure/adapters/ui/components/student-list.ts';
import '../infrastructure/adapters/ui/components/student-filter.ts';
import '../infrastructure/adapters/ui/components/base-component.ts';

// Mock de los servicios para Storybook
if (!window.services) {
  window.services = {
    studentUseCase: {
      getAllStudents: async () => [
        { id: '1', codigo: 'EST001', nombre: 'María', apellido: 'López', programaId: 'ING1' },
        { id: '2', codigo: 'EST002', nombre: 'Juan', apellido: 'Pérez', programaId: 'ING2' },
        { id: '3', codigo: 'EST003', nombre: 'Carlos', apellido: 'García', programaId: 'ING1' },
      ],
      getStudentsByFilters: async filters => {
        console.log('Filtering with:', filters);
        // Simulamos filtrado
        return [
          { id: '2', codigo: 'EST002', nombre: 'Juan', apellido: 'Pérez', programaId: 'ING2' },
        ];
      },
      deleteStudent: async code => {
        console.log('Delete student:', code);
        return true;
      },
    },
  };
}

// Mock del Router global para Storybook
window.Router = window.Router || {
  go: path => console.log(`Navegando a: ${path}`),
};

export default {
  title: 'Components/StudentList',
  component: 'student-list',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Lista de estudiantes con acciones de gestión y filtros.',
      },
    },
  },
};

// Historia principal con todos los estudiantes
export const Default = {
  render: () => html`
    <div style="padding: 20px;">
      <student-list
        @edit-student=${e => console.log('Edit student:', e.detail)}
        @create-student=${() => console.log('Create student requested')}
        @notification=${e => console.log('Notification:', e.detail)}
      ></student-list>
    </div>
  `,
};

// Historia con filtros aplicados
export const WithFilters = {
  render: () => {
    // Simulamos que los filtros se aplicaron
    setTimeout(() => {
      const filterEvent = new CustomEvent('filter', {
        detail: { programa: 'ING2' },
      });
      document.querySelector('student-list')?.dispatchEvent(filterEvent);
    }, 500);

    return html`
      <div style="padding: 20px;">
        <student-list
          @edit-student=${e => console.log('Edit student:', e.detail)}
          @create-student=${() => console.log('Create student requested')}
          @notification=${e => console.log('Notification:', e.detail)}
        ></student-list>
      </div>
    `;
  },
};

// Historia con lista vacía
export const EmptyList = {
  render: () => {
    // Reemplazamos temporalmente el método para simular lista vacía
    const originalMethod = window.services.studentUseCase.getAllStudents;
    window.services.studentUseCase.getAllStudents = async () => [];

    // Limpiamos después
    setTimeout(() => {
      window.services.studentUseCase.getAllStudents = originalMethod;
    }, 1000);

    return html`
      <div style="padding: 20px;">
        <student-list></student-list>
      </div>
    `;
  },
};
