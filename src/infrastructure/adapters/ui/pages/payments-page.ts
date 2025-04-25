import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Task } from '@lit-labs/task';
import { Payment, PaymentStatus, PaymentType } from '../../../../domain/models/payment.model';
import { PaymentFilters } from '../../../../domain/models/filters.model';

/**
 * Página principal de pagos
 */
@customElement('payments-page')
export class PaymentsPage extends LitElement {
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
        <h1>Gestión de Pagos</h1>
        <div class="card">
          <div class="card-header">
            <h2>Filtros</h2>
          </div>
          <div class="card-body">
            <payment-filter @filter=${this.handleFilter}></payment-filter>
          </div>
        </div>
        
        <div class="payments-list card">
          <div class="card-header">
            <h2>Lista de Pagos</h2>
          </div>
          <div class="card-body">
            ${this.renderPaymentsTable()}
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
        pending: () => html`<div class="loading">Cargando pagos...</div>`,
        complete: (payments) => {
          if (payments.length === 0) {
            return html`<div class="empty-state">No hay pagos registrados</div>`;
          }
          
          return html`
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Estudiante</th>
                    <th>Monto</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(payment => html`
                    <tr>
                      <td data-label="ID">${payment.id}</td>
                      <td data-label="Fecha">${new Date(payment.fecha).toLocaleDateString()}</td>
                      <td data-label="Estudiante">${payment.estudiante.nombre} ${payment.estudiante.apellido}</td>
                      <td data-label="Monto">$${payment.monto.toFixed(2)}</td>
                      <td data-label="Tipo">${this.renderPaymentType(payment.type)}</td>
                      <td data-label="Estado">${this.renderPaymentStatus(payment.status)}</td>
                      <td data-label="Acciones" class="actions-cell">
                        <button class="button button-primary button-sm" @click=${() => this.showPaymentDetail(payment)}>
                          Ver Detalles
                        </button>
                        ${payment.status === PaymentStatus.PENDIENTE ? html`
                          <button class="button button-secondary button-sm" @click=${() => this.updatePaymentStatus(payment.id, PaymentStatus.PAGADO)}>
                            Aprobar
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `;
        },
        error: (error) => html`<div class="error">Error al cargar pagos: ${error.message}</div>`
      })}
    `;
  }

  /**
   * Renderiza el modal de detalles del pago
   */
  private renderDetailModal() {
    if (!this.selectedPayment) return html``;
    
    return html`
      <div class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Detalles del Pago</h3>
            <button class="close-button" @click=${this.closeDetailModal}>×</button>
          </div>
          <div class="modal-body">
            <div class="payment-detail">
              <div class="detail-row">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${this.selectedPayment.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">${new Date(this.selectedPayment.fecha).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Monto:</span>
                <span class="detail-value">$${this.selectedPayment.monto.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">${this.renderPaymentType(this.selectedPayment.type)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="detail-value">${this.renderPaymentStatus(this.selectedPayment.status)}</span>
              </div>
              
              <h4>Información del Estudiante</h4>
              <div class="detail-row">
                <span class="detail-label">Código:</span>
                <span class="detail-value">${this.selectedPayment.estudiante.codigo}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nombre:</span>
                <span class="detail-value">${this.selectedPayment.estudiante.nombre} ${this.selectedPayment.estudiante.apellido}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Programa:</span>
                <span class="detail-value">${this.selectedPayment.estudiante.programaId}</span>
              </div>
              
              ${this.selectedPayment.file ? html`
                <div class="file-section">
                  <h4>Comprobante de Pago</h4>
                  <a href="${this.selectedPayment.file}" target="_blank" class="button button-outline">
                    Ver Comprobante
                  </a>
                </div>
              ` : ''}
              
              <div class="actions-section">
                <h4>Acciones</h4>
                <div class="action-buttons">
                  ${this.selectedPayment.status === PaymentStatus.PENDIENTE ? html`
                    <button class="button button-success" @click=${() => this.updatePaymentStatus(this.selectedPayment!.id, PaymentStatus.PAGADO)}>
                      Aprobar Pago
                    </button>
                    <button class="button button-danger" @click=${() => this.updatePaymentStatus(this.selectedPayment!.id, PaymentStatus.RECHAZADO)}>
                      Rechazar Pago
                    </button>
                  ` : ''}
                  ${this.selectedPayment.status === PaymentStatus.PAGADO ? html`
                    <button class="button button-warning" @click=${() => this.updatePaymentStatus(this.selectedPayment!.id, PaymentStatus.PENDIENTE)}>
                      Marcar como Pendiente
                    </button>
                  ` : ''}
                  ${this.selectedPayment.status === PaymentStatus.RECHAZADO ? html`
                    <button class="button button-primary" @click=${() => this.updatePaymentStatus(this.selectedPayment!.id, PaymentStatus.PENDIENTE)}>
                      Marcar como Pendiente
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza una notificación
   */
  private renderNotification() {
    if (!this.notification) return '';
    
    return html`
      <div class="notification ${this.notification.type}">
        ${this.notification.message}
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
} 