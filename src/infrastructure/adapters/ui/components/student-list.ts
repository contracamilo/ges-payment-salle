import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Task } from '@lit-labs/task';
import { Router } from '@vaadin/router';
import { Student } from '../../../../domain/models/student.model';
import { StudentFilters } from '../../../../domain/models/filters.model';
import { BaseComponent } from './base-component';

/**
 * Componente que muestra una lista de estudiantes
 */
@customElement('student-list')
export class StudentList extends BaseComponent {
  @property() private filters: StudentFilters = {};
  @property() private selectedStudent: Student | null = null;
  @property() private isDeleteDialogOpen: boolean = false;

  /**
   * Task para cargar los estudiantes
   */
  private loadStudentsTask = new Task(
    this,
    async () => {
      const studentUseCase = window.services.studentUseCase;
      if (Object.keys(this.filters).length > 0) {
        return await studentUseCase.getStudentsByFilters(this.filters);
      } else {
        return await studentUseCase.getAllStudents();
      }
    },
    () => [this.filters]
  );

  /**
   * Maneja el evento cuando se aplican filtros
   * @param event Evento personalizado con los filtros
   */
  handleFilter(event: CustomEvent) {
    this.filters = event.detail;
  }

  /**
   * Navega a la vista de pagos de un estudiante
   * @param codigo Código del estudiante
   */
  navigateToStudentPayments(codigo: string) {
    Router.go(`/estudiantes/${codigo}/pagos`);
  }

  /**
   * Abre el diálogo de confirmación para eliminar un estudiante
   * @param student Estudiante a eliminar
   */
  confirmDelete(student: Student) {
    this.selectedStudent = student;
    this.isDeleteDialogOpen = true;
  }

  /**
   * Elimina el estudiante seleccionado
   */
  async deleteStudent() {
    if (!this.selectedStudent) return;
    
    try {
      await window.services.studentUseCase.deleteStudent(this.selectedStudent.codigo);
      this.isDeleteDialogOpen = false;
      this.selectedStudent = null;
      
      // Forzamos una actualización para que se recarguen los datos
      this.filters = { ...this.filters };
      
      // Notificamos el éxito
      this.dispatchEvent(new CustomEvent('notification', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Estudiante eliminado con éxito',
          type: 'success'
        }
      }));
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      this.dispatchEvent(new CustomEvent('notification', {
        bubbles: true,
        composed: true,
        detail: {
          message: 'Error al eliminar estudiante',
          type: 'error'
        }
      }));
    }
  }

  /**
   * Navega a la vista de edición de un estudiante
   * @param codigo Código del estudiante
   */
  editStudent(codigo: string) {
    // Dispatches an event to open the edit student form/modal
    this.dispatchEvent(new CustomEvent('edit-student', {
      detail: { codigo },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Navega a la vista de creación de un estudiante
   */
  createStudent() {
    // Dispatches an event to open the create student form/modal
    this.dispatchEvent(new CustomEvent('create-student', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="student-list-container">
        <div class="student-list-header">
          <h2>Lista de Estudiantes</h2>
          <button class="button button-primary" @click=${this.createStudent}>
            Nuevo Estudiante
          </button>
        </div>

        <div class="student-filters">
          <student-filter @filter=${this.handleFilter}></student-filter>
        </div>

        ${this.renderStudentsTable()}

        ${this.isDeleteDialogOpen ? this.renderDeleteConfirmDialog() : ''}
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
                        <button class="icon-button" title="Editar" @click=${() => this.editStudent(student.codigo)}>
                          ✏️
                        </button>
                        <button class="icon-button" title="Eliminar" @click=${() => this.confirmDelete(student)}>
                          🗑️
                        </button>
                        <button class="button button-primary button-sm" @click=${() => this.navigateToStudentPayments(student.codigo)}>
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
            <button class="button button-outline" @click=${() => this.isDeleteDialogOpen = false}>
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

  static styles = css`
    :host {
      display: block;
    }
    
    .student-list-container {
      width: 100%;
    }
    
    .student-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4);
    }
    
    .student-filters {
      margin-bottom: var(--spacing-4);
    }
    
    .table-container {
      overflow-x: auto;
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
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    
    .modal-header {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--gray-200);
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
  `;
} 