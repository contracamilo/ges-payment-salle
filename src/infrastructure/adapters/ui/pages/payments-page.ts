import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Task } from '@lit-labs/task';
import { Payment, PaymentStatus, PaymentType } from '../../../../domain/models/payment.model';
import { PaymentFilters } from '../../../../domain/models/filters.model';
import { BaseComponent } from '../../ui/components/base-component';

/**
 * Página principal de pagos
 */
@customElement('payments-page')
export class PaymentsPage extends BaseComponent {
  @state() private filters: PaymentFilters = {};
  @state() private selectedPayment: Payment | null = null;
  @state() private isDetailModalOpen: boolean = false;
  @state() private notification: { message: string; type: string } | null = null;

  /**
   * Task para cargar los pagos
   */
  private loadPaymentsTask = new Task(
    this,
    async () => {
      try {
        const paymentUseCase = window.services.paymentUseCase;
        let result;
        
        if (Object.keys(this.filters).length > 0) {
          result = await paymentUseCase.getPaymentsByFilters(this.filters);
        } else {
          result = await paymentUseCase.getAllPayments();
        }
        
        return result;
      } catch (error) {
        console.error('Error al cargar pagos:', error);
        throw error;
      }
    },
    () => [this.filters]
  );

  /**
   * Espera a que los servicios estén disponibles
   */
  private async waitForServices(maxAttempts = 10): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkServices = () => {
        attempts++;
        if (window.services && window.services.paymentUseCase) {
          console.log('Servicios disponibles, procediendo a cargar pagos');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Tiempo de espera agotado: servicios no disponibles'));
        } else {
          console.log(`Esperando servicios... intento ${attempts}`);
          setTimeout(checkServices, 300);
        }
      };
      
