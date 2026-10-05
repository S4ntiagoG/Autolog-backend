# AutoLog Frontend

AutoLog es un sistema de recepción y control de vehículos para un taller mecánico. Permite registrar clientes, asociar vehículos y crear órdenes de servicio con motivo de ingreso, observaciones del cliente y evidencia fotográfica.

Aplicación Angular para la recepción de vehículos, la gestión visual del taller y el portal de consulta del cliente.

El proyecto completo está dividido en dos partes:

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
4. Consultar el historial de mantenimientos del vehículo

La aplicación permite capturar la información inicial del ingreso, consultar vehículos desde el portal cliente y visualizar sus mantenimientos registrados.

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
└── ../backend/postman/ # Colección de pruebas
```

## Flujo de integración frontend-backend

La interfaz no expone un único endpoint de intake. En su lugar, el frontend realiza una secuencia de llamadas HTTP para conservar la estructura de datos del backend:

1. `POST /api/clients`
2. `POST /api/vehicles` usando el `id` del cliente creado
3. `POST /api/service-orders` usando el `id` del vehículo creado

Esta secuencia está implementada en `src/app/features/vehicle-intake/services/vehicle-intake.service.ts`.

### Evidencia fotográfica del ingreso

El formulario acepta hasta cinco imágenes: frontal, lado derecho, trasera, odómetro y evidencia adicional. Solo se aceptan JPG, PNG y WebP, con un límite de 10 MB por imagen. El navegador conserva una vista previa mientras se completa el formulario.

Después de crear la orden, el frontend envía los archivos seleccionados como `multipart/form-data` a `POST /api/service-orders/{id}/evidence`. No se almacenan los bytes en PostgreSQL: el backend escribe cada imagen en `backend/uploads/service-orders/{id}/` con un nombre único, y la orden conserva en sus campos `photoFront`, `photoRightSide`, `photoBack`, `photoOdometer` y `photoExtra` las rutas relativas de los archivos.

### Portal del cliente

1. El cliente ingresa la placa y el documento.
2. Angular llama a `POST /api/vehicles/search`.
3. El backend devuelve el vehículo y el estado de su orden más reciente.
4. Angular consulta `GET /api/service-orders/vehicle/{vehicleId}`.
5. La pantalla muestra el historial ordenado por fecha, con motivo, fecha, kilometraje, observaciones, total y estado de cada servicio. El historial se actualiza cada 15 segundos mientras el portal está abierto.
6. El enlace `Detalles` abre `/client/service-orders/{id}`, donde el cliente puede revisar la evidencia fotográfica, datos del vehículo, tareas, repuestos, mano de obra y resumen de costos. `Descargar factura` abre el diálogo de impresión del navegador, desde donde se puede imprimir o guardar como PDF.

El detalle usa el estado guardado en la orden (`PENDIENTE`, `EN PROGRESO` o `LISTO`). Si una orden antigua no tiene imágenes almacenadas, se indica que no se cargó evidencia para ese ingreso.

La vista del detalle incluye navegación de regreso al portal, estado resaltado por color, placa con el estilo compartido de las vistas de vehículos, número de orden legible y tareas presentadas como lista. La acción de factura utiliza la vista de impresión del navegador; esta genera una impresión/PDF del detalle y no crea ni descarga un archivo PDF en el servidor.

### Orden de trabajo mecánico

Desde la vista de vehículos o el tablero mecánico se accede a `service-orders/vehicle/{vehicleId}/work`. Allí se puede actualizar el estado y guardar las tareas con su condición de completadas, repuestos e insumos con cantidades y precio unitario, y mano de obra con horas y tarifa. El diagnóstico, kilometraje y observaciones iniciales son de solo lectura en esta vista; se editan desde el ingreso del vehículo.

El resumen muestra los subtotales de repuestos y mano de obra, calcula los insumos del taller como el 5% de repuestos/insumos y no vuelve a sumar el IVA cuando ya está incluido en los precios.

## Reglas de negocio importantes

- Un vehículo siempre debe pertenecer a un cliente existente.
- Una orden de servicio siempre debe estar asociada a un vehículo existente.
- La fecha de ingreso usa formato ISO: `YYYY-MM-DD`.
- Las evidencias fotográficas se envían al backend tras crear la orden; los nombres de archivo se generan en el servidor y las rutas relativas se guardan en la orden.
- Los archivos locales bajo `backend/uploads/` no se deben borrar mientras la base de datos conserve sus rutas. Incluye esa carpeta en los respaldos y no la publiques en Git.
- Los catálogos de formularios están centralizados en la capa de frontend porque la API no expone endpoints de catálogo.
- El formulario de intake no captura precios. Los precios de mano de obra y repuestos/insumos se registran desde la orden de trabajo.

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
| GET | `/api/service-orders/vehicle/{vehicleId}` | Consulta el historial del vehículo |
| POST | `/api/vehicles/search` | Busca un vehículo por placa y documento |

## Rutas del frontend

La aplicación Angular define estas vistas principales en la configuración de rutas:

| Ruta | Descripción |
|---|---|
| `/vehicle-intake` | Pantalla de ingreso de vehículo y cliente para crear la recepción del taller |
| `/service-orders/:id/edit` | Edición de una orden de servicio existente |
| `/vehicles` | Lista general de vehículos registrados |
| `/mechanic/vehicles` | Acceso alternativo al listado del mecánico |
| `/client/search` | Consulta de vehículo para el cliente |
| `/client/home` | Portal del cliente e historial de mantenimientos |
| `/client/service-orders/:id` | Detalle del servicio para el cliente, evidencia y vista de impresión |
| `/service-orders/vehicle/:vehicleId/work` | Orden de trabajo mecánico |
| `**` | Redirige a `/client/search` cuando la ruta no existe |

Estas rutas se configuran en `src/app/app.routes.ts` y la aplicación inicia en la búsqueda del vehículo del portal cliente.

## Historial y costos

El frontend recibe `serviceCost` como un valor opcional en cada elemento del historial. Si el backend todavía no tiene un total registrado, muestra `Sin costo registrado`. El detalle calcula subtotales a partir de repuestos e insumos y mano de obra, agrega insumos del taller al 5% de repuestos/insumos y trata el IVA como incluido en los precios, sin adicionarlo de nuevo.

El intake no captura precios: los precios se registran en la orden de trabajo.

## Ejemplo de estructura JSON para crear una orden

```json
{
  "entryDate": "2026-08-25",
  "primaryReason": "Mantenimiento preventivo",
  "currentMileage": 5000,
  "customerObservations": "Revisar frenos y aceite",
  "vehicle": {
    "id": 6
  }
}
```

Las fotos no se envían como nombres en este JSON. Se cargan después, como archivos multipart, usando los campos `photoFront`, `photoRightSide`, `photoBack`, `photoOdometer` y `photoExtra`.

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
