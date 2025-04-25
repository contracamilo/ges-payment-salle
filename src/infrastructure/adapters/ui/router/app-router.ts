import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

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
 * Componente de enrutador principal de la aplicación
 */
@customElement('app-router')
export class AppRouter extends LitElement {
  private router?: Router;
  @state() private transitionActive: boolean = false;

  constructor() {
    super();
    console.log('AppRouter constructor');
  }

  override connectedCallback() {
    super.connectedCallback();
    console.log('AppRouter connected');
  }

  override firstUpdated() {
    console.log('AppRouter firstUpdated, inicializando router');
    // Inicializamos el router después de que el componente se haya renderizado
    const outlet = this.shadowRoot!.querySelector('#outlet');
    if (outlet) {
      console.log('Outlet encontrado, configurando rutas');
      this.router = new Router(outlet);

      // Definir las rutas de la aplicación
      this.router.setRoutes([
        { 
          path: '/',
          component: 'students-page',
          action: () => this.setDocumentTitle('Estudiantes')
        },
        { 
          path: '/estudiantes',
          component: 'students-page',
          action: () => this.setDocumentTitle('Estudiantes')
        },
        { 
          path: '/pagos',
          component: 'payments-page',
          action: () => this.setDocumentTitle('Pagos')
        },
        { 
          path: '/estudiantes/:codigo/pagos',
          component: 'student-payments-page',
          action: (context) => this.setDocumentTitle(`Pagos del Estudiante ${context.params.codigo}`)
        },
        { 
          path: '(.*)',
          component: 'not-found-page',
          action: () => this.setDocumentTitle('Página no encontrada')
        }
      ]);

      // Manejar transición de página
      this.handlePageTransitions();

      console.log('Rutas configuradas:', this.router.getRoutes());
    } else {
      console.error('No se encontró el outlet para el router');
    }
  }

  /**
   * Maneja las transiciones entre páginas
   */
  private handlePageTransitions() {
    // Añadimos clase en el inicio de la navegación
    window.addEventListener('vaadin-router-location-changed', () => {
      this.transitionActive = true;
    });
    
    // Quitamos clase después de un tiempo
    window.addEventListener('vaadin-router-location-changed', () => {
      setTimeout(() => {
        this.transitionActive = false;
      }, 100);
    });
  }

  /**
   * Establece el título del documento
   */
  private setDocumentTitle(pageTitle: string) {
    document.title = pageTitle ? `${pageTitle} | Sistema de Gestión de Pagos Educativos` : 'Sistema de Gestión de Pagos Educativos';
  }

  /**
   * Navega a una URL específica
   * @param url URL a la que navegar
   */
  navigate(url: string) {
    console.log('Navegando a:', url);
    Router.go(url);
  }

  override render() {
    console.log('AppRouter rendering');
    return html`
      <div class="router-outlet ${this.transitionActive ? 'transition' : ''}">
        <div id="outlet"></div>
      </div>
    `;
  }

  static override styles = css`
    .router-outlet {
      height: 100%;
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    }
    
    .router-outlet.transition {
      opacity: 0.7;
    }
  `;
}