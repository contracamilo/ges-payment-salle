import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PaymentStatus, PaymentType } from '../../../../domain/models/payment.model';
import { PaymentFilters } from '../../../../domain/models/filters.model';

/**
 * Componente para filtrar la lista de pagos
 */
@customElement('payment-filter')
export class PaymentFilter extends LitElement {
  @state() private estudiante_codigo: string = '';
  @state() private fechaInicio: string = '';
  @state() private fechaFin: string = '';
  @state() private status: PaymentStatus | '' = '';
  @state() private type: PaymentType | '' = '';

  /**
   * Captura los cambios en el campo de código de estudiante
   * @param e Evento de input
   */
  handleEstudianteCodigoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.estudiante_codigo = input.value;
  }

  /**
   * Captura los cambios en el campo de fecha inicio
   * @param e Evento de input
   */
  handleFechaInicioChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.fechaInicio = input.value;
  }

  /**
   * Captura los cambios en el campo de fecha fin
   * @param e Evento de input
   */
  handleFechaFinChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.fechaFin = input.value;
  }

  /**
   * Captura los cambios en el selector de estado
   * @param e Evento de cambio
   */
  handleStatusChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.status = select.value as PaymentStatus | '';
  }

  /**
   * Captura los cambios en el selector de tipo
   * @param e Evento de cambio
   */
  handleTypeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.type = select.value as PaymentType | '';
  }

  /**
   * Aplica los filtros
   */
  applyFilters() {
    const filters: PaymentFilters = {};
    
    if (this.estudiante_codigo.trim()) {
      filters.estudiante_codigo = this.estudiante_codigo.trim();
    }
    
    if (this.fechaInicio) {
      filters.fechaInicio = this.fechaInicio;
    }
    
    if (this.fechaFin) {
      filters.fechaFin = this.fechaFin;
    }
    
    if (this.status) {
      filters.status = this.status;
    }
    
    if (this.type) {
      filters.type = this.type;
    }
    
    this.dispatchEvent(new CustomEvent('filter', {
      detail: filters
    }));
  }

  /**
   * Limpia los filtros
   */
  clearFilters() {
    this.estudiante_codigo = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.status = '';
    this.type = '';
    
    this.dispatchEvent(new CustomEvent('filter', {
      detail: {}
    }));
  }

  override render() {
    return html`
      <div class="filter-form">
        <div class="form-row">
          <div class="form-group">
            <label for="estudiante_codigo">Código de estudiante</label>
            <input
              type="text"
              id="estudiante_codigo"
              placeholder="Buscar por código"
              .value=${this.estudiante_codigo}
              @input=${this.handleEstudianteCodigoChange}
            />
          </div>
          
          <div class="form-group">
            <label for="status">Estado del pago</label>
            <select
              id="status"
              .value=${this.status}
              @change=${this.handleStatusChange}
            >
              <option value="">Todos los estados</option>
              <option value=${PaymentStatus.CREADO}>Creado</option>
              <option value=${PaymentStatus.PENDIENTE}>Pendiente</option>
              <option value=${PaymentStatus.PAGADO}>Pagado</option>
              <option value=${PaymentStatus.RECHAZADO}>Rechazado</option>
              <option value=${PaymentStatus.CANCELADO}>Cancelado</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="type">Tipo de pago</label>
            <select
              id="type"
              .value=${this.type}
              @change=${this.handleTypeChange}
            >
              <option value="">Todos los tipos</option>
              <option value=${PaymentType.EFECTIVO}>Efectivo</option>
              <option value=${PaymentType.TRANSFERENCIA}>Transferencia</option>
              <option value=${PaymentType.CHEQUE}>Cheque</option>
              <option value=${PaymentType.TARJETA}>Tarjeta</option>
              <option value=${PaymentType.OTRO}>Otro</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="fechaInicio">Fecha desde</label>
            <input
              type="date"
              id="fechaInicio"
              .value=${this.fechaInicio}
              @input=${this.handleFechaInicioChange}
            />
          </div>
          
          <div class="form-group">
            <label for="fechaFin">Fecha hasta</label>
            <input
              type="date"
              id="fechaFin"
              .value=${this.fechaFin}
              @input=${this.handleFechaFinChange}
            />
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
      min-width: 250px;
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