import { html } from 'lit';

// Importar los componentes
import '../infrastructure/adapters/ui/components/payment-form.ts';
import '../infrastructure/adapters/ui/components/base-component.ts';
import { PaymentType, PaymentStatus } from '../domain/models/payment.model';

// Mock de los servicios para Storybook
if (!window.services) {
  window.services = {
    studentUseCase: {
      getStudentsByFilters: async filters => {
        console.log('Searching students with:', filters);
        // Simulamos búsqueda
        if (filters.search && filters.search.includes('EST')) {
          return [
            { id: '1', codigo: 'EST001', nombre: 'María', apellido: 'López', programaId: 'ING1' },
            { id: '2', codigo: 'EST002', nombre: 'Juan', apellido: 'Pérez', programaId: 'ING2' },
          ];
        }
        return [];
      },
      getStudentByCode: async code => {
        console.log('Getting student by code:', code);
        return { id: '1', codigo: code, nombre: 'María', apellido: 'López', programaId: 'ING1' };
      },
    },
    paymentUseCase: {
      createPayment: async data => {
        console.log('Create payment:', data);
        return { id: 'PAY123', ...data };
      },
    },
  };
}

export default {
  title: 'Components/PaymentForm',
  component: 'payment-form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Formulario para crear y gestionar pagos de estudiantes.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
  },
};

// Historia por defecto - formulario abierto
export const Default = {
  args: {
    isOpen: true,
  },
  render: args => html`
    <div style="height: 800px; position: relative; background-color: #f5f5f5; padding: 20px;">
      <payment-form
        .isOpen=${args.isOpen}
        .onClose=${() => console.log('Modal closed')}
        .onSuccess=${() => console.log('Payment created')}
      ></payment-form>
    </div>
  `,
};

// Historia con estudiante preseleccionado
export const WithPreselectedStudent = {
  args: {
    isOpen: true,
  },
  render: args => {
    // Simulamos que se establece un estudiante predefinido después de que el componente se renderiza
    setTimeout(() => {
      const paymentForm = document.querySelector('payment-form');
      if (paymentForm) {
        const student = {
          id: '1',
          codigo: 'EST001',
          nombre: 'María',
          apellido: 'López',
          programaId: 'ING1',
        };
        paymentForm.selectStudent?.(student);
      }
    }, 500);

    return html`
      <div style="height: 800px; position: relative; background-color: #f5f5f5; padding: 20px;">
        <payment-form
          .isOpen=${args.isOpen}
          .onClose=${() => console.log('Modal closed')}
          .onSuccess=${() => console.log('Payment created')}
        ></payment-form>
      </div>
    `;
  },
};

// Historia con valores precompletados
export const WithPrefilledValues = {
  args: {
    isOpen: true,
  },
  render: args => {
    // Simulamos que se establecen valores predefinidos en el formulario
    setTimeout(() => {
      const paymentForm = document.querySelector('payment-form');
      if (paymentForm) {
        const montoInput = paymentForm.shadowRoot?.querySelector('input[name="monto"]');
        const typeSelect = paymentForm.shadowRoot?.querySelector('select[name="type"]');
        const statusSelect = paymentForm.shadowRoot?.querySelector('select[name="status"]');

        if (montoInput) {
          montoInput.value = '1500';
          montoInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (typeSelect) {
          typeSelect.value = PaymentType.TARJETA;
          typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (statusSelect) {
          statusSelect.value = PaymentStatus.PAGADO;
          statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }, 500);

    return html`
      <div style="height: 800px; position: relative; background-color: #f5f5f5; padding: 20px;">
        <payment-form
          .isOpen=${args.isOpen}
          .onClose=${() => console.log('Modal closed')}
          .onSuccess=${() => console.log('Payment created')}
        ></payment-form>
      </div>
    `;
  },
};
