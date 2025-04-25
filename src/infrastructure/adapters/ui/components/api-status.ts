import { API_CONFIG } from '../../../../config';

/**
 * Componente que muestra el estado de la conexión a la API
 */
class ApiStatus extends HTMLElement {
  private statusBar: HTMLDivElement;
  private apiConnected: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Creamos los elementos del componente
    this.statusBar = document.createElement('div');
    this.statusBar.className = 'status-bar';
    
    // Añadimos estilos
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: Arial, sans-serif;
        margin-bottom: 20px;
      }
      
      .status-bar {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background-color: #f0f4f8;
        border-radius: 8px;
        border: 1px solid #d0d7de;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 10px;
      }
      
      .status-connected {
        background-color: #2da44e;
        box-shadow: 0 0 5px #2da44e;
      }
      
      .status-disconnected {
        background-color: #d73a49;
        box-shadow: 0 0 5px #d73a49;
      }
      
      .status-text {
        flex-grow: 1;
        font-size: 14px;
        font-weight: 500;
      }
    `;
    
    // Añadimos los elementos al shadow DOM
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(this.statusBar);
    }
    
    // Verificamos la conexión
    this.checkConnection();
  }
  
  /**
   * Cuando el componente se conecta al DOM
   */
  connectedCallback() {
    // Verificamos la conexión cada 30 segundos
    this.checkConnection();
    setInterval(() => this.checkConnection(), 30000);
  }
  
  /**
   * Verifica la conexión con la API
   */
  async checkConnection() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      this.apiConnected = response.ok;
      
      if (response.ok) {
        this.updateStatus(true, 'Conectado a la API');
      } else {
        this.updateStatus(false, 'Error al conectar a la API');
      }
    } catch (error) {
      this.apiConnected = false;
      this.updateStatus(false, 'No se pudo conectar a la API. Verificar que el servidor esté activo.');
    }
  }
  
  /**
   * Actualiza la UI según el estado de conexión
   */
  updateStatus(connected: boolean, message: string) {
    this.statusBar.innerHTML = '';
    
    const indicator = document.createElement('div');
    indicator.className = `status-indicator ${connected ? 'status-connected' : 'status-disconnected'}`;
    
    const text = document.createElement('div');
    text.className = 'status-text';
    text.textContent = message;
    
    this.statusBar.appendChild(indicator);
    this.statusBar.appendChild(text);
  }
}

// Registramos el componente
customElements.define('api-status', ApiStatus);

export default ApiStatus; 