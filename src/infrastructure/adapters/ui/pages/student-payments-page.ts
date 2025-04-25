import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseComponent } from '../../ui/components/base-component';
import { Task } from '@lit-labs/task';
import { Router } from '@vaadin/router';
import { PaymentStatus, PaymentType } from '../../../../domain/models/payment.model';
import { Student } from '../../../../domain/models/student.model';
import { PropertyValues } from 'lit';

/**
 * Página que muestra los pagos de un estudiante específico
 */
@customElement('student-payments-page')
export class StudentPaymentsPage extends BaseComponent {
  @property({ type: String }) codigo: string = '';
  @property({ type: String }) studentCode: string = '';
  @state() private student: Student | null = null;
  @state() private selectedPaymentId: number | null = null;
  @state() private isDetailModalOpen: boolean = false;
  @state() private notification: { message: string; type: string } | null = null;

  /**
   * Task para cargar los datos del estudiante
   */
  private loadStudentTask = new Task(
    this,
    async () => {
      if (!this.codigo) return null;
      return await window.services.studentUseCase.getStudentByCode(this.codigo);
    },
    () => [this.codigo]
  );

  /**
   * Task para cargar los pagos del estudiante
   */
  private loadPaymentsTask = new Task(
    this,
    async () => {
      if (!this.codigo) return [];
      return await window.services.studentUseCase.getStudentPayments(this.codigo);
    },
    () => [this.codigo]
  );

  /**
   * Navega de vuelta a la lista de estudiantes
   */
  navigateBack() {
    Router.go('/estudiantes');
  }

  /**
   * Abre el modal de detalles del pago
   */
  showPaymentDetail(paymentId: number) {
    this.selectedPaymentId = paymentId;
    this.isDetailModalOpen = true;
  }

