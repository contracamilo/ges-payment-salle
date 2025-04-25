# Storybook para Sistema de Gestión de Pagos Educativos

Este proyecto utiliza Storybook para visualizar y probar los componentes de UI de manera aislada, permitiendo un desarrollo más eficiente y facilitando la documentación de los componentes.

## Cómo ejecutar Storybook

Para iniciar Storybook en modo desarrollo:

```bash
npm run storybook
```

Esto abrirá Storybook en tu navegador en la dirección `http://localhost:6006`.

## Componentes documentados

Actualmente, los siguientes componentes están documentados en Storybook:

- **AppHeader**: Barra de navegación principal de la aplicación.
- **StudentForm**: Formulario para crear y editar estudiantes.

## Estructura de archivos

Las historias de Storybook se encuentran en la carpeta `src/stories`. Cada historia tiene su propio archivo `.stories.js` o `.stories.ts`.

## Configuración

La configuración de Storybook se encuentra en la carpeta `.storybook`:

- `main.js`: Configuración principal (historias, addons, etc.)
- `preview.js`: Configuración global para todas las historias (estilos, decoradores, etc.)

## Buenas prácticas

1. **Mantén las historias simples**: Cada historia debe mostrar una variante específica de un componente.
2. **Proporciona datos de ejemplo**: Utiliza mocks para los datos y servicios necesarios.
3. **Documenta los componentes**: Incluye descripciones claras para cada componente y sus variantes.

## Notas importantes

- Storybook está configurado para trabajar con componentes web (Lit) y Vite.
- Los servicios globales (como Router y servicios de API) están mockeados para facilitar el desarrollo y pruebas.

## Recursos adicionales

- [Documentación oficial de Storybook](https://storybook.js.org/docs/web-components/get-started/introduction)
- [Guía de componentes web con Storybook](https://storybook.js.org/docs/web-components/get-started/introduction) 