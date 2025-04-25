import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

/**
 * Componente de encabezado con navegación principal
 */
@customElement('app-header')
export class AppHeader extends LitElement {
  /**
   * Navega a la URL proporcionada
   * @param url URL a navegar
   */
  private navigate(url: string): void {
    Router.go(url);
  }

  /**
   * Comprueba si la ruta actual coincide con la URL proporcionada
   */
  private isActive(url: string): boolean {
    const path = window.location.pathname;
    return path === url || path.startsWith(url + '/');
  }

  override render() {
    return html`
      <header class="app-header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <h1>Sistema de Pagos Educativos</h1>
            </div>
            <nav class="main-nav">
              <ul>
                <li>
                  <a href="/estudiantes" 
                     class="${this.isActive('/estudiantes') ? 'active' : ''}"
                     @click=${(e: Event) => {
                       e.preventDefault();
                       this.navigate('/estudiantes');
                     }}>
                     <span class="icon">👥</span> Estudiantes
                  </a>
                </li>
                <li>
                  <a href="/pagos" 
                     class="${this.isActive('/pagos') ? 'active' : ''}"
                     @click=${(e: Event) => {
                       e.preventDefault();
                       this.navigate('/pagos');
                     }}>
                     <span class="icon">💰</span> Pagos
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    
    .app-header {
      background-color: var(--primary-color);
      color: white;
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-4);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-4) 0;
    }
    
    .logo h1 {
      font-size: var(--font-size-xl);
      margin: 0;
    }
    
    .main-nav ul {
      display: flex;
      list-style: none;
      gap: var(--spacing-6);
      margin: 0;
      padding: 0;
    }
    
    .main-nav a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      font-size: var(--font-size-base);
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--border-radius);
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }
    
    .main-nav a:hover, .main-nav a.active {
      background-color: var(--primary-dark);
      text-decoration: none;
    }
    
    .main-nav a.active {
      font-weight: bold;
    }
    
    .icon {
      font-size: 1.2em;
    }
    
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-4);
      }
      
      .main-nav ul {
        gap: var(--spacing-2);
      }
    }
  `;
} 