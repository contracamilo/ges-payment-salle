import { html } from 'lit';

// Importar los componentes
import '../infrastructure/adapters/ui/components/student-form.ts';
import '../infrastructure/adapters/ui/components/base-component.ts';

// Mock de los servicios para Storybook
if (!window.services) {
  window.services = {
    studentUseCase: {
      getAllStudents: async () => [],
      getStudentByCode: async code => {
        // Si es modo edición, retornar un estudiante de ejemplo
        if (code) {
          return {
            id: '1',
            codigo: code,
            nombre: 'María',
            apellido: 'López',
            programaId: 'ING1',
            foto: null,
          };
        }
        return null;
      },
      createStudent: async data => {
        console.log('Create student:', data);
        return { id: '2', ...data };
      },
      updateStudent: async (code, data) => {
        console.log('Update student:', code, data);
        return { id: '1', codigo: code, ...data };
      },
    },
  };
}

export default {
  title: 'Components/StudentForm',
  component: 'student-form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Formulario para crear y editar estudiantes.',
      },
    },
  },
  argTypes: {
    studentCode: { control: 'text' },
  },
};

// Historia para crear un nuevo estudiante
export const CreateMode = {
  name: 'Crear Estudiante',
  args: {
    studentCode: null,
  },
  render: args => html`
    <div
      style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;"
    >
      <h2>Crear Nuevo Estudiante</h2>
      <student-form
        .studentCode=${args.studentCode}
        @submit-success=${e => console.log('Success:', e.detail)}
        @submit-error=${e => console.log('Error:', e.detail)}
        @cancel=${() => console.log('Cancelled')}
      ></student-form>
    </div>
  `,
};

// Historia para editar un estudiante existente
export const EditMode = {
  name: 'Editar Estudiante',
  args: {
    studentCode: 'EST001',
  },
  render: args => html`
    <div
      style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;"
    >
      <h2>Editar Estudiante</h2>
      <student-form
        .studentCode=${args.studentCode}
        @submit-success=${e => console.log('Success:', e.detail)}
        @submit-error=${e => console.log('Error:', e.detail)}
        @cancel=${() => console.log('Cancelled')}
      ></student-form>
    </div>
  `,
};
