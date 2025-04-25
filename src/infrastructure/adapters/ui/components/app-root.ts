import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseComponent } from './base-component';

// Importamos otros componentes
import '../components/app-header';
import '../router/app-router';

/**
 * Componente raíz de la aplicación que define la estructura general
 * Este componente es el punto de entrada principal para el enrutamiento
 * y la disposición de componentes de la aplicación
 */
@customElement('app-root')
export class AppRoot extends BaseComponent {
  constructor() {
    super();
    console.log('AppRoot constructor');
  }

  override connectedCallback() {
    super.connectedCallback();
    console.log('AppRoot connected');
  }

  override firstUpdated() {
    console.log('AppRoot firstUpdated');
  }

  override render() {
    console.log('AppRoot rendering');
    return html`
      <div class="app-container">
        <app-header></app-header>
        <main class="main-content">
          <div class="container">
            <app-router></app-router>
          </div>
        </main>
        <footer class="app-footer">
          <div class="container">
            <p>© ${new Date().getFullYear()} Sistema de Gestión de Pagos Educativos</p>
          </div>
        </footer>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
      padding: 20px 0;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-4);
    }
    
    .app-footer {
      background-color: var(--gray-800);
      color: var(--gray-200);
      padding: var(--spacing-4) 0;
      text-align: center;
      font-size: var(--font-size-sm);
    }
  `;
} 