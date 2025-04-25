// Importar CSS de Bootstrap
import './styles/main.css';

// Importar todas las funcionalidades de Bootstrap
import * as bootstrap from 'bootstrap';

// Hacer bootstrap disponible globalmente
window.bootstrap = bootstrap;

// Función auxiliar para inicializar Bootstrap en componentes específicos
const initializeBootstrapElements = () => {
  // Inicializar tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Inicializar popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Inicializar dropdowns
  const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
  dropdownElementList.map(function (dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl);
  });

  // Asegurarse de que los modales se puedan cerrar
  const modalElementList = [].slice.call(document.querySelectorAll('.modal'));
  modalElementList.map(function (modalEl) {
    return new bootstrap.Modal(modalEl);
  });

  // Inicializar collapses
  const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'));
  collapseElementList.map(function (collapseEl) {
    return new bootstrap.Collapse(collapseEl, {
      toggle: false
    });
  });
};

// Hacer la función de inicialización disponible globalmente
window.initializeBootstrapElements = initializeBootstrapElements;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  initializeBootstrapElements();
  
  // Observar cambios en el DOM para inicializar elementos Bootstrap en componentes que se renderizen dinámicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        initializeBootstrapElements();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}); 