import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Router } from '@vaadin/router';
import { BaseComponent } from './base-component';

/**
 * Componente de encabezado con navegación principal
 */
@customElement('app-header')
export class AppHeader extends BaseComponent {
  @state() private showUserMenu: boolean = false;

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

  /**
   * Alterna el menú de usuario
   */
  private toggleUserMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Cierra el menú de usuario cuando se hace clic fuera de él
   */
  private closeUserMenu = () => {
    if (this.showUserMenu) {
      this.showUserMenu = false;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.closeUserMenu);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.closeUserMenu);
  }

  override render() {
    return html`
      <header class="p-3 bg-dark text-white shadow-none">
        <div class="container">
          <div class="d-flex flex-wrap align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <a href="/" 
                 class="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none"
                 @click=${(e: Event) => {
                   e.preventDefault();
                   this.navigate('/');
                 }}>
                <i class="fas fa-graduation-cap fs-3 me-2"></i>
                <span class="fs-4">Sistema de Pagos Educativos</span>
              </a>
            </div>

            <ul class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 mx-auto">
              <li>
                <a class="nav-link px-3 ${this.isActive('/estudiantes') ? 'text-secondary' : 'text-white'}" 
                   href="/estudiantes"
                   @click=${(e: Event) => {
                     e.preventDefault();
                     this.navigate('/estudiantes');
                   }}>
                   <i class="fas fa-users me-1"></i> Estudiantes
                </a>
              </li>
              <li>
                <a class="nav-link px-3 ${this.isActive('/pagos') ? 'text-secondary' : 'text-white'}"
                   href="/pagos" 
                   @click=${(e: Event) => {
                     e.preventDefault();
                     this.navigate('/pagos');
                   }}>
                   <i class="fas fa-money-bill-wave me-1"></i> Pagos
                </a>
              </li>
            </ul>

            <div class="text-end d-flex align-items-center">
              <form class="me-2 d-none d-md-block">
                <input type="search" class="form-control form-control-dark" placeholder="Buscar..." aria-label="Search" style="background-color: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.1); color: white;">
              </form>
              
              <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                   @click=${this.toggleUserMenu}>
                  <img src="https://github.com/mdo.png" alt="Usuario" width="32" height="32" class="rounded-circle me-2">
                  <span>Admin</span>
                </a>
                
                ${this.showUserMenu ? html`
                  <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end text-small shadow show" 
                      style="position: absolute; inset: 0px 0px auto auto; margin: 0px; transform: translate(0px, 40px);">
                    <li><a class="dropdown-item" href="#"><i class="fas fa-project-diagram me-2"></i>Nuevo proyecto</a></li>
                    <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Configuración</a></li>
                    <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#"><i class="fas fa-sign-out-alt me-2"></i>Cerrar sesión</a></li>
                  </ul>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    
    .form-control-dark {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .form-control-dark:focus {
      border-color: transparent;
      box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
    }
    
    .dropdown-menu.show {
      display: block;
    }
    
    .nav-link {
      color: rgba(255, 255, 255, 0.55);
      transition: color 0.15s ease-in-out;
    }
    
    .nav-link:hover {
      color: rgba(255, 255, 255, 0.75);
    }
    
    .nav-link.text-secondary {
      color: #6c757d;
      font-weight: bold;
    }
  `;
} 