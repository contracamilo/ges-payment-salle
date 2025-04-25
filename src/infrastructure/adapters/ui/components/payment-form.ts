import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component';
import { PaymentType, PaymentStatus, CreatePaymentDto } from '../../../../domain/models/payment.model';
import { Student } from '../../../../domain/models/student.model';
import { Task } from '@lit-labs/task';

/**
 * Componente de formulario para la creación y edición de pagos.
 * Permite seleccionar estudiante, ingresar monto, fecha y otros datos del pago.
 * Incluye validación de campos y protección contra SQL injection.
 */
@customElement('payment-form')
export class PaymentForm extends BaseComponent {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: Function }) onClose = () => {};
  @property({ type: Function }) onSuccess = () => {};
  
  @state() private formData: {
    fecha: string;
    monto: string;
    type: PaymentType;
    estudianteId: string;
    status: PaymentStatus;
    file: string;
  } = this.getInitialFormData();
  
  @state() private errors: Record<string, string> = {};
  @state() private isSubmitting = false;
  @state() private searchTerm: string = '';
  @state() private selectedStudent: Student | null = null;
  
  /**
   * Task para cargar estudiantes
   */
  private loadStudentsTask = new Task(
    this,
    async () => {
      if (!this.searchTerm.trim()) return [];
      return await window.services.studentUseCase.getStudentsByFilters({
        search: this.searchTerm
      });
    },
    () => [this.searchTerm]
  );
  
  /**
   * Valores iniciales del formulario
   */
  private getInitialFormData() {
    const today = new Date().toISOString().split('T')[0];
    return {
      fecha: today,
      monto: '',
      type: PaymentType.EFECTIVO,
      estudianteId: '',
      status: PaymentStatus.PENDIENTE,
      file: ''
    };
  }
  
  /**
   * Maneja cambios en los campos del formulario
   */
  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    
    // Sanitizar la entrada para evitar SQL injection
    const sanitizedValue = this.sanitizeInput(value);
    
    this.formData = {
      ...this.formData,
      [name]: sanitizedValue
    };
    
    // Validar el campo actualizado
    this.validateField(name, sanitizedValue);
  }
  
  /**
   * Sanitiza un valor de entrada para prevenir SQL injection
   */
  private sanitizeInput(value: string): string {
    // Elimina caracteres potencialmente peligrosos
    return value.replace(/[;'"\\<>]/g, '');
  }
  
  /**
   * Valida un campo específico
   */
  private validateField(name: string, value: string) {
    const errors = { ...this.errors };
    
    switch (name) {
      case 'monto':
        if (!value) {
          errors[name] = 'El monto es requerido';
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          errors[name] = 'Ingrese un monto válido mayor a 0';
        } else {
          delete errors[name];
        }
        break;
        
      case 'fecha':
        if (!value) {
          errors[name] = 'La fecha es requerida';
        } else {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            errors[name] = 'Formato de fecha inválido (YYYY-MM-DD)';
          } else {
            delete errors[name];
          }
        }
        break;
        
      case 'estudianteId':
        if (!value && !this.selectedStudent) {
          errors[name] = 'Debe seleccionar un estudiante';
        } else {
          delete errors[name];
        }
        break;
        
      default:
        break;
    }
    
    this.errors = errors;
  }
  
  /**
   * Valida todo el formulario
   */
  private validateForm(): boolean {
    const { monto, fecha, estudianteId } = this.formData;
    
    // Validar cada campo
    this.validateField('monto', monto);
    this.validateField('fecha', fecha);
    this.validateField('estudianteId', estudianteId);
    
    // Verificar si hay errores
    return Object.keys(this.errors).length === 0;
  }
  
  /**
   * Busca estudiantes después de un breve retraso
   */
  private handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    
    // Sanitizar la búsqueda
    this.searchTerm = this.sanitizeInput(value);
    
    if (this.searchTerm.length >= 3) {
      this.loadStudentsTask.run();
    }
  }
  
  /**
   * Selecciona un estudiante y actualiza el formulario
   */
  private selectStudent(student: Student) {
    this.selectedStudent = student;
    this.formData = {
      ...this.formData,
      estudianteId: student.codigo
    };
    this.validateField('estudianteId', student.codigo);
    this.searchTerm = '';
  }
  
  /**
   * Envía el formulario para crear un nuevo pago
   */
  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.isSubmitting = true;
    
    try {
      // Si no tenemos el estudiante seleccionado completo, lo obtenemos por código
      if (!this.selectedStudent && this.formData.estudianteId) {
        try {
          this.selectedStudent = await window.services.studentUseCase.getStudentByCode(this.formData.estudianteId);
          if (!this.selectedStudent) {
            throw new Error(`No se encontró el estudiante con código ${this.formData.estudianteId}`);
          }
        } catch (error) {
          console.error('Error al obtener datos del estudiante:', error);
          throw new Error('No se pudo obtener la información completa del estudiante');
        }
      }
      
      if (!this.selectedStudent) {
        throw new Error('Se requiere seleccionar un estudiante válido');
      }
      
      // Crear el DTO para el pago, incluyendo la información completa del estudiante
      const paymentDto: CreatePaymentDto = {
        fecha: this.formData.fecha,
        monto: parseFloat(this.formData.monto),
        type: this.formData.type,
        status: this.formData.status,
        file: this.formData.file || null,
        estudianteId: this.selectedStudent.codigo,
        estudiante: {
          id: this.selectedStudent.id || '',
          nombre: this.selectedStudent.nombre,
          apellido: this.selectedStudent.apellido,
          codigo: this.selectedStudent.codigo,
          programaId: this.selectedStudent.programaId,
          foto: this.selectedStudent.foto
        }
      };
      
      console.log('Creando pago con estudiante completo:', paymentDto);
      
      // Llamar al caso de uso para crear el pago
      const result = await window.services.paymentUseCase.createPayment(paymentDto);
      
      console.log('Pago creado:', result);
      
      // Resetear el formulario
      this.formData = this.getInitialFormData();
      this.selectedStudent = null;
      
      // Llamar al callback de éxito (y dejar que sea el padre quien muestre la notificación)
      this.onSuccess();
      
    } catch (error) {
      console.error('Error al crear pago:', error);
      
      // Notificar error
      this.dispatchEvent(new CustomEvent('notification', {
        detail: {
          message: `Error al crear el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          type: 'error'
        },
        bubbles: true,
        composed: true
      }));
    } finally {
      this.isSubmitting = false;
    }
  }
  
  /**
   * Limpia el estudiante seleccionado
   */
  private clearSelectedStudent() {
    this.selectedStudent = null;
    this.formData = {
      ...this.formData,
      estudianteId: ''
    };
  }
  
  /**
   * Cierra el formulario
   */
  private cancel() {
    this.formData = this.getInitialFormData();
    this.selectedStudent = null;
    this.errors = {};
    this.onClose();
  }
  
  override render() {
    if (!this.isOpen) return html``;
    
    return html`
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="fas fa-plus-circle me-2"></i>
                Nuevo Pago
              </h5>
              <button type="button" class="btn-close btn-close-white" @click=${this.cancel}></button>
            </div>
            <div class="modal-body">
              <form @submit=${this.handleSubmit}>
                <!-- Búsqueda de estudiante -->
                <div class="mb-3">
                  <label class="form-label">Estudiante *</label>
                  
                  ${this.selectedStudent ? html`
                    <div class="d-flex align-items-center border rounded p-2 mb-2">
                      <div class="flex-grow-1">
                        <div class="fw-bold">${this.selectedStudent.nombre} ${this.selectedStudent.apellido}</div>
                        <div class="small text-muted">Código: ${this.selectedStudent.codigo}</div>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-secondary" @click=${this.clearSelectedStudent}>
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  ` : html`
                    <div class="mb-2">
                      <input 
                        type="text" 
                        class="form-control ${this.errors.estudianteId ? 'is-invalid' : ''}" 
                        placeholder="Buscar por nombre o código..." 
                        @input=${this.handleSearchChange}
                        .value=${this.searchTerm}
                      />
                      ${this.errors.estudianteId ? html`<div class="invalid-feedback">${this.errors.estudianteId}</div>` : ''}
                    </div>
                    
                    ${this.loadStudentsTask.render({
                      pending: () => this.searchTerm.length >= 3 ? html`
                        <div class="d-flex justify-content-center py-2">
                          <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Buscando...</span>
                          </div>
                        </div>
                      ` : '',
                      complete: (students) => {
                        if (this.searchTerm.length < 3) return html``;
                        
                        if (students.length === 0) {
                          return html`
                            <div class="alert alert-info py-2 small">
                              No se encontraron estudiantes con ese criterio
                            </div>
                          `;
                        }
                        
                        return html`
                          <div class="list-group small" style="max-height: 200px; overflow-y: auto;">
                            ${students.map(student => html`
                              <button 
                                type="button"
                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                @click=${() => this.selectStudent(student)}
                              >
                                <div>
                                  <span class="fw-bold">${student.nombre} ${student.apellido}</span>
                                  <small class="d-block text-muted">Programa: ${student.programaId}</small>
                                </div>
                                <span class="badge bg-primary rounded-pill">${student.codigo}</span>
                              </button>
                            `)}
                          </div>
                        `;
                      },
                      error: (error) => html`
                        <div class="alert alert-danger py-2 small">
                          Error al buscar estudiantes: ${error.message}
                        </div>
                      `
                    })}
                  `}
                </div>
                
                <!-- Fecha del pago -->
                <div class="mb-3">
                  <label for="fecha" class="form-label">Fecha *</label>
                  <input 
                    type="date" 
                    class="form-control ${this.errors.fecha ? 'is-invalid' : ''}" 
                    id="fecha" 
                    name="fecha"
                    .value=${this.formData.fecha}
                    @input=${this.handleInputChange}
                  />
                  ${this.errors.fecha ? html`<div class="invalid-feedback">${this.errors.fecha}</div>` : ''}
                </div>
                
                <!-- Monto del pago -->
                <div class="mb-3">
                  <label for="monto" class="form-label">Monto *</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input 
                      type="number" 
                      class="form-control ${this.errors.monto ? 'is-invalid' : ''}" 
                      id="monto" 
                      name="monto"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      .value=${this.formData.monto}
                      @input=${this.handleInputChange}
                    />
                    ${this.errors.monto ? html`<div class="invalid-feedback">${this.errors.monto}</div>` : ''}
                  </div>
                </div>
                
                <!-- Tipo de pago -->
                <div class="mb-3">
                  <label for="type" class="form-label">Tipo de Pago *</label>
                  <select 
                    class="form-select" 
                    id="type" 
                    name="type"
                    .value=${this.formData.type}
                    @change=${this.handleInputChange}
                  >
                    ${Object.values(PaymentType).map(type => html`
                      <option value=${type}>${this.formatPaymentType(type)}</option>
                    `)}
                  </select>
                </div>
                
                <!-- Estado -->
                <div class="mb-3">
                  <label for="status" class="form-label">Estado *</label>
                  <select 
                    class="form-select" 
                    id="status" 
                    name="status"
                    .value=${this.formData.status}
                    @change=${this.handleInputChange}
                  >
                    <option value=${PaymentStatus.PENDIENTE}>Pendiente</option>
                    <option value=${PaymentStatus.PAGADO}>Pagado</option>
                    <option value=${PaymentStatus.CREADO}>Creado</option>
                  </select>
                </div>
                
                <!-- Enlace al comprobante -->
                <div class="mb-3">
                  <label for="file" class="form-label">Enlace al Comprobante (opcional)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="file" 
                    name="file"
                    placeholder="https://..."
                    .value=${this.formData.file}
                    @input=${this.handleInputChange}
                  />
                  <div class="form-text">URL del comprobante de pago (si está disponible)</div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click=${this.cancel}
                ?disabled=${this.isSubmitting}
              >
                <i class="fas fa-times me-1"></i> Cancelar
              </button>
              <button 
                type="button" 
                class="btn btn-primary" 
                @click=${this.handleSubmit}
                ?disabled=${this.isSubmitting}
              >
                ${this.isSubmitting ? html`
                  <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Guardando...
                ` : html`
                  <i class="fas fa-save me-1"></i> Guardar
                `}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Formatea el tipo de pago para mostrar
   */
  private formatPaymentType(type: PaymentType): string {
    switch (type) {
      case PaymentType.EFECTIVO: return 'Efectivo';
      case PaymentType.TRANSFERENCIA: return 'Transferencia';
      case PaymentType.CHEQUE: return 'Cheque';
      case PaymentType.TARJETA: return 'Tarjeta';
      case PaymentType.OTRO: return 'Otro';
      default: return type;
    }
  }
} 