import { LitElement } from 'lit';

/**
 * Componente base que extiende LitElement y deshabilita el Shadow DOM
 * para que los estilos de Bootstrap puedan aplicarse directamente a todos los componentes
 */
export class BaseComponent extends LitElement {
  /**
   * Deshabilita el Shadow DOM para permitir que los estilos globales de Bootstrap se apliquen
   * a todos los componentes que extiendan esta clase base
   */
  override createRenderRoot() {
    return this;
  }
}
