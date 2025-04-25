/**
 * Configuración global de la aplicación
 */

// Helper function to safely get environment variables
const getEnv = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined' && (window as any).__ENV && (window as any).__ENV[key]) {
    return (window as any).__ENV[key];
  }
  return defaultValue;
};

// API configuration
export const API_CONFIG = {
  BASE_URL: getEnv('API_URL', 'http://localhost:8080'),
  TIMEOUT: 60000, // 60 segundos de timeout para las peticiones
  DEBUG_MODE: true, // Activar logs de depuración para API
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'Sistema de Gestión de Estudiantes',
  VERSION: '1.0.0',
  ENVIRONMENT: getEnv('NODE_ENV', 'development'),
}; 