# AutoLog

AutoLog es un sistema de recepción y control de vehículos para un taller mecánico. Permite registrar clientes, asociar vehículos y crear órdenes de servicio con motivo de ingreso, observaciones del cliente y evidencia fotográfica.

El proyecto está dividido en dos partes:

- Backend: API REST en Java + Spring Boot + PostgreSQL
- Frontend: aplicación Angular para la captura de ingresos y consulta de vehículos/órdenes

## Stack tecnológico

### Backend
- Java 25
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- PostgreSQL 16
- Gradle
- Docker Compose

### Frontend
- Angular 20
- TypeScript
- Standalone components
- Tailwind CSS
- RxJS

## Objetivo del sistema

El flujo principal del negocio es:

1. Registrar un cliente
2. Registrar un vehículo asociado a ese cliente
3. Crear una orden de servicio del vehículo
4. Consultar el historial de vehículos y órdenes

La aplicación permite capturar la información inicial del ingreso del vehículo y dejarla lista para que el personal del taller la revise posteriormente.

## Arquitectura del proyecto

```text
Autolog-backend/
├── backend/          # API REST y persistencia
│   ├── src/main/java
│   ├── src/test/java
│   ├── docker-compose.yml
│   ├── build.gradle
│   └── gradlew
├── frontend/         # Aplicación Angular
│   ├── src/app
│   ├── package.json
│   └── proxy.conf.json
└── postman/          # Colección de pruebas
```

## Flujo de integración frontend-backend

La interfaz no expone un único endpoint de intake. En su lugar, el frontend realiza una secuencia de llamadas HTTP para conservar la estructura de datos del backend:

1. `POST /api/clients`
2. `POST /api/vehicles` usando el `id` del cliente creado
3. `POST /api/service-orders` usando el `id` del vehículo creado

Esta secuencia está implementada en `src/app/features/vehicle-intake/services/vehicle-intake.service.ts`.

## Reglas de negocio importantes

- Un vehículo siempre debe pertenecer a un cliente existente.
- Una orden de servicio siempre debe estar asociada a un vehículo existente.
- La fecha de ingreso usa formato ISO: `YYYY-MM-DD`.
- El backend no gestiona archivos multipart; la aplicación valida y previsualiza imágenes localmente, y solo envía cadenas con nombres de archivo a los campos `photoFront`, `photoRightSide`, `photoBack`, `photoOdometer` y `photoExtra`.
- Los catálogos de formularios están centralizados en la capa de frontend porque la API no expone endpoints de catálogo.

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Java 25
- Node.js 20+ y npm
- Docker Desktop
- Git
- Postman (opcional, para pruebas manuales)

## Ejecución en local

### 1. Levantar la base de datos

Desde la carpeta `backend`:

```powershell
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` con estas credenciales:

- Base de datos: `autolog_db`
- Usuario: `autolog`
- Contraseña: `autolog1234`

### 2. Ejecutar el backend

Desde `backend`:

```powershell
./gradlew bootRun
```

En Windows también puedes usar:

```powershell
.\gradlew.bat bootRun
```

La API queda disponible en:

```text
http://localhost:8080
```

### 3. Ejecutar el frontend

Desde la carpeta `frontend`:

```powershell
npm install
npm start
```

La aplicación queda en:

```text
http://localhost:4200/
```

El proxy de Angular reenvía las solicitudes `/api` a `http://localhost:8080`.

## Endpoints principales del backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clients` | Lista clientes |
| POST | `/api/clients` | Crea un cliente |
| GET | `/api/clients/{id}` | Consulta un cliente por ID |
| GET | `/api/vehicles` | Lista vehículos |
| POST | `/api/vehicles` | Crea un vehículo |
| GET | `/api/vehicles/{id}` | Consulta un vehículo por ID |
| GET | `/api/service-orders` | Lista órdenes de servicio |
| POST | `/api/service-orders` | Crea una orden de servicio |
| GET | `/api/service-orders/{id}` | Consulta una orden por ID |

## Rutas del frontend

La aplicación Angular define estas vistas principales en la configuración de rutas:

| Ruta | Descripción |
|---|---|
| `/vehicle-intake` | Pantalla de ingreso de vehículo y cliente para crear la recepción del taller |
| `/vehicles` | Lista general de vehículos registrados |
| `**` | Redirige a `/vehicle-intake` cuando la ruta no existe |

Estas rutas se configuran en `src/app/app.routes.ts` y la aplicación inicia en la vista de recepción del vehículo.

## Ejemplo de estructura JSON para crear una orden

```json
{
  "entryDate": "2026-08-25",
  "primaryReason": "Mantenimiento preventivo",
  "currentMileage": 5000,
  "customerObservations": "Revisar frenos y aceite",
  "photoFront": "frente.jpg",
  "photoRightSide": "lado-derecho.jpg",
  "photoBack": "trasera.jpg",
  "photoOdometer": "odometro.jpg",
  "photoExtra": "extra.jpg",
  "vehicle": {
    "id": 6
  }
}
```

## Pruebas y validación

### Backend

```powershell
./gradlew test
```

### Frontend

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Colección de Postman

La carpeta `backend/postman` incluye la colección `AutoLog.postman_collection.json`, útil para probar los endpoints en secuencia y automatizar la creación de cliente, vehículo y orden.

## Observaciones del proyecto

- El proyecto está orientado a una recepción de vehículos en taller.
- La lógica de negocio principal está enfocada en la captura de ingreso y la relación cliente-vehículo-orden.
- La interfaz está diseñada para una experiencia rápida de alta usabilidad en una operación de recepción.
