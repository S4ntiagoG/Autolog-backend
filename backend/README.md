# AutoLog Backend

API REST para clientes, vehículos, órdenes de servicio e historial de mantenimientos.

## Arquitectura

El backend está organizado en capas:

- `controller`: endpoints HTTP bajo `/api`.
- `service`: reglas de reutilización, validación y consultas.
- `repository`: interfaces Spring Data JPA.
- `model`: entidades `Client`, `Vehicle`, `ServiceOrder`, `Admin` y `Mecanico`, además de los componentes embebidos `ServiceTask`, `ServicePart` y `ServiceLabor` de una orden.
- `dto`: respuestas y solicitudes específicas del portal cliente.

La relación principal es `Client 1:N Vehicle 1:N ServiceOrder`.

Cada orden puede guardar diagnóstico mecánico, estado, tareas (incluido si están completadas), repuestos/insumos, mano de obra y rutas de evidencia fotográfica.

## Requisitos

- Java 25.
- Docker Desktop.
- Postman opcional.

## Ejecución local

### 1. Levantar PostgreSQL

Desde la carpeta raiz del proyecto:

```powershell
docker compose up -d
```

La base de datos queda disponible en `localhost:5432` con estos datos:

- Base de datos: `autolog_db`
- Usuario: `autolog`
- Contrasena: `autolog1234`

### 2. Ejecutar el backend

En otra terminal, desde la misma carpeta:

```powershell
./gradlew bootRun
```

En Windows tambien puede ejecutarse:

```powershell
.\gradlew.bat bootRun
```

La API queda disponible en:

```text
http://localhost:8080
```

### 3. Probar con Postman

Importar el archivo `postman/AutoLog.postman_collection.json` en Postman.

Ejecutar las solicitudes en este orden:

1. `POST - Crear cliente`
2. `GET - Listar clientes`
3. `GET - Buscar cliente creado`
4. `POST - Crear vehiculo`
5. `GET - Listar vehiculos`
6. `GET - Buscar vehiculo creado`
7. `POST - Crear orden de servicio`
8. `GET - Listar ordenes`
9. `GET - Buscar orden creada`

La coleccion guarda automaticamente los IDs creados en las variables `clientId`, `vehicleId` y `serviceOrderId`. Por eso no es necesario escribir IDs manualmente.

## Requests manuales

En todos los `POST`, seleccionar `Body > raw > JSON` y agregar el header `Content-Type: application/json`.

### Crear cliente

```text
POST http://localhost:8080/api/clients
```

```json
{
	"name": "Ana Torres",
	"identificationNumber": "1098765432",
	"email": "ana.torres@email.com",
	"phone": "3001234567"
}
```

Respuesta esperada: `201 Created`. Si el correo o el documento ya pertenecen a un cliente, la API devuelve ese cliente con su ID existente en lugar de crear otro. Copiar el `id` de la respuesta para usarlo como `client.id` al crear el vehiculo.

### Consultar clientes

```text
GET http://localhost:8080/api/clients
GET http://localhost:8080/api/clients/{clientId}
```

Los `GET` no llevan body ni JSON.

### Crear vehiculo

Reemplazar `1` por un `client.id` que exista.

```text
POST http://localhost:8080/api/vehicles
```

```json
{
	"vehicleType": "Motocicleta",
	"brand": "Yamaha",
	"model": "FZ 2.0",
	"plate": "XYZ789",
	"chassisNumber": "VIN-XYZ-789",
	"vehicleYear": 2024,
	"client": {
		"id": 1
	}
}
```

Respuesta esperada: `201 Created`. Si la placa o el VIN ya pertenecen a un vehiculo asociado al mismo cliente, la API devuelve ese vehiculo con su ID existente. Copiar el `id` de la respuesta para usarlo como `vehicle.id` al crear una nueva orden.

### Consultar vehiculos

```text
GET http://localhost:8080/api/vehicles
GET http://localhost:8080/api/vehicles/{vehicleId}
```

### Crear orden de servicio

Reemplazar `6` por un `vehicle.id` que exista.

```text
POST http://localhost:8080/api/service-orders
```

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

Respuesta esperada: `201 Created`. La fecha debe usar el formato `YYYY-MM-DD` y `vehicle.id` debe existir. Las fotos, si se adjuntan, se envían después con el endpoint multipart de evidencia.

### Consultar ordenes

```text
GET http://localhost:8080/api/service-orders
GET http://localhost:8080/api/service-orders/{serviceOrderId}
```

### Consultar historial de un vehículo

```text
GET http://localhost:8080/api/service-orders/vehicle/{vehicleId}
```

La respuesta contiene las órdenes del vehículo ordenadas de forma descendente por fecha e ID:

```json
[
	{
		"serviceOrderId": 12,
		"entryDate": "2026-08-25",
		"primaryReason": "Mantenimiento preventivo",
		"currentMileage": 5000,
		"customerObservations": "Revisar frenos y aceite",
		"serviceCost": null,
		"status": "PENDIENTE"
	}
]
```

Cada elemento del historial incluye el estado guardado de esa orden. La búsqueda del portal (`POST /api/vehicles/search`) devuelve también el estado real de la orden más reciente; si no hay orden, devuelve `SIN ORDEN`.

## Orden de trabajo mecánico

`PUT /api/service-orders/{id}` actualiza los campos que envía, incluyendo `status`, `mechanicDiagnosis`, `tasks`, `parts`, `labor` y `serviceCost`. Las listas pueden tener cero o más elementos. Ejemplo:

