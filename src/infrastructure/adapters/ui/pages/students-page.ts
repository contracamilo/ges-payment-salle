import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Task } from '@lit-labs/task';
import { Student } from '../../../../domain/models/student.model';
import { StudentFilters } from '../../../../domain/models/filters.model';
import { BaseComponent } from '../../ui/components/base-component';
import { Router } from '@vaadin/router';

/**
 * Página principal de estudiantes
 */
@customElement('students-page')
export class StudentsPage extends BaseComponent {
  @state() private filters: StudentFilters = {};
  @state() private isCreateModalOpen: boolean = false;
  @state() private editingStudentCode: string | null = null;
  @state() private isDeleteDialogOpen: boolean = false;
  @state() private selectedStudent: Student | null = null;
  @state() private notification: { message: string; type: string } | null = null;

  /**
   * Task para cargar los estudiantes
   */
  private loadStudentsTask = new Task(
    this,
    async () => {
      try {
        // Verificamos que los servicios estén disponibles
        if (!window.services || !window.services.studentUseCase) {
          console.error('Los servicios no están disponibles. Reiniciando servicios...');
          if (typeof window.initializeServices === 'function') {
            window.initializeServices();
          }
          // Si aún no están disponibles, lanzamos un error
          if (!window.services || !window.services.studentUseCase) {
            throw new Error('Los servicios no están disponibles.');
          }
        }

        const studentUseCase = window.services.studentUseCase;
        let result;
        
        if (Object.keys(this.filters).length > 0) {
          result = await studentUseCase.getStudentsByFilters(this.filters);
        } else {
          result = await studentUseCase.getAllStudents();
        }
        
        return result;
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        throw error;
      }
    },
    () => [this.filters]
  );

  override connectedCallback() {
    super.connectedCallback();
    
    // Cargamos todos los estudiantes al inicio
    this.filters = {};
    
    // Verificamos si los servicios ya están disponibles
    if (window.services && window.services.studentUseCase) {
      this.loadStudentsTask.run();
    }
    
    // Escuchamos el evento de servicios inicializados
    window.addEventListener('services-initialized', () => {
      this.loadStudentsTask.run();
    });
  }

  /**
   * Maneja el evento cuando se aplican filtros
   */
  handleFilter(event: CustomEvent) {
    console.log('StudentsPage - Aplicando filtros:', event.detail);
    this.filters = event.detail;
  }

  /**
   * Abre el formulario para crear un estudiante
   */
  openCreateForm() {
    console.log('StudentsPage - Abriendo formulario de creación');
    this.isCreateModalOpen = true;
    this.editingStudentCode = null;
  }

  /**
   * Abre el formulario para editar un estudiante
   */
  openEditForm(codigo: string) {
    console.log('StudentsPage - Abriendo formulario de edición para:', codigo);
    this.editingStudentCode = codigo;
    this.isCreateModalOpen = true;
  }

  /**
   * Cierra el formulario
   */
  closeForm() {
    console.log('StudentsPage - Cerrando formulario');
    this.isCreateModalOpen = false;
    this.editingStudentCode = null;
  }

  /**
   * Maneja el evento cuando se envía el formulario
   */
  handleFormSubmit(event: CustomEvent) {
    console.log('StudentsPage - Formulario enviado:', event.detail);
    this.closeForm();
    this.showNotification(event.detail.message, 'success');
    this.reloadStudents();
  }

  /**
   * Abre el diálogo de confirmación para eliminar un estudiante
   */
  confirmDelete(student: Student) {
    console.log('StudentsPage - Confirmando eliminación de:', student.codigo);
    this.selectedStudent = student;
    this.isDeleteDialogOpen = true;
  }

  /**
   * Cierra el diálogo de confirmación
   */
  closeDeleteDialog() {
    console.log('StudentsPage - Cerrando diálogo de eliminación');
    this.isDeleteDialogOpen = false;
    this.selectedStudent = null;
  }

  /**
   * Elimina el estudiante seleccionado
   */
  async deleteStudent() {
    if (!this.selectedStudent) return;
    
    console.log('StudentsPage - Eliminando estudiante:', this.selectedStudent.codigo);
    try {
      await window.services.studentUseCase.deleteStudent(this.selectedStudent.codigo);
      this.closeDeleteDialog();
      this.showNotification('Estudiante eliminado correctamente', 'success');
      this.reloadStudents();
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      this.showNotification('Error al eliminar estudiante', 'error');
    }
  }

  /**
   * Recarga la lista de estudiantes
   */
  reloadStudents() {
    console.log('StudentsPage - Recargando lista de estudiantes');
    this.loadStudentsTask.run();
  }

