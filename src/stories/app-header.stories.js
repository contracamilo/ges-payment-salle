import { html } from 'lit';

// Importar el componente
import '../infrastructure/adapters/ui/components/app-header.ts';
import '../infrastructure/adapters/ui/components/base-component.ts';

// Mock del Router global para Storybook
window.Router = window.Router || {
  go: path => console.log(`Navegando a: ${path}`),
  location: {
    getParams: () => ({}),
    pathname: '/',
  },
};

export default {
  title: 'Components/AppHeader',
  component: 'app-header',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Componente de encabezado con navegación principal de la aplicación.',
      },
    },
  },
  argTypes: {},
};

// Historia principal
export const Default = {
  render: () => html` <app-header></app-header> `,
};

// Historia con ruta de estudiantes activa
export const StudentsActive = {
  render: () => {
    // Cambiar la ruta actual para simular estar en la página de estudiantes
    window.Router.location.pathname = '/estudiantes';
    return html` <app-header></app-header> `;
  },
};

// Historia con ruta de pagos activa
export const PaymentsActive = {
  render: () => {
    // Cambiar la ruta actual para simular estar en la página de pagos
    window.Router.location.pathname = '/pagos';
    return html` <app-header></app-header> `;
  },
};