```json
{
  "status": "EN PROGRESO",
  "mechanicDiagnosis": "Se identificó desgaste en las pastillas.",
  "tasks": [
    { "description": "Reemplazar pastillas de freno", "completed": false }
  ],
  "parts": [
    { "name": "Pastillas de freno", "partNumber": "PF-001", "quantity": 1, "unitPrice": 85000 }
  ],
  "labor": [
    { "description": "Cambio de pastillas", "hours": 1.5, "rate": 40000 }
  ],
  "serviceCost": 152250
}
```

Los estados de trabajo usados por la aplicación son `PENDIENTE`, `EN PROGRESO` y `LISTO`. La interfaz calcula los subtotales de partes e insumos y mano de obra; suma insumos de taller al 5% de partes/insumos. El IVA se considera incluido en los precios de partes/insumos y no se suma otra vez.

## Evidencia fotográfica

Las imágenes se cargan como archivos multipart, separadas de la creación de la orden:

```text
POST http://localhost:8080/api/service-orders/{id}/evidence
Content-Type: multipart/form-data
```

Los campos opcionales son `photoFront`, `photoRightSide`, `photoBack`, `photoOdometer` y `photoExtra`. Se aceptan JPG/JPEG, PNG y WebP, hasta 10 MiB por archivo; además de MIME, el backend comprueba la firma básica del contenido. Los límites de petición multipart están configurados en `src/main/resources/application.yaml` (10 MB por archivo y 50 MB por solicitud).

Los archivos se guardan por orden en `uploads/service-orders/{id}/` bajo el directorio de ejecución configurado por `autolog.upload-dir` (por defecto `uploads`). El nombre es generado con UUID y la base de datos conserva una ruta relativa en el campo de foto correspondiente. La carpeta `uploads/` está ignorada por Git: debe incluirse en los respaldos y conservarse junto con la base de datos.

Para recuperar una imagen:

```text
GET http://localhost:8080/api/service-orders/{id}/evidence/{slot}
```

`slot` puede ser `front`, `right-side`, `back`, `odometer` o `extra`. Si la orden no existe, la imagen no está guardada o la ruta no es válida, el endpoint responde `404`.

## Endpoints

| Metodo | Ruta | Resultado esperado |
|---|---|---|
| GET | `/api/clients` | Lista de clientes |
| POST | `/api/clients` | `201 Created`; crea o reutiliza por correo/documento |
| GET | `/api/clients/{id}` | Cliente por ID |
| PUT | `/api/clients/{id}` | Actualiza un cliente |
| DELETE | `/api/clients/{id}` | Elimina un cliente |
| GET | `/api/vehicles` | Lista de vehiculos |
| POST | `/api/vehicles` | `201 Created`; crea o reutiliza por placa/VIN para el mismo cliente |
| GET | `/api/vehicles/{id}` | Vehiculo por ID |
| PUT | `/api/vehicles/{id}` | Actualiza un vehiculo |
| DELETE | `/api/vehicles/{id}` | Elimina un vehiculo |
| GET | `/api/service-orders` | Lista de ordenes |
| POST | `/api/service-orders` | `201 Created` |
| GET | `/api/service-orders/{id}` | Orden por ID |
| GET | `/api/service-orders/vehicle/{vehicleId}` | Historial del vehículo |
| POST | `/api/service-orders/{id}/evidence` | Carga evidencias de la orden como multipart |
| GET | `/api/service-orders/{id}/evidence/{slot}` | Devuelve una evidencia de la orden |
| PUT | `/api/service-orders/{id}` | Actualiza datos de la orden |
| DELETE | `/api/service-orders/{id}` | Elimina la orden |
| POST | `/api/vehicles/search` | Busca vehículo por placa y documento |

## Datos importantes

- Todos los requests con body deben usar `Content-Type: application/json`.
- El ingreso busca primero al cliente por correo o documento; solo crea uno si no encuentra coincidencias.
- Luego busca el vehiculo por placa o VIN y lo reutiliza si ya esta asociado al mismo cliente; solo crea uno si no encuentra coincidencias.
- Cada ingreso crea una nueva orden asociada al ID del vehiculo devuelto, incluso cuando se reutilizan cliente y vehiculo.
- El vehiculo necesita un cliente existente.
- La orden necesita un vehiculo existente dentro de `vehicle.id`.
- `entryDate` usa el formato `YYYY-MM-DD`.
- `serviceCost` existe como total persistido del mantenimiento, pero no se captura en el formulario de intake.
- El costo se puede guardar desde la orden de trabajo, junto con el estado, tareas, repuestos/insumos y mano de obra.
- Las tareas, repuestos/insumos y mano de obra se persisten dentro de la orden.
- El detalle de cliente consume `GET /api/service-orders/{id}` y puede recuperar las imágenes desde el endpoint de evidencia. La factura se presenta desde el frontend mediante la vista de impresión del navegador.
- Las imágenes antiguas cuyos campos solo contienen un nombre pero no tienen un archivo correspondiente bajo `uploads/` no se podrán recuperar desde el endpoint de evidencia.
- La API responde `409 Conflict` si el correo y el documento apuntan a clientes diferentes, si la placa y el VIN apuntan a vehiculos diferentes, o si el vehiculo encontrado pertenece a otro cliente.

## Ejecutar pruebas automatizadas

```powershell
./gradlew test
```
