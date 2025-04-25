# Configuración de Linting y Formateo de Código

Este proyecto utiliza ESLint y Prettier para mantener un código limpio y consistente. Además, se han configurado hooks de pre-commit con Husky y lint-staged para garantizar que el código cumpla con los estándares antes de ser confirmado.

## Herramientas Utilizadas

- **ESLint**: Para la detección de problemas en el código
- **Prettier**: Para el formateo automático del código
- **Husky**: Para configurar los hooks de git
- **lint-staged**: Para ejecutar comandos solo en los archivos que se van a confirmar

## Reglas de Linting

El proyecto sigue las reglas recomendadas de ESLint y TypeScript, con algunas modificaciones:

- Se permite el uso de `any` para flexibilidad en ciertos casos
- Advertencias para `console.log()` (permitidos `console.warn()` y `console.error()`)
- Semicolons obligatorios
- Comillas simples por defecto
- Varias reglas de TypeScript desactivadas o configuradas como advertencias

## Scripts Disponibles

```bash
# Ejecutar linting en todos los archivos
npm run lint

# Formatear todos los archivos
npm run format
```

## Hooks de Pre-commit

Cuando haces un commit, se ejecutarán automáticamente:

1. ESLint con corrección automática en los archivos `.ts` y `.js` modificados
2. Prettier para formatear los archivos `.ts`, `.js`, `.html` y `.css` modificados

Si alguno de estos procesos falla, el commit será rechazado.

## Configuración Manual

Si necesitas desactivar temporalmente estos hooks, puedes usar:

```bash
git commit --no-verify -m "tu mensaje"
```

## Resolver Problemas Comunes

### Error: "no-explicit-any"

Si recibes advertencias por usar `any`, esto es normal y esperado. La regla está configurada como advertencia por diseño, permitiéndote usar `any` cuando sea necesario.

### Problemas con Prettier y ESLint

Si hay conflictos entre Prettier y ESLint, Prettier tiene prioridad para reglas de formato. Puedes ejecutar:

```bash
npm run format
npm run lint
```

## Personalización

Si necesitas modificar las reglas:

- `.eslintrc.cjs`: Configuración general de ESLint
- `src/.eslintrc.json`: Configuración específica para archivos en src/
- `.prettierrc`: Configuración de Prettier 