  /**
   * Muestra una notificación
   */
  showNotification(message: string, type: string) {
    console.log('StudentsPage - Mostrando notificación:', message, type);
    this.notification = { message, type };
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  override render() {
    return html`
      <div class="students-page">
        <div class="container">
          <div class="row mb-4 align-items-center">
            <div class="col-md-6">
              <h1 class="display-5 fw-bold mb-0">
                <i class="fas fa-users text-primary me-2"></i>
                Gestión de Estudiantes
              </h1>
            </div>
            <div class="col-md-6 text-md-end mt-3 mt-md-0">
              <button class="btn btn-primary" @click=${this.openCreateForm}>
                <i class="fas fa-plus-circle me-1"></i> Nuevo Estudiante
              </button>
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
              <student-filter @filter=${this.handleFilter}></student-filter>
            </div>
          </div>
          
          <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="fas fa-list me-2"></i>
                Lista de Estudiantes
              </h5>
              <span class="badge bg-primary rounded-pill">
                ${this.loadStudentsTask.render({
                  pending: () => html`...`,
                  complete: (students) => html`${students.length}`,
                  error: () => html`0`
                })}
              </span>
            </div>
            <div class="card-body">
              ${this.renderStudentsTable()}
            </div>
          </div>
        </div>
        
        ${this.isCreateModalOpen ? this.renderStudentForm() : ''}
        ${this.isDeleteDialogOpen ? this.renderDeleteConfirmDialog() : ''}
        ${this.notification ? this.renderNotification() : ''}
      </div>
    `;
  }

  /**
   * Renderiza la tabla de estudiantes
   */
  private renderStudentsTable() {
    return html`
      ${this.loadStudentsTask.render({
        pending: () => html`
          <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
        `,
        complete: (students) => {
          if (students.length === 0) {
            return html`
              <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="lead">No se encontraron estudiantes</p>
                <p class="text-muted">Intenta cambiar los filtros o agregar un nuevo estudiante</p>
              </div>
            `;
          }
          
          return html`
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Apellido</th>
                    <th scope="col">Programa</th>
                    <th scope="col" class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(student => html`
                    <tr>
                      <td>${student.codigo}</td>
                      <td>${student.nombre}</td>
                      <td>${student.apellido}</td>
                      <td>${student.programaId}</td>
                      <td>
                        <div class="d-flex justify-content-end gap-2">
                          <button
                            class="btn btn-sm btn-outline-primary"
                            @click=${() => this.navigateToStudentPayments(student.codigo)}
                            title="Ver pagos"
                          >
                            <i class="fas fa-money-bill-wave"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-secondary"
                            @click=${() => this.openEditForm(student.codigo)}
                            title="Editar"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click=${() => this.confirmDelete(student)}
                            title="Eliminar"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
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
            Error al cargar los estudiantes: ${error.message}
          </div>
        `
      })}
    `;
  }

  /**
   * Navega a la página de pagos del estudiante
   */
  private navigateToStudentPayments(codigo: string) {
    console.log('StudentsPage - Navegando a pagos del estudiante:', codigo);
    
    try {
      Router.go(`/estudiantes/${codigo}/pagos`);
      console.log('Navegación realizada con éxito');
    } catch (error) {
      console.error('Error en la navegación:', error);
      
      // Si la navegación falla, intentamos un enfoque alternativo
      const router = document.querySelector('app-router');
      if (router && 'navigate' in router) {
        console.log('Usando el método navigate del router');
        (router as any).navigate(`/estudiantes/${codigo}/pagos`);
      } else {
        console.error('Router no encontrado o no tiene método navigate');
        // Último recurso: cambiar la URL directamente
        window.location.href = `/estudiantes/${codigo}/pagos`;
      }
    }
  }

  /**
   * Renderiza el formulario de estudiante
   */
  private renderStudentForm() {
    return html`
      <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="${this.editingStudentCode ? 'fas fa-user-edit' : 'fas fa-user-plus'} me-2"></i>
                ${this.editingStudentCode ? 'Editar' : 'Crear'} Estudiante
              </h5>
              <button type="button" class="btn-close btn-close-white" @click=${this.closeForm}></button>
            </div>
            <div class="modal-body">
              <student-form
                .studentCode=${this.editingStudentCode}
                @submit-success=${this.handleFormSubmit}
                @submit-error=${(e: CustomEvent) => this.showNotification(e.detail.message, 'error')}
                @cancel=${this.closeForm}
              ></student-form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el diálogo de confirmación para eliminar un estudiante
   */
  private renderDeleteConfirmDialog() {
    if (!this.selectedStudent) return html``;
    
    return html`
      <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Confirmar eliminación
              </h5>
              <button type="button" class="btn-close btn-close-white" @click=${this.closeDeleteDialog}></button>
            </div>
            <div class="modal-body">
              <p>¿Está seguro que desea eliminar al estudiante <strong>${this.selectedStudent.nombre} ${this.selectedStudent.apellido}</strong> con código <strong>${this.selectedStudent.codigo}</strong>?</p>
              <p class="text-danger mb-0"><small>Esta acción no se puede deshacer.</small></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click=${this.closeDeleteDialog}>
                <i class="fas fa-times me-1"></i> Cancelar
              </button>
              <button type="button" class="btn btn-danger" @click=${this.deleteStudent}>
                <i class="fas fa-trash me-1"></i> Eliminar
              </button>
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

  static override styles = css`
    :host {
      display: block;
    }
    
    .students-page {
      width: 100%;
    }
    
    h1 {
      margin-bottom: var(--spacing-6);
    }
    
    .card {
      margin-bottom: var(--spacing-6);
      background-color: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    
    .card-header {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--gray-200);
      background-color: var(--gray-50);
    }
    
    .card-header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
    }
    
    .card-body {
      padding: var(--spacing-4);
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: var(--spacing-4);
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: var(--spacing-3);
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
    }
    
    th {
      font-weight: 600;
      background-color: var(--gray-100);
    }
    
    .actions-cell {
      display: flex;
      gap: var(--spacing-2);
    }
    
    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: var(--spacing-1);
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
    
    .modal-footer {
      padding: var(--spacing-4);
      border-top: 1px solid var(--gray-200);
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-2);
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
    
    .text-danger {
      color: var(--danger-color);
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
    
    @media (max-width: 768px) {
      td, th {
        display: block;
      }
      
      thead tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
      }
      
      tr {
        border: 1px solid var(--gray-300);
        margin-bottom: var(--spacing-4);
      }
      
      td {
        border: none;
        border-bottom: 1px solid var(--gray-200);
        position: relative;
        padding-left: 50%;
      }
      
      td:before {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 45%;
        white-space: nowrap;
        content: attr(data-label);
        font-weight: 600;
      }
      
      .actions-cell {
        padding-left: var(--spacing-3);
      }
    }
  `;
} 