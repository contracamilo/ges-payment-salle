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
  @state() private student: Student | null = null;
  @state() private selectedPaymentId: number | null = null;
  @state() private isDetailModalOpen: boolean = false;
  @state() private notification: { message: string; type: string } | null = null;
  @state() private isLoading: boolean = true;

  /**
   * Task para cargar los datos del estudiante
   */
  private loadStudentTask = new Task(
    this,
    async () => {
      this.isLoading = true;
      if (!this.codigo) {
        this.isLoading = false;
        console.error('No se proporcionó código de estudiante');
        return null;
      }
      console.log('Cargando estudiante con código:', this.codigo);
      try {
        const student = await window.services.studentUseCase.getStudentByCode(this.codigo);
        console.log('Estudiante cargado:', student);
        this.isLoading = false;
        return student;
      } catch (error) {
        console.error('Error al cargar estudiante:', error);
        this.isLoading = false;
        throw error;
      }
    },
    () => [this.codigo]
  );

  /**
   * Task para cargar los pagos del estudiante
   */
  private loadPaymentsTask = new Task(
    this,
    async () => {
      if (!this.codigo) {
        console.error('No se proporcionó código de estudiante para cargar pagos');
        return [];
      }
      console.log('Cargando pagos para estudiante con código:', this.codigo);
      try {
        const payments = await window.services.paymentUseCase.getPaymentsByFilters({
          estudiante_codigo: this.codigo,
        });
        console.log('Pagos cargados:', payments);
        return payments;
      } catch (error) {
        console.error('Error al cargar los pagos:', error);
        throw error;
      }
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

  override connectedCallback() {
    super.connectedCallback();

    // Obtener el código de estudiante de la URL
    const location = Router.location;
    if (location && location.params && location.params.codigo) {
      this.codigo = location.params.codigo as string;
      console.log('StudentPaymentsPage - Código obtenido de Router.location:', this.codigo);
    } else {
      // Intentar obtener el código de la URL directamente
      const path = window.location.pathname;
      const matches = path.match(/\/estudiantes\/([^\/]+)\/pagos/);
      if (matches && matches[1]) {
        this.codigo = matches[1];
        console.log('StudentPaymentsPage - Código obtenido de la URL:', this.codigo);
      } else {
        console.error('No se pudo obtener el código de estudiante de la URL:', path);
      }
    }

    // Asegurar que los servicios estén disponibles
    if (window.services) {
      console.log('Servicios disponibles, cargando datos...');
      this.loadStudentTask.run();
      this.loadPaymentsTask.run();
    } else {
      console.log('Servicios no disponibles, esperando inicialización...');
      window.addEventListener('services-initialized', () => {
        console.log('Servicios inicializados, cargando datos del estudiante y pagos');
        this.loadStudentTask.run();
        this.loadPaymentsTask.run();
      });
    }
  }

  override updated(changedProperties: PropertyValues) {
    if (changedProperties.has('codigo') && this.codigo) {
      console.log('Código de estudiante actualizado:', this.codigo);
      this.loadStudentTask.run();
      this.loadPaymentsTask.run();
    }
  }

  override render() {
    return html`
      <div class="container">
        ${this.loadStudentTask.render({
          pending: () => html`
            <div class="d-flex justify-content-center my-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando información del estudiante...</span>
              </div>
            </div>
          `,
          complete: student => {
            if (!student) {
              return html`
                <div class="alert alert-warning text-center my-5" role="alert">
                  <i class="fas fa-exclamation-triangle fs-3 mb-3"></i>
                  <h4>Estudiante no encontrado</h4>
                  <p>No se pudo encontrar el estudiante con código ${this.codigo}</p>
                  <button class="btn btn-primary mt-2" @click=${this.navigateBack}>
                    <i class="fas fa-arrow-left me-1"></i> Volver a la lista
                  </button>
                </div>
              `;
            }

            this.student = student;
            return html`
              <div class="student-payments-page py-4">
                <div class="row mb-4 align-items-center">
                  <div class="col-md-6">
                    <button class="btn btn-outline-secondary mb-3" @click=${this.navigateBack}>
                      <i class="fas fa-arrow-left me-1"></i> Volver
                    </button>
                    <h1 class="display-5 fw-bold">
                      <i class="fas fa-money-bill-wave text-primary me-2"></i>
                      Pagos del Estudiante
                    </h1>
                  </div>
                </div>

                <div class="card shadow-sm mb-4">
                  <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                      <i class="fas fa-user-graduate me-2"></i>
                      Información del Estudiante
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-4">
                        <p class="text-muted mb-1">Código</p>
                        <p class="fw-bold">${student.codigo}</p>
                      </div>
                      <div class="col-md-4">
                        <p class="text-muted mb-1">Nombre completo</p>
                        <p class="fw-bold">${student.nombre} ${student.apellido}</p>
                      </div>
                      <div class="col-md-4">
                        <p class="text-muted mb-1">Programa</p>
                        <p class="fw-bold">${student.programaId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card shadow-sm">
                  <div
                    class="card-header bg-light d-flex justify-content-between align-items-center"
                  >
                    <h5 class="card-title mb-0">
                      <i class="fas fa-clipboard-list me-2"></i>
                      Historial de Pagos
                    </h5>
                    <span class="badge bg-primary rounded-pill">
                      ${this.loadPaymentsTask.render({
                        pending: () => html`...`,
                        complete: payments => html`${payments.length}`,
                        error: () => html`0`,
                      })}
                    </span>
                  </div>
                  <div class="card-body">${this.renderPaymentsTable()}</div>
                </div>

                ${this.isDetailModalOpen ? this.renderDetailModal() : ''}
                ${this.notification ? this.renderNotification() : ''}
              </div>
            `;
          },
          error: error => html`
            <div class="alert alert-danger text-center my-5" role="alert">
              <i class="fas fa-exclamation-circle fs-3 mb-3"></i>
              <h4>Error al cargar datos</h4>
              <p>${error.message}</p>
              <button class="btn btn-primary mt-2" @click=${this.navigateBack}>
                <i class="fas fa-arrow-left me-1"></i> Volver a la lista
              </button>
            </div>
          `,
        })}
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
              <span class="visually-hidden">Cargando pagos...</span>
            </div>
          </div>
        `,
        complete: payments => {
          console.log('Renderizando tabla de pagos:', payments);
          if (!payments || payments.length === 0) {
            return html`
              <div class="alert alert-info my-4" role="alert">
                <div class="text-center mb-3">
                  <i class="fas fa-info-circle fs-3"></i>
                </div>
                <h5 class="text-center">No hay pagos registrados</h5>
                <p class="text-center">Este estudiante no tiene pagos registrados en el sistema.</p>
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
                    <th scope="col">Monto</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Estado</th>
                    <th scope="col" class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(
                    payment => html`
                      <tr>
                        <td>${payment.id}</td>
                        <td>${new Date(payment.fecha).toLocaleDateString()}</td>
                        <td>$${payment.monto.toFixed(2)}</td>
                        <td>${this.renderPaymentType(payment.type)}</td>
                        <td>${this.renderPaymentStatus(payment.status)}</td>
                        <td>
                          <div class="d-flex justify-content-end gap-2">
                            <button
                              class="btn btn-sm btn-outline-primary"
                              @click=${() => this.showPaymentDetail(payment.id)}
                              title="Ver detalles"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            ${payment.status === PaymentStatus.PENDIENTE
                              ? html`
                                  <button
                                    class="btn btn-sm btn-outline-success"
                                    @click=${() =>
                                      this.updatePaymentStatus(payment.id, PaymentStatus.PAGADO)}
                                    title="Aprobar pago"
                                  >
                                    <i class="fas fa-check"></i>
                                  </button>
                                `
                              : ''}
                          </div>
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            </div>
          `;
        },
        error: error => html`
          <div class="alert alert-danger my-4" role="alert">
            <div class="text-center mb-3">
              <i class="fas fa-exclamation-circle fs-3"></i>
            </div>
            <h5 class="text-center">Error al cargar los pagos</h5>
            <p class="text-center">${error.message || 'Ocurrió un error inesperado'}</p>
            <div class="text-center mt-3">
              <button class="btn btn-sm btn-primary" @click=${() => this.loadPaymentsTask.run()}>
                <i class="fas fa-sync-alt me-1"></i> Reintentar
              </button>
            </div>
          </div>
        `,
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
          <div
            class="modal fade show d-block"
            tabindex="-1"
            style="background-color: rgba(0,0,0,0.5)"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                  <h5 class="modal-title">Detalles del Pago</h5>
                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    @click=${this.closeDetailModal}
                  ></button>
                </div>
                <div class="modal-body text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando detalles...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        complete: payments => {
          const payment = payments.find(p => p.id === this.selectedPaymentId);
          if (!payment) {
            this.closeDetailModal();
            return html``;
          }

          return html`
            <div
              class="modal fade show d-block"
              tabindex="-1"
              style="background-color: rgba(0,0,0,0.5)"
            >
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                      <i class="fas fa-info-circle me-2"></i>
                      Detalles del Pago
                    </h5>
                    <button
                      type="button"
                      class="btn-close btn-close-white"
                      @click=${this.closeDetailModal}
                    ></button>
                  </div>
                  <div class="modal-body">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <p class="mb-1 text-muted">ID del Pago</p>
                        <p class="fw-bold">${payment.id}</p>
                      </div>
                      <div class="col-md-6">
                        <p class="mb-1 text-muted">Fecha</p>
                        <p class="fw-bold">${new Date(payment.fecha).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div class="row mb-3">
                      <div class="col-md-6">
                        <p class="mb-1 text-muted">Monto</p>
                        <p class="fw-bold">$${payment.monto.toFixed(2)}</p>
                      </div>
                      <div class="col-md-6">
                        <p class="mb-1 text-muted">Tipo</p>
                        <p class="fw-bold">${this.renderPaymentType(payment.type)}</p>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <p class="mb-1 text-muted">Estado</p>
                        <p class="fw-bold">${this.renderPaymentStatus(payment.status)}</p>
                      </div>
                    </div>

                    ${payment.file
                      ? html`
                          <div class="row mt-3">
                            <div class="col-12">
                              <p class="mb-1 text-muted">Comprobante</p>
                              <a
                                href="${payment.file}"
                                target="_blank"
                                class="btn btn-sm btn-outline-primary"
                              >
                                <i class="fas fa-file-alt me-1"></i> Ver comprobante
                              </a>
                            </div>
                          </div>
                        `
                      : ''}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click=${this.closeDetailModal}>
                      <i class="fas fa-times me-1"></i> Cerrar
                    </button>
                    ${payment.status === PaymentStatus.PENDIENTE
                      ? html`
                          <button
                            type="button"
                            class="btn btn-success"
                            @click=${() =>
                              this.updatePaymentStatus(payment.id, PaymentStatus.PAGADO)}
                          >
                            <i class="fas fa-check me-1"></i> Aprobar Pago
                          </button>
                        `
                      : ''}
                    ${payment.status === PaymentStatus.PAGADO
                      ? html`
                          <button
                            type="button"
                            class="btn btn-warning"
                            @click=${() =>
                              this.updatePaymentStatus(payment.id, PaymentStatus.PENDIENTE)}
                          >
                            <i class="fas fa-undo me-1"></i> Marcar como Pendiente
                          </button>
                        `
                      : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        },
        error: error => html`
          <div
            class="modal fade show d-block"
            tabindex="-1"
            style="background-color: rgba(0,0,0,0.5)"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                  <h5 class="modal-title">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error
                  </h5>
                  <button
                    type="button"
                    class="btn-close btn-close-white"
                    @click=${this.closeDetailModal}
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="alert alert-danger" role="alert">
                    Error al cargar detalles: ${error.message}
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click=${this.closeDetailModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `,
      })}
    `;
  }

  /**
   * Renderiza una notificación
   */
  private renderNotification() {
    if (!this.notification) return html``;

    const typeClass =
      this.notification.type === 'success'
        ? 'alert-success'
        : this.notification.type === 'error'
          ? 'alert-danger'
          : 'alert-warning';

    const icon =
      this.notification.type === 'success'
        ? 'fas fa-check-circle'
        : this.notification.type === 'error'
          ? 'fas fa-exclamation-circle'
          : 'fas fa-exclamation-triangle';

    return html`
      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header ${typeClass} text-white">
            <i class="${icon} me-2"></i>
            <strong class="me-auto">Notificación</strong>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click=${() => (this.notification = null)}
            ></button>
          </div>
          <div class="toast-body">${this.notification.message}</div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el tipo de pago con formato adecuado
   */
  private renderPaymentType(type: PaymentType) {
    switch (type) {
      case PaymentType.EFECTIVO:
        return html`<span class="badge bg-success">Efectivo</span>`;
      case PaymentType.TRANSFERENCIA:
        return html`<span class="badge bg-primary">Transferencia</span>`;
      case PaymentType.CHEQUE:
        return html`<span class="badge bg-info">Cheque</span>`;
      case PaymentType.TARJETA:
        return html`<span class="badge bg-warning">Tarjeta</span>`;
      case PaymentType.OTRO:
        return html`<span class="badge bg-secondary">Otro</span>`;
      default:
        return html`<span class="badge bg-light text-dark">${type}</span>`;
    }
  }

  /**
   * Renderiza el estado del pago con formato adecuado
   */
  private renderPaymentStatus(status: PaymentStatus) {
    switch (status) {
      case PaymentStatus.CREADO:
        return html`<span class="badge bg-secondary">Creado</span>`;
      case PaymentStatus.PENDIENTE:
        return html`<span class="badge bg-warning">Pendiente</span>`;
      case PaymentStatus.PAGADO:
        return html`<span class="badge bg-success">Pagado</span>`;
      case PaymentStatus.RECHAZADO:
        return html`<span class="badge bg-danger">Rechazado</span>`;
      case PaymentStatus.CANCELADO:
        return html`<span class="badge bg-dark">Cancelado</span>`;
      default:
        return html`<span class="badge bg-light text-dark">${status}</span>`;
    }
  }
}
