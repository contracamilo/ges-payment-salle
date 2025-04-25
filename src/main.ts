// Importamos Bootstrap
import './bootstrap';

// Importamos los componentes principales
import './infrastructure/adapters/ui/components/app-root';
import './infrastructure/adapters/ui/router/app-router';

// Importamos los componentes de la UI
import './infrastructure/adapters/ui/pages/students-page';
import './infrastructure/adapters/ui/pages/payments-page';
import './infrastructure/adapters/ui/pages/student-payments-page';
import './infrastructure/adapters/ui/pages/not-found-page';
import './infrastructure/adapters/ui/components/student-form';
import './infrastructure/adapters/ui/components/student-filter';
import './infrastructure/adapters/ui/components/payment-filter';
import './infrastructure/adapters/ui/components/payment-form';
import './infrastructure/adapters/ui/components/api-status';

// Servicios singleton y configuración global
import { StudentUseCase } from './application/use-cases/student.use-case';
import { PaymentUseCase } from './application/use-cases/payment.use-case';

// Importamos configuración centralizada
import { API_CONFIG, APP_CONFIG } from './config';

// Importamos los repositorios API
import { StudentApiRepository } from './infrastructure/adapters/api/student.api';
import { PaymentApiRepository } from './infrastructure/adapters/api/payment.api';

// Configuración para usar API real
const USE_REAL_API = true;

// Inicializar servicios de inmediato para asegurarse de que estén disponibles
initializeServices();

/**
 * Inicializa los casos de uso como servicios globales
 */
function initializeServices() {
  console.log(`Inicializando servicios con ${USE_REAL_API ? 'API REAL' : 'DATOS MOCK'}...`);
  
  try {
    // Creamos los repositorios
    const studentRepository = new StudentApiRepository();
    const paymentRepository = new PaymentApiRepository();
    
    // Creamos los casos de uso
    const studentUseCase = new StudentUseCase(studentRepository);
    const paymentUseCase = new PaymentUseCase(paymentRepository);
    
    // Los exponemos como servicios globales para que los componentes puedan acceder a ellos
    window.services = {
      studentUseCase,
      paymentUseCase
    };

    console.log(`Servicios inicializados correctamente usando ${USE_REAL_API ? 'API REAL' : 'DATOS MOCK'}`);
    
    // Lanzamos un evento para notificar que los servicios están disponibles
    window.dispatchEvent(new CustomEvent('services-initialized'));
    
    return true;
  } catch (error) {
    console.error('Error al inicializar servicios:', error);
    
    // Intentamos reiniciar los servicios después de un breve retraso
    setTimeout(() => {
      console.log('Intentando reiniciar servicios...');
      initializeServices();
    }, 2000);
    
    return false;
  }
}

// Hacemos que la función sea accesible globalmente
window.initializeServices = initializeServices;

// Inicializamos la aplicación
document.addEventListener('DOMContentLoaded', () => {
  console.log(`Aplicación ${APP_CONFIG.APP_NAME} v${APP_CONFIG.VERSION} inicializada`);
  
  // Verificar que los servicios se hayan inicializado correctamente
  if (!window.services) {
    console.log('Inicializando servicios desde DOMContentLoaded...');
    initializeServices();
  }
  
  // Inicializar elementos de Bootstrap
  if (window.initializeBootstrapElements) {
    window.initializeBootstrapElements();
  }
  
  // Escuchar eventos de renderizado para componentes Lit
  document.addEventListener('component-updated', () => {
    if (window.initializeBootstrapElements) {
      window.initializeBootstrapElements();
    }
  });
  
  // Escuchar eventos de navegación para asegurar que los servicios estén disponibles
  window.addEventListener('vaadin-router-location-changed', () => {
    console.log('Navegación detectada, verificando servicios...');
    if (!window.services) {
      console.log('Servicios no disponibles después de navegación, inicializando...');
      initializeServices();
    }
  });
});

// Añadimos un listener global para interceptar errores y reiniciar servicios si es necesario
window.addEventListener('error', (event) => {
  console.error('Error global detectado:', event.error);
  
  // Si el error es relacionado con servicios no disponibles, intentamos reiniciarlos
  if (event.error && event.error.message && 
      (event.error.message.includes('services') || 
       event.error.message.includes('undefined') || 
       event.error.message.includes('null'))) {
    
    console.log('Posible error de servicios detectado, verificando...');
    if (!window.services) {
      console.log('Servicios no disponibles, reiniciando...');
      initializeServices();
    }
  }
});

// Declaración global para TypeScript
declare global {
  interface Window {
    services: {
      studentUseCase: StudentUseCase;
      paymentUseCase: PaymentUseCase;
    };
    initializeServices: typeof initializeServices;
    bootstrap: any; // Añadimos Bootstrap a window
    initializeBootstrapElements: Function; // Añadimos la función de inicialización
  }
} 