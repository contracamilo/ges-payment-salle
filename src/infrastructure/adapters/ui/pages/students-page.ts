import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Task } from '@lit-labs/task';
import { Student } from '../../../../domain/models/student.model';
import { StudentFilters } from '../../../../domain/models/filters.model';

/**
 * Página principal de estudiantes
 */
@customElement('students-page')
export class StudentsPage extends LitElement {
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
    console.log('StudentsPage - Renderizando');
    return html`
      <div class="students-page">
        <h1>Gestión de Estudiantes</h1>
        
        <div class="card">
          <div class="card-header">
            <h2>Filtros</h2>
          </div>
          <div class="card-body">
            <student-filter @filter=${this.handleFilter}></student-filter>
          </div>
        </div>
        
        <div class="actions">
          <button class="button button-primary" @click=${this.openCreateForm}>
            Nuevo Estudiante
          </button>
        </div>
        
        <div class="students-list card">
          <div class="card-header">
            <h2>Lista de Estudiantes</h2>
          </div>
          <div class="card-body">
            ${this.renderStudentsTable()}
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
        pending: () => html`<div class="loading">Cargando estudiantes...</div>`,
        complete: (students) => {
          if (students.length === 0) {
            return html`<div class="empty-state">No hay estudiantes registrados</div>`;
          }
          
          return html`
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Programa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(student => html`
                    <tr>
                      <td data-label="Código">${student.codigo}</td>
                      <td data-label="Nombre">${student.nombre}</td>
                      <td data-label="Apellido">${student.apellido}</td>
                      <td data-label="Programa">${student.programaId}</td>
                      <td data-label="Acciones" class="actions-cell">
                        <button class="icon-button" title="Editar" @click=${() => this.openEditForm(student.codigo)}>
                          ✏️
                        </button>
                        <button class="icon-button" title="Eliminar" @click=${() => this.confirmDelete(student)}>
                          🗑️
                        </button>
                        <button class="button button-primary button-sm" 
                                @click=${() => this.navigateToStudentPayments(student.codigo)}>
                          Ver Pagos
                        </button>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `;
        },
        error: (error) => html`<div class="error">Error al cargar estudiantes: ${error.message}</div>`
      })}
    `;
  }

  /**
   * Navega a la vista de pagos de un estudiante
   */
  private navigateToStudentPayments(codigo: string) {
    console.log('StudentsPage - Navegando a pagos del estudiante:', codigo);
    const router = document.querySelector('app-router');
    if (router && 'navigate' in router) {
      (router as any).navigate(`/estudiantes/${codigo}/pagos`);
    } else {
      console.error('Router no encontrado o no tiene método navigate');
    }
  }

  /**
   * Renderiza el formulario de estudiante
   */
  private renderStudentForm() {
    return html`
      <div class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>${this.editingStudentCode ? 'Editar' : 'Crear'} Estudiante</h3>
            <button class="close-button" @click=${this.closeForm}>×</button>
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
    `;
  }

  /**
   * Renderiza el diálogo de confirmación para eliminar un estudiante
   */
  private renderDeleteConfirmDialog() {
    if (!this.selectedStudent) return html``;
    
    return html`
      <div class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que quieres eliminar al estudiante ${this.selectedStudent.nombre} ${this.selectedStudent.apellido} (${this.selectedStudent.codigo})?</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="button button-outline" @click=${this.closeDeleteDialog}>
              Cancelar
            </button>
            <button class="button button-danger" @click=${this.deleteStudent}>
              Eliminar
            </button>
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

  static styles = css`
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