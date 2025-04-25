import { API_CONFIG } from '../../../config';

/**
 * Configuración base para las llamadas a la API
 */
export const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Opciones por defecto para las peticiones fetch
 */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'same-origin',
  mode: 'cors'
  // No añadimos el signal de timeout aquí para poder manejarlo en fetchApi
};

/**
 * Error personalizado para respuestas HTTP
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Traduce códigos de error HTTP a mensajes amigables
 */
function getErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'La solicitud no es válida';
    case 401: return 'No está autorizado para realizar esta acción';
    case 403: return 'No tiene permisos para acceder a este recurso';
    case 404: return 'El recurso solicitado no fue encontrado';
    case 408: return 'Tiempo de espera agotado, intente nuevamente';
    case 429: return 'Demasiadas solicitudes, intente más tarde';
    case 500: return 'Error interno del servidor';
    case 502: return 'Servicio no disponible temporalmente';
    case 503: return 'Servicio no disponible';
    case 504: return 'Tiempo de espera del servidor agotado';
    default: return `Error de servidor (${status})`;
  }
}

/**
 * Log para depuración de llamadas API
 */
function logApiCall(method: string, url: string, data?: any, error?: any) {
  if (API_CONFIG.DEBUG_MODE) {
    console.group(`API Call: ${method} ${url}`);
    if (data) {
      console.log('Data:', data);
    }
    if (error) {
      console.error('Error:', error);
    }
    console.groupEnd();
  }
}

/**
 * Realiza una petición HTTP y maneja errores comunes
 * 
 * @param url URL del endpoint a llamar
 * @param options Opciones de fetch
 * @returns Promise con la respuesta procesada
 */
export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Crear un controlador de aborto con el tiempo de espera configurado
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  // Registramos la URL que estamos llamando
  const method = options.method || 'GET';
  logApiCall(method, url, options.body);
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...DEFAULT_FETCH_OPTIONS,
      ...options,
      signal: controller.signal
    });

    // Limpiamos el timeout ya que la petición ha terminado
    clearTimeout(timeoutId);
    
    // Si la respuesta no es exitosa, lanzamos un error
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: getErrorMessage(response.status) };
      }
      
      const error = new ApiError(
        errorData.message || getErrorMessage(response.status),
        response.status,
        errorData
      );
      
      logApiCall(method, url, options.body, error);
      throw error;
    }

    // Si el endpoint no devuelve datos, retornamos un objeto vacío
    if (response.status === 204) {
      return {} as T;
    }

    // Procesamos la respuesta como JSON
    const data = await response.json();
    logApiCall(method, url, data);
    return data;
    
  } catch (error: any) {
    // Limpiamos el timeout en caso de error
    clearTimeout(timeoutId);
    
    // Si es un error de tiempo de espera o de red
    if (error.name === 'AbortError') {
      const apiError = new ApiError('Tiempo de espera agotado al conectar con el servidor', 408);
      logApiCall(method, url, options.body, apiError);
      throw apiError;
    } 
    
    // Si es un error de conexión
    if (error.message && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed'))) {
      const apiError = new ApiError(
        'No se pudo conectar al servidor. Verifique su conexión a internet o que el servidor esté disponible', 
        0
      );
      logApiCall(method, url, options.body, apiError);
      throw apiError;
    }
    
    // Si ya es un ApiError, lo propagamos
    if (error instanceof ApiError) {
      logApiCall(method, url, options.body, error);
      throw error;
    }
    
    // Otros errores
    const apiError = new ApiError(
      error.message || 'Error desconocido al conectar con el API',
      0
    );
    logApiCall(method, url, options.body, apiError);
    throw apiError;
  }
} 