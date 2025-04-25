# Sistema de Gestión de Pagos Educativos - Frontend

Este proyecto implementa una interfaz de usuario para un sistema de gestión de pagos educativos, permitiendo administrar estudiantes y sus pagos respectivos. Está desarrollado con LitElement y TypeScript siguiendo la arquitectura hexagonal (puertos y adaptadores).

## Características Principales

- **Gestión de Estudiantes**: Listar, crear, editar y eliminar estudiantes
- **Gestión de Pagos**: Listar, crear, actualizar y visualizar pagos educativos
- **Filtros Avanzados**: Filtrar estudiantes por código, programa y pagos por fecha, estado, tipo
- **Interfaz Responsiva**: Adaptable a diferentes tamaños de pantalla
- **Arquitectura Hexagonal**: Separación clara entre dominio, aplicación e infraestructura

## Tecnologías Utilizadas

- **LitElement**: Framework para crear componentes web
- **TypeScript**: Lenguaje de programación tipado
- **Vite**: Empaquetador y servidor de desarrollo
- **CSS Variables**: Sistema de diseño consistente mediante variables CSS

## Arquitectura del Proyecto

El proyecto implementa la arquitectura hexagonal (también conocida como puertos y adaptadores), que separa claramente el dominio central de la aplicación de los detalles de implementación:

```
src/
│
├── domain/              # Capa de dominio - Modelos y reglas de negocio
│   └── models/          # Entidades y objetos de valor
│
├── application/         # Capa de aplicación - Casos de uso
│   ├── ports/           # Definición de puertos (interfaces)
│   └── use-cases/       # Implementación de casos de uso
│
└── infrastructure/      # Capa de infraestructura - Adaptadores
    └── adapters/
        ├── api/         # Adaptadores para la API REST
        └── ui/          # Adaptadores para la interfaz de usuario
            ├── components/  # Componentes reutilizables
            ├── pages/       # Páginas de la aplicación
            └── router/      # Sistema de enrutamiento
```

### Capas de la Arquitectura

1. **Dominio**: Contiene las entidades principales (Student, Payment) y las reglas de negocio asociadas. Esta capa no depende de ninguna otra.

2. **Aplicación**: Implementa los casos de uso específicos de la aplicación, orquestando las entidades del dominio. Define puertos (interfaces) que deben ser implementados por adaptadores.

3. **Infraestructura**: Contiene adaptadores que implementan los puertos definidos en la capa de aplicación. Aquí se encuentran detalles específicos como la comunicación con la API REST o los componentes de UI.

## Estructura del Código

- **Modelos de Dominio**: Definen las entidades principales (Student, Payment) y sus propiedades.
- **Repositorios**: Interfaces (puertos) que definen cómo se accede a los datos.
- **Adaptadores API**: Implementan los repositorios conectándose a la API REST.
- **Componentes UI**: Implementan la interfaz de usuario utilizando LitElement.

## Requisitos

- Node.js 14+
- NPM o Yarn

## Instalación

1. Clonar el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
cd u-front-end
```

2. Instalar dependencias:

```bash
npm install
# o
yarn install
```

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

4. Abrir el navegador en `http://localhost:3000`

## Compilación para Producción

```bash
npm run build
# o
yarn build
```

## Uso de la Aplicación

### Vista de Estudiantes

- Muestra una tabla con todos los estudiantes registrados
- Permite filtrar por código de estudiante o programa académico
- Ofrece acciones para editar, eliminar o ver los pagos de cada estudiante
- Incluye un botón para crear nuevos estudiantes

### Vista de Pagos

- Muestra una tabla con todos los pagos ordenados por fecha
- Permite filtrar por fecha, estado, tipo y código de estudiante
- Ofrece acciones para editar pagos o ver detalles completos
- Incluye un modal de detalles con información completa del pago

## Desarrollo

### Convenciones y Patrones

- **Nombres de componentes**: Utilizamos kebab-case para elementos HTML personalizados
- **Decoradores**: Usamos decoradores de LitElement para definir propiedades y metadatos
- **Estados**: Utilizamos el decorador `@state()` para propiedades internas de componentes
- **Propiedades**: Usamos el decorador `@property()` para propiedades expuestas
- **Eventos**: Seguimos el patrón de eventos de DOM para la comunicación entre componentes

### Extensión del Proyecto

Para extender el proyecto, sigue estos pasos:

1. **Nuevos Modelos de Dominio**: Añade las interfaces en `domain/models/`
2. **Nuevos Repositorios**: Define interfaces en `application/ports/`
3. **Nuevos Casos de Uso**: Implementa la lógica en `application/use-cases/`
4. **Adaptadores API**: Implementa los repositorios en `infrastructure/adapters/api/`
5. **Componentes UI**: Crea nuevos componentes en `infrastructure/adapters/ui/components/`

## Estructura de Directorios Detallada

```
u-front-end/
├── src/
│   ├── domain/
│   │   └── models/
│   │       ├── student.model.ts    # Modelo de estudiante
│   │       ├── payment.model.ts    # Modelo de pago
│   │       └── filters.model.ts    # Modelos para filtros
│   │
│   ├── application/
│   │   ├── ports/
│   │   │   ├── student.repository.ts  # Puerto para repositorio de estudiantes
│   │   │   └── payment.repository.ts  # Puerto para repositorio de pagos
│   │   │
│   │   └── use-cases/
│   │       ├── student.use-case.ts    # Casos de uso para estudiantes
│   │       └── payment.use-case.ts    # Casos de uso para pagos
│   │
│   ├── infrastructure/
│   │   └── adapters/
│   │       ├── api/
│   │       │   ├── api.config.ts      # Configuración de la API
│   │       │   ├── student.api.ts     # Implementación del repositorio de estudiantes
│   │       │   └── payment.api.ts     # Implementación del repositorio de pagos
│   │       │
│   │       └── ui/
│   │           ├── components/        # Componentes reutilizables
│   │           ├── pages/             # Páginas completas
│   │           └── router/            # Sistema de enrutamiento
│   │
│   ├── assets/
│   │   └── styles/                    # Estilos globales
│   │
│   └── main.ts                        # Punto de entrada de la aplicación
│
├── index.html                         # HTML principal
├── package.json                       # Dependencias y scripts
├── tsconfig.json                      # Configuración de TypeScript
├── vite.config.ts                     # Configuración de Vite
└── README.md                          # Documentación
```

## Licencia

[MIT](LICENSE)

## Contacto

Para más información, contactar a [tu-email@dominio.com].
