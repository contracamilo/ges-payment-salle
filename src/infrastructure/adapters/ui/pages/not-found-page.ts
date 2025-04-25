import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { BaseComponent } from '../../ui/components/base-component';

/**
 * Página para rutas no encontradas (404)
 */
@customElement('not-found-page')
export class NotFoundPage extends BaseComponent {
  /**
   * Navega a la página principal
   */
  navigateToHome() {
    Router.go('/');
  }

  render() {
    return html`
      <div class="not-found-container">
        <h1>404 - Página no encontrada</h1>
        <p>Lo sentimos, la página que estás buscando no existe.</p>
        <button class="button button-primary" @click=${this.navigateToHome}>
          Volver al Inicio
        </button>
      </div>
    `;
  }

  static styles = css`
    .not-found-container {
      text-align: center;
      padding: var(--spacing-12);
    }
    
    h1 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-6);
    }
    
    p {
      margin-bottom: var(--spacing-6);
      color: var(--gray-600);
    }
  `;
} 