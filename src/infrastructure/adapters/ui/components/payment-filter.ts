import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { PaymentFilters } from '../../../../domain/models/filters.model';
import { PaymentStatus, PaymentType } from '../../../../domain/models/payment.model';
import { BaseComponent } from './base-component';

/**
 * Componente para filtrar la lista de pagos
 */
@customElement('payment-filter')
export class PaymentFilter extends BaseComponent {
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
      <div class="container-fluid p-0">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control border border-secondary"
                id="estudiante_codigo"
                placeholder="Buscar por código"
                .value=${this.estudiante_codigo}
                @input=${this.handleEstudianteCodigoChange}
              />
              <label for="estudiante_codigo">Código del estudiante</label>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="form-floating mb-3">
              <select
                class="form-select border border-secondary"
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
              <label for="status">Estado del pago</label>
            </div>
          </div>
        </div>
        
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <div class="form-floating mb-3">
              <select
                class="form-select border border-secondary"
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
              <label for="type">Tipo de pago</label>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="form-floating mb-3">
              <input
                type="date"
                class="form-control border border-secondary"
                id="fechaInicio"
                .value=${this.fechaInicio}
                @input=${this.handleFechaInicioChange}
              />
              <label for="fechaInicio">Fecha desde</label>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="form-floating mb-3">
              <input
                type="date"
                class="form-control border border-secondary"
                id="fechaFin"
                .value=${this.fechaFin}
                @input=${this.handleFechaFinChange}
              />
              <label for="fechaFin">Fecha hasta</label>
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

  static override styles = css`
    :host {
      display: block;
    }
  `;
} 