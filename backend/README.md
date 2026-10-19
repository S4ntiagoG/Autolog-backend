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

### Arranque recomendado en Windows

Desde la carpeta `Autolog-backend`, ejecuta `start-autolog.bat`. El script levanta PostgreSQL, genera el JAR del backend y abre el backend y el frontend en ventanas separadas. Mantén abiertas esas ventanas mientras uses la aplicación.

La API queda en `http://localhost:8080` y el frontend en `http://localhost:4200`. Para detener la aplicación, cierra las ventanas del backend y del frontend. PostgreSQL puede permanecer activo; para detenerlo manualmente, ejecuta `docker compose down` desde `backend`.

El script usa `gradlew.bat`, `java` y `npm.cmd` directamente, por lo que evita la política de ejecución de scripts de PowerShell y no depende del comando `debugjava` de VS Code. Omite las pruebas durante el arranque (`-x test`); ejecútalas por separado cuando quieras validar cambios.

### 1. Levantar PostgreSQL

Desde la carpeta `backend`:

```powershell
docker compose up -d
```

La base de datos queda disponible en `localhost:5433` con estos datos:

- Base de datos: `autolog_db`
- Usuario: `autolog`
- Contrasena: `autolog1234`

### 2. Ejecutar el backend

En otra terminal, también desde la carpeta `backend`:

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
		"status": "PENDIENTE",
		"estimatedPickupAt": null,
		"progressNote": null
	}
]
```

Cada elemento del historial incluye el estado guardado de esa orden. La búsqueda del portal (`POST /api/vehicles/search`) devuelve también el estado real de la orden más reciente; si no hay orden, devuelve `SIN ORDEN`.

## Orden de trabajo mecánico

`PUT /api/service-orders/{id}` actualiza los campos que envía, incluyendo `status`, `mechanicDiagnosis`, `tasks`, `parts` y `labor`. El backend calcula `serviceCost` como la suma de repuestos/insumos y mano de obra, ignorando cualquier total enviado por el cliente. Las listas pueden tener cero o más elementos. Ejemplo:

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
  "serviceCost": 145000
}
```

Los estados de trabajo usados por la aplicación son `PENDIENTE`, `EN PROGRESO` y `LISTO`. El total de la orden es la suma de partes/insumos y mano de obra; el backend lo calcula a partir de esos conceptos, sin agregar cargos de taller. Los precios ingresados ya incluyen IVA del 19%; la interfaz muestra el valor incluido (total × 19/119), sin sumarlo al total.

La orden también admite `estimatedPickupAt` (fecha y hora local ISO, por ejemplo `2026-10-14T17:00`) y `progressNote` (actualización para el cliente, hasta 300 caracteres). Ambos campos se editan desde la orden de trabajo mecánico y se devuelven en el historial del vehículo. La nota permite comunicar detalles como la espera de repuestos; no reemplaza los tres estados generales de la orden.

El historial también devuelve la lista `tasks` de la orden con `description` y `completed`, conservando el orden en que el mecánico las registró. El portal del cliente presenta estas tareas bajo la etapa de reparación.

Al iniciar el backend se ejecuta `src/main/resources/db/schema.sql` para crear la columna de orden de tareas si falta y asignar posiciones a las tareas ya guardadas. Reinicia el backend después de actualizar el proyecto para aplicar esta migración local.

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
| POST | `/api/service-orders/{id}/simulate-payment` | Registra el medio de pago simulado; valida placa y documento |
| PUT | `/api/service-orders/{id}` | Actualiza datos de la orden |
| DELETE | `/api/service-orders/{id}` | Elimina la orden |
| POST | `/api/vehicles/search` | Busca vehículo por placa y documento |
| GET | `/api/mechanics/auth/csrf` | Inicializa la protección CSRF del inicio de sesión |
| POST | `/api/mechanics/auth/login` | Inicia sesión del mecánico con `codigoMecanico` y `password` |
| GET | `/api/mechanics/auth/me` | Devuelve la sesión del mecánico autenticado |
| POST | `/api/mechanics/auth/logout` | Cierra la sesión |
| GET | `/api/mechanics/activity` | Devuelve los diez eventos recientes del taller |

## Acceso del taller

