import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Task } from '@lit-labs/task';
import { Student, CreateStudentDto } from '../../../../domain/models/student.model';
import { BaseComponent } from './base-component';

/**
 * Formulario para la creación y edición de estudiantes
 */
@customElement('student-form')
export class StudentForm extends BaseComponent {
  /**
   * Código del estudiante a editar (null si es un nuevo estudiante)
   */
  @property({ type: String }) studentCode: string | null = null;

  /**
   * Datos del formulario
   */
  @state() private formData: CreateStudentDto = {
    codigo: '',
    nombre: '',
    apellido: '',
    programaId: '',
    foto: null
  };

  /**
   * Indica si el formulario está en proceso de envío
   */
  @state() private isSubmitting = false;

  /**
   * Errores de validación
   */
  @state() private errors: Record<string, string> = {};

  /**
   * Task para cargar los datos del estudiante a editar
   */
  private loadStudentTask = new Task(
    this,
    async ([code]) => {
      if (!code) return null;
      return await window.services.studentUseCase.getStudentByCode(code);
    },
    () => [this.studentCode]
  );

  /**
   * Task para cargar los programas disponibles
   */
  private loadProgramsTask = new Task(
    this,
    async () => {
      // Simulamos una carga de programas académicos
      // En un caso real, esto vendría de un endpoint
      return [
        { id: 'LTA1', nombre: 'Licenciatura en Tecnología' },
        { id: 'ING1', nombre: 'Ingeniería de Software' },
        { id: 'ADM1', nombre: 'Administración de Empresas' },
        { id: 'MED1', nombre: 'Medicina' }
      ];
    },
    () => []
  );

  /**
   * Maneja los cambios en los campos del formulario
   */
  handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement | HTMLSelectElement;
    const field = input.name;
    const value = input.value;

    this.formData = {
      ...this.formData,
      [field]: value
    };

    // Limpiar el error cuando el usuario comienza a escribir en un campo
    if (this.errors[field]) {
      this.errors = {
        ...this.errors,
        [field]: ''
      };
    }
  }

  /**
   * Valida el formulario
   */
  validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.formData.codigo) {
      newErrors.codigo = 'El código es obligatorio';
    }

    if (!this.formData.nombre) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!this.formData.apellido) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if (!this.formData.programaId) {
      newErrors.programaId = 'El programa es obligatorio';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Envía el formulario
   */
  async submitForm(e: Event) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    try {
      if (this.studentCode) {
        // Actualizar estudiante existente
        await window.services.studentUseCase.updateStudent(
          this.studentCode,
          this.formData
        );
        
        this.dispatchEvent(new CustomEvent('submit-success', {
          detail: {
            message: 'Estudiante actualizado correctamente'
          }
        }));
      } else {
        // Crear nuevo estudiante
        await window.services.studentUseCase.createStudent(this.formData);
        
        this.dispatchEvent(new CustomEvent('submit-success', {
          detail: {
            message: 'Estudiante creado correctamente'
          }
        }));
      }
    } catch (error) {
      console.error('Error al guardar estudiante:', error);
      
      this.dispatchEvent(new CustomEvent('submit-error', {
        detail: {
          message: 'Error al guardar el estudiante'
        }
      }));
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Cancela el formulario
   */
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  render() {
    return html`
      ${this.loadStudentTask.render({
        pending: () => this.studentCode ? html`<div class="loading">Cargando datos del estudiante...</div>` : this.renderForm(),
        complete: (student) => {
          if (student && this.studentCode) {
            // Si es edición y se ha cargado el estudiante, actualizamos el formData
            if (this.formData.codigo === '') {
              this.formData = {
                codigo: student.codigo,
                nombre: student.nombre,
                apellido: student.apellido,
                programaId: student.programaId,
                foto: student.foto
              };
            }
          }
          return this.renderForm();
        },
        error: (error) => html`<div class="error">Error al cargar datos: ${error.message}</div>`
      })}
    `;
  }

  /**
   * Renderiza el formulario
   */
  private renderForm() {
    return html`
      <form @submit=${this.submitForm}>
        <div class="form-group">
          <label for="codigo">Código *</label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            .value=${this.formData.codigo}
            @input=${this.handleInputChange}
            ?disabled=${Boolean(this.studentCode)}
          />
          ${this.errors.codigo ? html`<div class="error-message">${this.errors.codigo}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            .value=${this.formData.nombre}
            @input=${this.handleInputChange}
          />
          ${this.errors.nombre ? html`<div class="error-message">${this.errors.nombre}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label for="apellido">Apellido *</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            .value=${this.formData.apellido}
            @input=${this.handleInputChange}
          />
          ${this.errors.apellido ? html`<div class="error-message">${this.errors.apellido}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label for="programaId">Programa *</label>
          ${this.loadProgramsTask.render({
            pending: () => html`<select disabled><option>Cargando...</option></select>`,
            complete: (programs) => html`
              <select
                id="programaId"
                name="programaId"
                .value=${this.formData.programaId}
                @change=${this.handleInputChange}
              >
                <option value="">Seleccione un programa</option>
                ${programs.map(program => html`
                  <option value=${program.id}>${program.nombre}</option>
                `)}
              </select>
            `,
            error: (error) => html`<div class="error">Error: ${error.message}</div>`
          })}
          ${this.errors.programaId ? html`<div class="error-message">${this.errors.programaId}</div>` : ''}
        </div>
        
        <div class="form-actions">
          <button
            type="button"
            class="button button-outline"
            @click=${this.cancel}
            ?disabled=${this.isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="button button-primary"
            ?disabled=${this.isSubmitting}
          >
            ${this.isSubmitting
              ? 'Guardando...'
              : this.studentCode
                ? 'Actualizar'
                : 'Crear'
            }
          </button>
        </div>
      </form>
    `;
  }

  static styles = css`
    form {
      width: 100%;
    }
    
    .form-group {
      margin-bottom: var(--spacing-4);
    }
    
    .error-message {
      color: var(--danger-color);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-1);
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-2);
      margin-top: var(--spacing-6);
    }
    
    .loading, .error {
      padding: var(--spacing-4);
      text-align: center;
    }
    
    .error {
      color: var(--danger-color);
    }
  `;
} 