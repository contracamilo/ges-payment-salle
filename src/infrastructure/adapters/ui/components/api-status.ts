import { BaseComponent } from './base-component';
import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { API_CONFIG } from '../../../../config';

/**
 * Componente que muestra el estado de la conexión a la API
 */
@customElement('api-status')
export class ApiStatus extends BaseComponent {
  @state() private apiConnected: boolean = false;
  @state() private statusMessage: string = 'Verificando conexión...';
  
  private checkInterval?: number;

  /**
   * Cuando el componente se conecta al DOM
   */
  override connectedCallback() {
    super.connectedCallback();
    // Verificamos la conexión cada 30 segundos
    this.checkConnection();
    this.checkInterval = window.setInterval(() => this.checkConnection(), 30000);
  }
  
  /**
   * Cuando el componente se desconecta del DOM
   */
  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
  
  /**
   * Verifica la conexión con la API
   */
  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      this.apiConnected = response.ok;
      
      if (response.ok) {
        this.statusMessage = 'Conectado a la API';
      } else {
        this.statusMessage = 'Error al conectar a la API';
      }
    } catch (error) {
      this.apiConnected = false;
      this.statusMessage = 'No se pudo conectar a la API. Verificar que el servidor esté activo.';
    }
  }
  
  override render() {
    return html`
      <div class="status-bar">
        <div class="status-indicator ${this.apiConnected ? 'status-connected' : 'status-disconnected'}"></div>
        <div class="status-text">${this.statusMessage}</div>
      </div>
    `;
  }
  
  static override styles = css`
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
}

export default ApiStatus; 