  /**
   * Cierra el modal de detalles
   */
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedPaymentId = null;
  }

  /**
   * Muestra una notificación
   */
  showNotification(message: string, type: string) {
    this.notification = { message, type };
    
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
      this.loadPaymentsTask.run();
      
      // Cerrar el modal si está abierto
      if (this.isDetailModalOpen) {
        this.closeDetailModal();
      }
      
      // Mostrar notificación
      this.showNotification('Estado de pago actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      this.showNotification('Error al actualizar estado de pago', 'error');
    }
  }

  override render() {
    return html`
      ${this.loadStudentTask.render({
        pending: () => html`<div class="loading">Cargando información del estudiante...</div>`,
        complete: (student) => {
          if (!student) {
            return html`
              <div class="error-container">
                <div class="error">Estudiante no encontrado</div>
                <button class="button button-primary" @click=${this.navigateBack}>
                  Volver a la lista
                </button>
              </div>
            `;
          }
          
          this.student = student;
          return html`
            <div class="student-payments-page">
              <div class="page-header">
                <button class="button button-outline" @click=${this.navigateBack}>
                  &larr; Volver
                </button>
                <h1>Pagos de ${student.nombre} ${student.apellido}</h1>
              </div>
              
              <div class="student-info card">
                <div class="card-header">
                  <h2>Información del Estudiante</h2>
                </div>
                <div class="card-body">
                  <div class="info-row">
                    <div class="info-item">
                      <span class="info-label">Código:</span>
                      <span class="info-value">${student.codigo}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Nombre:</span>
                      <span class="info-value">${student.nombre} ${student.apellido}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Programa:</span>
                      <span class="info-value">${student.programaId}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="payments-list card">
                <div class="card-header">
                  <h2>Historial de Pagos</h2>
                </div>
                <div class="card-body">
                  ${this.renderPaymentsTable()}
                </div>
              </div>
              
              ${this.isDetailModalOpen ? this.renderDetailModal() : ''}
              ${this.notification ? this.renderNotification() : ''}
            </div>
          `;
        },
        error: (error) => html`
          <div class="error">Error al cargar datos: ${error.message}</div>
          <button class="button button-primary" @click=${this.navigateBack}>
            Volver a la lista
          </button>
        `
      })}
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
            return html`<div class="empty-state">Este estudiante no tiene pagos registrados</div>`;
          }
          
          return html`
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
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
                      <td data-label="Monto">$${payment.monto.toFixed(2)}</td>
                      <td data-label="Tipo">${this.renderPaymentType(payment.type)}</td>
                      <td data-label="Estado">${this.renderPaymentStatus(payment.status)}</td>
                      <td data-label="Acciones" class="actions-cell">
                        <button class="button button-primary button-sm" @click=${() => this.showPaymentDetail(payment.id)}>
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
    return html`
      ${this.loadPaymentsTask.render({
        pending: () => html`
          <div class="modal-overlay">
            <div class="modal-container">
              <div class="loading">Cargando detalles del pago...</div>
            </div>
          </div>
        `,
        complete: (payments) => {
          const payment = payments.find(p => p.id === this.selectedPaymentId);
          if (!payment) {
            this.closeDetailModal();
            return html``;
          }
          
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
                      <span class="detail-value">${payment.id}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Fecha:</span>
                      <span class="detail-value">${new Date(payment.fecha).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Monto:</span>
                      <span class="detail-value">$${payment.monto.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Tipo:</span>
                      <span class="detail-value">${this.renderPaymentType(payment.type)}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Estado:</span>
                      <span class="detail-value">${this.renderPaymentStatus(payment.status)}</span>
                    </div>
                    
                    ${payment.file ? html`
                      <div class="file-section">
                        <h4>Comprobante de Pago</h4>
                        <a href="${payment.file}" target="_blank" class="button button-outline">
                          Ver Comprobante
                        </a>
                      </div>
                    ` : ''}
                    
                    <div class="actions-section">
                      <h4>Acciones</h4>
                      <div class="action-buttons">
                        ${payment.status === PaymentStatus.PENDIENTE ? html`
                          <button class="button button-success" @click=${() => this.updatePaymentStatus(payment.id, PaymentStatus.PAGADO)}>
                            Aprobar Pago
                          </button>
                          <button class="button button-danger" @click=${() => this.updatePaymentStatus(payment.id, PaymentStatus.RECHAZADO)}>
                            Rechazar Pago
                          </button>
                        ` : ''}
                        ${payment.status === PaymentStatus.PAGADO ? html`
                          <button class="button button-warning" @click=${() => this.updatePaymentStatus(payment.id, PaymentStatus.PENDIENTE)}>
                            Marcar como Pendiente
                          </button>
                        ` : ''}
                        ${payment.status === PaymentStatus.RECHAZADO ? html`
                          <button class="button button-primary" @click=${() => this.updatePaymentStatus(payment.id, PaymentStatus.PENDIENTE)}>
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
        },
        error: (error) => html`
          <div class="modal-overlay">
            <div class="modal-container">
              <div class="error">Error al cargar detalles: ${error.message}</div>
              <button class="button button-primary" @click=${this.closeDetailModal}>
                Cerrar
              </button>
            </div>
          </div>
        `
      })}
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
    const statusLabels: Record<PaymentStatus, string> = {
      [PaymentStatus.CREADO]: 'Creado',
      [PaymentStatus.PENDIENTE]: 'Pendiente',
      [PaymentStatus.PAGADO]: 'Pagado',
      [PaymentStatus.RECHAZADO]: 'Rechazado',
      [PaymentStatus.CANCELADO]: 'Cancelado'
    };

    const statusClasses: Record<PaymentStatus, string> = {
      [PaymentStatus.CREADO]: 'status-created',
      [PaymentStatus.PENDIENTE]: 'status-pending',
      [PaymentStatus.PAGADO]: 'status-paid',
      [PaymentStatus.RECHAZADO]: 'status-rejected',
      [PaymentStatus.CANCELADO]: 'status-cancelled'
    };

    return html`<span class="status-badge ${statusClasses[status]}">${statusLabels[status]}</span>`;
  }

  static styles = css`
    :host {
      display: block;
    }
    
    .student-payments-page {
      width: 100%;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-6);
    }
    
    h1 {
      margin: 0;
    }
    
    .card {
      margin-bottom: var(--spacing-6);
    }
    
    .info-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-6);
    }
    
    .info-item {
      margin-bottom: var(--spacing-2);
    }
    
    .info-label {
      font-weight: 600;
      margin-right: var(--spacing-2);
      color: var(--gray-600);
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
    
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-4);
      padding: var(--spacing-6);
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

  override connectedCallback() {
    super.connectedCallback();
    console.log('StudentPaymentsPage connected, código:', this.codigo);
    this.loadStudentTask.run();
  }

  override updated(changedProperties: PropertyValues) {
    console.log('StudentPaymentsPage updated, props changed:', [...changedProperties.keys()]);
    if (changedProperties.has('studentCode') && this.studentCode) {
      console.log('Actualizando código desde studentCode:', this.studentCode);
      this.codigo = this.studentCode;
    }
  }

  private async loadStudentData() {
    try {
      console.log('Intentando cargar datos del estudiante con código:', this.codigo);
      const student = await window.services.studentUseCase.getStudentByCode(this.codigo);
      console.log('Datos del estudiante cargados:', student);
      
      if (student) {
        this.student = student;
        this.loadPaymentsTask.run();
      }
    } catch (error) {
      console.error('Error al cargar datos del estudiante:', error);
    }
  }
} 