import { html } from 'lit';

// Importar los componentes
import '../infrastructure/adapters/ui/components/payment-filter.ts';
import '../infrastructure/adapters/ui/components/base-component.ts';
import { PaymentStatus, PaymentType } from '../domain/models/payment.model';

export default {
  title: 'Components/PaymentFilter',
  component: 'payment-filter',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente de filtrado para la lista de pagos.',
      },
    },
  },
};

// Historia por defecto
export const Default = {
  render: () => html`
    <div
      style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 1000px; margin: 0 auto;"
    >
      <h3>Filtros de Pagos</h3>
      <payment-filter @filter=${e => console.log('Filtros aplicados:', e.detail)}></payment-filter>
    </div>
  `,
};

// Historia con valores preestablecidos
export const WithPresetValues = {
  render: () => {
    // Simulamos que se establecen valores predefinidos después de que el componente se renderiza
    setTimeout(() => {
      const codigoInput = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#estudiante_codigo');
      const statusSelect = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#status');
      const typeSelect = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#type');
      const fechaInicioInput = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#fechaInicio');
      const fechaFinInput = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#fechaFin');

      if (codigoInput) {
        codigoInput.value = 'EST001';
        codigoInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (statusSelect) {
        statusSelect.value = PaymentStatus.PAGADO;
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (typeSelect) {
        typeSelect.value = PaymentType.TRANSFERENCIA;
        typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (fechaInicioInput) {
        fechaInicioInput.value = '2023-01-01';
        fechaInicioInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (fechaFinInput) {
        fechaFinInput.value = '2023-12-31';
        fechaFinInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 300);

    return html`
      <div
        style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 1000px; margin: 0 auto;"
      >
        <h3>Filtros con Valores Preestablecidos</h3>
        <payment-filter
          @filter=${e => console.log('Filtros aplicados:', e.detail)}
        ></payment-filter>
      </div>
    `;
  },
};

// Historia que muestra cómo funciona "limpiar filtros"
export const ClearFilters = {
  render: () => {
    // Simulamos que se establecen valores y luego se limpian
    setTimeout(() => {
      const codigoInput = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#estudiante_codigo');
      const statusSelect = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('#status');
      const clearButton = document
        .querySelector('payment-filter')
        ?.shadowRoot?.querySelector('.btn-outline-secondary');

      if (codigoInput && statusSelect) {
        codigoInput.value = 'EST002';
        codigoInput.dispatchEvent(new Event('input', { bubbles: true }));

        statusSelect.value = PaymentStatus.PENDIENTE;
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Limpiamos después de un tiempo
        setTimeout(() => {
          clearButton?.click();
        }, 1500);
      }
    }, 300);

    return html`
      <div
        style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 1000px; margin: 0 auto;"
      >
        <h3>Demostración de Limpiar Filtros</h3>
        <p>Los filtros se establecerán y luego se limpiarán automáticamente.</p>
        <payment-filter
          @filter=${e => console.log('Filtros aplicados:', e.detail)}
        ></payment-filter>
      </div>
    `;
  },
};