      checkServices();
    });
  }

  /**
   * Handler para el evento de filtrado
   */
  handleFilter(event: CustomEvent) {
    this.filters = event.detail;
  }

  /**
   * Abre el modal de detalles del pago
   */
  showPaymentDetail(payment: Payment) {
    this.selectedPayment = payment;
    this.isDetailModalOpen = true;
  }

  /**
   * Cierra el modal de detalles
   */
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedPayment = null;
  }

  /**
   * Muestra una notificación
   */
  showNotification(event: CustomEvent) {
    this.notification = {
      message: event.detail.message,
      type: event.detail.type
    };
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  /**
   * Actualiza el estado de un pago
   */
  async updatePaymentStatus(paymentId: number, status: PaymentStatus) {
    try {
      await window.services.paymentUseCase.updatePaymentStatus(paymentId, { status });
      
      // Recargar los pagos
      this.filters = { ...this.filters };
      
      // Cerrar el modal si está abierto
      if (this.isDetailModalOpen) {
        this.closeDetailModal();
      }
      
      // Mostrar notificación
      this.showNotification(new CustomEvent('notification', {
        detail: {
          message: 'Estado de pago actualizado correctamente',
          type: 'success'
        }
      }));
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      this.showNotification(new CustomEvent('notification', {
        detail: {
          message: 'Error al actualizar estado de pago',
          type: 'error'
        }
      }));
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    
    // Cargamos todos los pagos al inicio
    this.filters = {};
    
    // Verificamos si los servicios ya están disponibles
    if (window.services && window.services.paymentUseCase) {
      this.loadPaymentsTask.run();
    }
    
    // Escuchamos el evento de servicios inicializados
    window.addEventListener('services-initialized', () => {
      this.loadPaymentsTask.run();
    });
  }

  override render() {
    return html`
      <div class="payments-page">
        <div class="container">
          <div class="row mb-4 align-items-center">
            <div class="col-md-6">
              <h1 class="display-5 fw-bold mb-0">
                <i class="fas fa-money-bill-wave text-primary me-2"></i>
                Gestión de Pagos
              </h1>
            </div>
            <div class="col-md-6 text-md-end mt-3 mt-md-0">
              <!-- Aquí se pueden añadir botones de acción principal -->
            </div>
          </div>
          
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="fas fa-filter me-2"></i>
                Filtros de Búsqueda
              </h5>
            </div>
            <div class="card-body">
              <payment-filter @filter=${this.handleFilter}></payment-filter>
            </div>
          </div>
          
          <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="fas fa-list me-2"></i>
                Lista de Pagos
              </h5>
              <span class="badge bg-primary rounded-pill">
                ${this.loadPaymentsTask.render({
                  pending: () => html`...`,
                  complete: (payments) => html`${payments.length}`,
                  error: () => html`0`
                })}
              </span>
            </div>
            <div class="card-body">
              ${this.renderPaymentsTable()}
            </div>
          </div>
        </div>
        
        ${this.isDetailModalOpen ? this.renderDetailModal() : ''}
        ${this.notification ? this.renderNotification() : ''}
      </div>
    `;
  }

  /**
   * Renderiza la tabla de pagos
   */
  private renderPaymentsTable() {
    return html`
      ${this.loadPaymentsTask.render({
        pending: () => html`
          <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
        `,
        complete: (payments) => {
          if (payments.length === 0) {
            return html`
              <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="lead">No se encontraron pagos</p>
                <p class="text-muted">Intenta cambiar los filtros de búsqueda</p>
              </div>
            `;
          }
          
          return html`
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estudiante</th>
                    <th scope="col">Monto</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Estado</th>
                    <th scope="col" class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(payment => html`
                    <tr>
                      <td>${payment.id}</td>
                      <td>${new Date(payment.fecha).toLocaleDateString()}</td>
                      <td>${payment.estudiante.nombre} ${payment.estudiante.apellido}</td>
                      <td>$${payment.monto.toFixed(2)}</td>
                      <td>${this.renderPaymentType(payment.type)}</td>
                      <td>${this.renderPaymentStatus(payment.status)}</td>
                      <td>
                        <div class="d-flex justify-content-end gap-2">
                          <button
                            class="btn btn-sm btn-outline-primary"
                            @click=${() => this.showPaymentDetail(payment)}
                            title="Ver detalles"
                          >
                            <i class="fas fa-eye"></i>
                          </button>
                          ${payment.status === PaymentStatus.PENDIENTE ? html`
                            <button
                              class="btn btn-sm btn-outline-success"
                              @click=${() => this.updatePaymentStatus(payment.id, PaymentStatus.PAGADO)}
                              title="Aprobar pago"
                            >
                              <i class="fas fa-check"></i>
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `;
        },
        error: (error) => html`
          <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            Error al cargar los pagos: ${error.message}
          </div>
        `
      })}
    `;
  }

  /**
   * Renderiza el modal de detalles del pago
   */
  private renderDetailModal() {
    if (!this.selectedPayment) return html``;
    
    return html`
      <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="fas fa-info-circle me-2"></i>
                Detalles del Pago
              </h5>
              <button type="button" class="btn-close btn-close-white" @click=${this.closeDetailModal}></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">ID del Pago</p>
                  <p class="fw-bold">${this.selectedPayment.id}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Fecha</p>
                  <p class="fw-bold">${new Date(this.selectedPayment.fecha).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Estudiante</p>
                  <p class="fw-bold">${this.selectedPayment.estudiante.nombre} ${this.selectedPayment.estudiante.apellido}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Código</p>
                  <p class="fw-bold">${this.selectedPayment.estudiante.codigo}</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Monto</p>
                  <p class="fw-bold">$${this.selectedPayment.monto.toFixed(2)}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Tipo</p>
                  <p class="fw-bold">${this.renderPaymentType(this.selectedPayment.type)}</p>
                </div>
              </div>
              
              <div class="row">
                <div class="col-12">
                  <p class="mb-1 text-muted">Estado</p>
                  <p class="fw-bold">${this.renderPaymentStatus(this.selectedPayment.status)}</p>
                </div>
              </div>
              
              ${this.selectedPayment.file ? html`
                <div class="row mt-3">
                  <div class="col-12">
                    <p class="mb-1 text-muted">Comprobante</p>
                    <a href="${this.selectedPayment.file}" target="_blank" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-file-alt me-1"></i> Ver comprobante
                    </a>
                  </div>
                </div>
              ` : ''}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click=${this.closeDetailModal}>
                <i class="fas fa-times me-1"></i> Cerrar
              </button>
              ${this.selectedPayment.status === PaymentStatus.PENDIENTE ? html`
                <button type="button" class="btn btn-success" @click=${() => this.updatePaymentStatus(this.selectedPayment!.id, PaymentStatus.PAGADO)}>
                  <i class="fas fa-check me-1"></i> Aprobar Pago
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza la notificación
   */
  private renderNotification() {
    if (!this.notification) return html``;
    
    const typeClass = this.notification.type === 'success' ? 'alert-success' : 
                      this.notification.type === 'error' ? 'alert-danger' : 
                      'alert-warning';
    
    const icon = this.notification.type === 'success' ? 'fas fa-check-circle' : 
                 this.notification.type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-exclamation-triangle';
    
    return html`
      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header ${typeClass} text-white">
            <i class="${icon} me-2"></i>
            <strong class="me-auto">Notificación</strong>
            <button type="button" class="btn-close btn-close-white" 
                    @click=${() => this.notification = null}></button>
          </div>
          <div class="toast-body">
            ${this.notification.message}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el tipo de pago con formato adecuado
   */
  private renderPaymentType(type: PaymentType) {
    const typeMap = {
      [PaymentType.EFECTIVO]: 'Efectivo',
      [PaymentType.TRANSFERENCIA]: 'Transferencia',
      [PaymentType.CHEQUE]: 'Cheque',
      [PaymentType.TARJETA]: 'Tarjeta',
      [PaymentType.OTRO]: 'Otro'
    };
    
    return typeMap[type] || type;
  }

  /**
   * Renderiza el estado del pago con formato adecuado
   */
  private renderPaymentStatus(status: PaymentStatus) {
    const statusClasses = {
      [PaymentStatus.CREADO]: 'status-created',
      [PaymentStatus.PENDIENTE]: 'status-pending',
      [PaymentStatus.PAGADO]: 'status-paid',
      [PaymentStatus.RECHAZADO]: 'status-rejected',
      [PaymentStatus.CANCELADO]: 'status-cancelled'
    };
    
    const statusLabels = {
      [PaymentStatus.CREADO]: 'Creado',
      [PaymentStatus.PENDIENTE]: 'Pendiente',
      [PaymentStatus.PAGADO]: 'Pagado',
      [PaymentStatus.RECHAZADO]: 'Rechazado',
      [PaymentStatus.CANCELADO]: 'Cancelado'
    };
    
    return html`<span class="status-badge ${statusClasses[status]}">${statusLabels[status]}</span>`;
  }

  static override styles = css`
    :host {
      display: block;
    }
    .payments-page {
      width: 100%;
    }
    
    h1 {
      margin-bottom: var(--spacing-6);
    }
    
    .card {
      margin-bottom: var(--spacing-6);
    }
    
    .actions-cell {
      display: flex;
      gap: var(--spacing-2);
    }
    
    .button-sm {
      padding: var(--spacing-1) var(--spacing-2);
      font-size: var(--font-size-xs);
    }
    
    .loading, .error, .empty-state {
      padding: var(--spacing-6);
      text-align: center;
      color: var(--gray-600);
    }
    
    .error {
      color: var(--danger-color);
    }
    
    .status-badge {
      display: inline-block;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      font-weight: 600;
    }
    
    .status-created {
      background-color: var(--gray-200);
      color: var(--gray-700);
    }
    
    .status-pending {
      background-color: var(--warning-color);
      color: white;
    }
    
    .status-paid {
      background-color: var(--success-color);
      color: white;
    }
    
    .status-rejected {
      background-color: var(--danger-color);
      color: white;
    }
    
    .status-cancelled {
      background-color: var(--gray-500);
      color: white;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-container {
      background-color: white;
      border-radius: var(--border-radius-lg);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    
    .modal-header {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-body {
      padding: var(--spacing-4);
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--gray-500);
    }
    
    .close-button:hover {
      color: var(--gray-700);
    }
    
    .payment-detail {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }
    
    .detail-row {
      display: flex;
      margin-bottom: var(--spacing-2);
    }
    
    .detail-label {
      width: 150px;
      font-weight: 600;
      color: var(--gray-700);
    }
    
    .detail-value {
      flex: 1;
    }
    
    h4 {
      margin-top: var(--spacing-4);
      margin-bottom: var(--spacing-2);
      color: var(--primary-color);
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: var(--spacing-2);
    }
    
    .file-section, .actions-section {
      margin-top: var(--spacing-4);
    }
    
    .action-buttons {
      display: flex;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }
    
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: var(--border-radius);
      color: white;
      box-shadow: var(--shadow-md);
      z-index: 1000;
      animation: slide-in 0.3s ease-out;
    }
    
    .notification.success {
      background-color: var(--success-color);
    }
    
    .notification.error {
      background-color: var(--danger-color);
    }
    
    .notification.warning {
      background-color: var(--warning-color);
    }
    
    @keyframes slide-in {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;

  // Desactivamos el shadow DOM para permitir que los estilos globales de Bootstrap se apliquen
  override createRenderRoot() {
    return this;
  }
} 