La tabla `mecanicos` existente contiene `codigo_mecanico`, `nombre` y `password`; `codigoMecanico` es el usuario de acceso. La contraseña se verifica con BCrypt y el inicio de sesión crea una sesión de servidor mediante cookie HttpOnly, con protección contra fijación de sesión. CSRF se exige en las solicitudes que modifican datos y en las solicitudes autenticadas del taller. Las lecturas de clientes, vehículos, órdenes y actividad, y las operaciones de escritura del taller requieren una sesión con rol `MECHANIC` o `ADMIN`; la búsqueda pública `/api/vehicles/search` y las consultas de detalle/historial/evidencia del portal cliente permanecen disponibles sin autenticación.

La pantalla de ingreso compartida del taller es `/mechanic/login`; después del acceso, el mecánico llega al tablero `/dashboard` y el administrador a `/admin/dashboard`. La consulta por placa y documento de `/client/search` es exclusiva del portal del cliente y no aparece en la navegación del taller. Las rutas del taller también redirigen al inicio de sesión si no hay una sesión válida.

La creación de cuentas de administrador no está implementada en la aplicación y no se crea una cuenta inicial automáticamente. El administrador debe agregarse manualmente a `admins` antes de iniciar sesión. Al crear la fila, guarda la contraseña como BCrypt (nunca en texto plano).

En el historial del cliente, cuando una orden está `LISTO` y tiene un total mayor que cero, se puede elegir efectivo, transferencia, tarjeta débito o tarjeta crédito y registrar una simulación. No se procesa ningún cobro real ni cambia el estado de la orden: después del pago continúa como `LISTO`. La API comprueba placa y documento contra el vehículo de la orden, impide pagos antes de que el servicio esté listo y no permite registrar un segundo pago. Se guarda el método, la fecha y el importe final en `service_orders.payment_method`, `service_orders.payment_recorded_at` y `service_orders.payment_amount`; estos datos aparecen en las consultas del cliente y del mecánico. Una orden pagada no admite cambios ni eliminación, y tampoco se pueden cargar evidencias adicionales.

El tablero del taller consulta `GET /api/mechanics/activity` para mostrar los diez eventos más recientes. El sistema registra quién ingresó un vehículo, cada cambio de estado de una orden y las tareas marcadas como completadas. Los cambios de tareas se registran al guardar la orden de trabajo, no al marcar la casilla. El registro del pago simulado no crea un evento en esta bitácora. Los eventos se conservan en `workshop_activity` y requieren una sesión autenticada de mecánico o administrador.

El formulario de acceso del taller también autentica las cuentas de `admins`. Una cuenta agregada a esa tabla recibe el rol `ADMIN` y se dirige al tablero `/admin/dashboard`; las cuentas de `mecanicos` conservan el rol `MECHANIC` y la ruta `/dashboard`. La contraseña de `admins.password` debe guardarse como hash BCrypt, nunca como texto plano. En PostgreSQL se puede crear con:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO admins (usuario, password)
VALUES ('admin.taller', crypt('CAMBIAR_POR_UNA_CONTRASENA_SEGURA', gen_salt('bf', 12)));
```

Los nombres de usuario deben ser únicos entre `admins.usuario` y `mecanicos.codigo_mecanico`; si hay una colisión, el acceso se rechaza de forma segura. El rol devuelto por el servidor gobierna la ruta inicial y la navegación del frontend: el administrador accede a `/admin/dashboard` y ve Tablero, Vehículos, Inventario, Mecánicos y Configuración; el mecánico accede a `/dashboard` y ve únicamente Tablero, Vehículos e Inventario. El acceso directo a las rutas administrativas también se restringe en el frontend. La sesión se comparte entre pestañas del mismo perfil del navegador, por lo que cerrar sesión o autenticarse con otra cuenta afecta a todas ellas.

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
- La orden de trabajo permite guardar la hora estimada de recogida (`estimatedPickupAt`) y una actualización visible para el cliente (`progressNote`).
- Las tareas, repuestos/insumos y mano de obra se persisten dentro de la orden.
- El detalle de cliente consume `GET /api/service-orders/{id}` y puede recuperar las imágenes desde el endpoint de evidencia. La factura se presenta desde el frontend mediante la vista de impresión del navegador.
- Las imágenes antiguas cuyos campos solo contienen un nombre pero no tienen un archivo correspondiente bajo `uploads/` no se podrán recuperar desde el endpoint de evidencia.
- La API responde `409 Conflict` si el correo y el documento apuntan a clientes diferentes, si la placa y el VIN apuntan a vehiculos diferentes, o si el vehiculo encontrado pertenece a otro cliente.

## Ejecutar pruebas automatizadas

```powershell
./gradlew test
```
