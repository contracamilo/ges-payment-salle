import { APP_CONFIG } from '../../../config';

/**
 * Mock para el endpoint de health check
 * 
 * Este archivo simula la respuesta que daría un endpoint /health
 * en el servidor de API. Se usa para desarrollo y pruebas.
 */

// Mock para el endpoint /health
const mockHealthResponse = {
  status: 'UP',
  version: APP_CONFIG.VERSION,
  timestamp: new Date().toISOString(),
  services: {
    database: {
      status: 'UP',
      responseTime: 25
    },
    cache: {
      status: 'UP',
      responseTime: 5
    }
  }
};

/**
 * Función que intercepta las llamadas al endpoint /health 
 * y devuelve una respuesta simulada
 */
export function setupMockHealthEndpoint() {
  // Siempre interceptamos en desarrollo o cuando no hay servidor
  const originalFetch = window.fetch;
  
  // Sobreescribimos fetch para interceptar llamadas al health check
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    // Si es una llamada al endpoint health, devolvemos nuestra respuesta mock
    if (url.includes('/health')) {
      console.log('[Mock] Interceptada llamada a /health');
      
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockHealthResponse),
        text: () => Promise.resolve(JSON.stringify(mockHealthResponse)),
        headers: new Headers({ 'Content-Type': 'application/json' })
      } as Response);
    }
    
    // Para cualquier otra llamada, utilizamos el fetch original
    return originalFetch(input, init);
  };
  
  console.log('[Mock] Health endpoint configurado');
} 