import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { BaseComponent } from '../components/base-component';

/**
 * Interfaz para definir rutas
 */
export interface Route {
  /** Patrón de la ruta */
  pattern: string;
  /** Componente a renderizar */
  component: string;
  /** Título de la página */
  title: string;
}

/**
 * Definiciones de rutas de la aplicación
 */
const routes = [
  { path: '/', redirect: '/estudiantes' },
  { path: '/estudiantes', component: 'students-page' },
  { path: '/pagos', component: 'payments-page' },
  { path: '/estudiantes/:codigo/pagos', component: 'student-payments-page' },
  { path: '(.*)', component: 'not-found-page' }
];

/**
 * Componente enrutador principal de la aplicación
 */
@customElement('app-router')
export class AppRouter extends BaseComponent {
  /**
   * Router de Vaadin
   */
  private router?: any;

  override connectedCallback() {
    super.connectedCallback();
    console.log('AppRouter connected');
  }

  override firstUpdated() {
    console.log('AppRouter firstUpdated');
    
    // Buscamos el outlet después del primer render
    setTimeout(() => {
      const outlet = this.querySelector('#outlet');
      console.log('Outlet element:', outlet);
      
      if (outlet) {
        console.log('Router outlet encontrado, inicializando router');
        this.router = new Router(outlet);
        this.router.setRoutes(routes);
      } else {
        console.error('Router outlet not found');
      }
    }, 0);
  }

  override render() {
    console.log('AppRouter rendering');
    return html`
      <div id="outlet" style="width: 100%; min-height: 100%;"></div>
    `;
  }
}