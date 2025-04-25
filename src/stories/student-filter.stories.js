import { html } from 'lit';

// Importar los componentes
import '../infrastructure/adapters/ui/components/student-filter.ts';
import '../infrastructure/adapters/ui/components/base-component.ts';

export default {
  title: 'Components/StudentFilter',
  component: 'student-filter',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente de filtrado para la lista de estudiantes.',
      },
    },
  },
};

// Historia por defecto
export const Default = {
  render: () => html`
    <div
      style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 800px; margin: 0 auto;"
    >
      <h3>Filtros de Estudiantes</h3>
      <student-filter @filter=${e => console.log('Filtros aplicados:', e.detail)}></student-filter>
    </div>
  `,
};

// Historia con valores preestablecidos
export const WithPresetValues = {
  render: () => {
    // Simulamos que se establecen valores predefinidos después de que el componente se renderiza
    setTimeout(() => {
      const codigoInput = document
        .querySelector('student-filter')
        ?.shadowRoot?.querySelector('#codigo');
      const programaSelect = document
        .querySelector('student-filter')
        ?.shadowRoot?.querySelector('#programaId');

      if (codigoInput) {
        codigoInput.value = 'EST001';
        codigoInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (programaSelect) {
        programaSelect.value = 'ING1';
        programaSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 300);

    return html`
      <div
        style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 800px; margin: 0 auto;"
      >
        <h3>Filtros con Valores Preestablecidos</h3>
        <student-filter
          @filter=${e => console.log('Filtros aplicados:', e.detail)}
        ></student-filter>
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
        .querySelector('student-filter')
        ?.shadowRoot?.querySelector('#codigo');
      const programaSelect = document
        .querySelector('student-filter')
        ?.shadowRoot?.querySelector('#programaId');
      const clearButton = document
        .querySelector('student-filter')
        ?.shadowRoot?.querySelector('.btn-outline-secondary');

      if (codigoInput && programaSelect) {
        codigoInput.value = 'EST002';
        codigoInput.dispatchEvent(new Event('input', { bubbles: true }));

        programaSelect.value = 'MED1';
        programaSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Limpiamos después de un tiempo
        setTimeout(() => {
          clearButton?.click();
        }, 1500);
      }
    }, 300);

    return html`
      <div
        style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 800px; margin: 0 auto;"
      >
        <h3>Demostración de Limpiar Filtros</h3>
        <p>Los filtros se establecerán y luego se limpiarán automáticamente.</p>
        <student-filter
          @filter=${e => console.log('Filtros aplicados:', e.detail)}
        ></student-filter>
      </div>
    `;
  },
};
