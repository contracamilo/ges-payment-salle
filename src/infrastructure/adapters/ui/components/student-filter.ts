import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StudentFilters } from '../../../../domain/models/filters.model';

/**
 * Componente para filtrar la lista de estudiantes
 */
@customElement('student-filter')
export class StudentFilter extends LitElement {
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
    console.log('StudentFilter - Aplicando filtros:', { codigo: this.codigo, programaId: this.programaId });
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
    console.log('StudentFilter - Limpiando filtros');
    this.codigo = '';
    this.programaId = '';
    
    this.dispatchEvent(new CustomEvent('filter', {
      detail: {}
    }));
  }

  override render() {
    console.log('StudentFilter - Renderizando');
    return html`
      <div class="filter-form">
        <div class="form-row">
          <div class="form-group">
            <label for="codigo">Código</label>
            <input
              type="text"
              id="codigo"
              placeholder="Buscar por código"
              .value=${this.codigo}
              @input=${this.handleCodigoChange}
            />
          </div>
          
          <div class="form-group">
            <label for="programaId">Programa</label>
            <select
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
          </div>
        </div>
        
        <div class="filter-actions">
          <button
            class="button button-outline"
            @click=${this.clearFilters}
          >
            Limpiar
          </button>
          <button
            class="button button-primary"
            @click=${this.applyFilters}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    `;
  }

  static override styles = css`
    .filter-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }
    
    .form-row {
      display: flex;
      gap: var(--spacing-4);
      flex-wrap: wrap;
    }
    
    .form-group {
      flex: 1;
      min-width: 200px;
    }
    
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-2);
    }
    
    @media (max-width: 768px) {
      .form-group {
        flex: 1 0 100%;
      }
    }
  `;
} 