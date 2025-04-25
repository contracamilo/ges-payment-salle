import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StudentFilters } from '../../../../domain/models/filters.model';
import { BaseComponent } from './base-component';

/**
 * Componente para filtrar la lista de estudiantes
 */
@customElement('student-filter')
export class StudentFilter extends BaseComponent {
  @state() private codigo: string = '';
  @state() private programaId: string = '';

  /**
   * Captura los cambios en el campo de código
   * @param e Evento de input
   */
  handleCodigoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.codigo = input.value;
  }

  /**
   * Captura los cambios en el selector de programa
   * @param e Evento de cambio
   */
  handleProgramaChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.programaId = select.value;
  }

  /**
   * Aplica los filtros
   */
  applyFilters() {
    const filters: StudentFilters = {};
    
    if (this.codigo.trim()) {
      filters.codigo = this.codigo.trim();
    }
    
    if (this.programaId) {
      filters.programaId = this.programaId;
    }
    
    this.dispatchEvent(new CustomEvent('filter', {
      detail: filters
    }));
  }

  /**
   * Limpia los filtros
   */
  clearFilters() {
    this.codigo = '';
    this.programaId = '';
    
    this.dispatchEvent(new CustomEvent('filter', {
      detail: {}
    }));
  }

  override render() {
    return html`
      <div class="container-fluid p-0">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control border border-secondary"
                id="codigo"
                placeholder="Buscar por código"
                .value=${this.codigo}
                @input=${this.handleCodigoChange}
              />
              <label for="codigo">Código del estudiante</label>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <select
                class="form-select border border-secondary"
                id="programaId"
                .value=${this.programaId}
                @change=${this.handleProgramaChange}
              >
                <option value="">Todos los programas</option>
                <option value="ING1">Ingeniería de Software</option>
                <option value="MED1">Medicina</option>
                <option value="ADM1">Administración de Empresas</option>
                <option value="LTA1">Licenciatura en Tecnología</option>
              </select>
              <label for="programaId">Programa académico</label>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-end gap-2">
          <button
            class="btn btn-outline-secondary shadow-sm"
            @click=${this.clearFilters}
          >
            <i class="fas fa-eraser me-1"></i> Limpiar
          </button>
          <button
            class="btn btn-primary shadow-sm"
            @click=${this.applyFilters}
          >
            <i class="fas fa-filter me-1"></i> Aplicar Filtros
          </button>
        </div>
      </div>
    `;
  }

  // Utilizamos shadow parts para garantizar que los estilos de Bootstrap se apliquen correctamente
  static override styles = css`
    :host {
      display: block;
    }
    
    /* Garantizar que los estilos de Bootstrap se apliquen */
    .form-control, .form-select, .btn {
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.5;
      transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
    
    .form-control, .form-select {
      display: block;
      width: 100%;
      padding: .375rem .75rem;
      border-radius: .25rem;
    }
    
    .btn {
      display: inline-block;
      font-weight: 400;
      text-align: center;
      vertical-align: middle;
      user-select: none;
      border: 1px solid transparent;
      padding: .375rem .75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: .25rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    }
  `;
} 