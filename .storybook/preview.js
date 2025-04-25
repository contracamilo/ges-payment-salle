import 'bootstrap/dist/css/bootstrap.min.css';
// Importar estilos personalizados
import '../public/storybook.css';

// Mocks para los objetos globales necesarios
if (typeof window !== 'undefined') {
  // Mock para Router
  window.Router = window.Router || {
    go: (path) => console.log(`Router navigation to: ${path}`),
    location: {
      getParams: () => ({}),
      pathname: '/'
    }
  };

  // Mock para los servicios
  window.services = window.services || {
    studentUseCase: {
      getAllStudents: async () => [],
      getStudentByCode: async () => null,
      getStudentsByFilters: async () => [],
      createStudent: async (data) => ({ id: '1', ...data }),
      updateStudent: async (code, data) => ({ id: '1', codigo: code, ...data }),
      deleteStudent: async () => {}
    },
    paymentUseCase: {
      getAllPayments: async () => [],
      getPaymentById: async () => null,
      createPayment: async () => ({})
    }
  };
}

/** @type { import('@storybook/web-components').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8f9fa' },
        { name: 'dark', value: '#343a40' }
      ]
    }
  },
};

export default preview; 