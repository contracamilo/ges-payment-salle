// Extensión para la interfaz Window para incluir nuestros servicios globales
interface Window {
  services: {
    studentUseCase: import('./application/use-cases/student.use-case').StudentUseCase;
    paymentUseCase: import('./application/use-cases/payment.use-case').PaymentUseCase;
  };
}

// Declaración de módulos para paquetes que no tienen declaraciones de tipos
declare module '@vaadin/router';
declare module '@lit-labs/task'; 