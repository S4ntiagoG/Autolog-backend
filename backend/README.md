# AutoLog Backend

API REST para clientes, vehiculos y ordenes de servicio.

## Requisitos

- Java 25
- Docker Desktop
- Postman

## 1. Levantar PostgreSQL

Desde la carpeta raiz del proyecto:

```powershell
docker compose up -d
```

La base de datos queda disponible en `localhost:5432` con estos datos:

- Base de datos: `autolog_db`
- Usuario: `autolog`
- Contrasena: `autolog1234`

## 2. Ejecutar el backend

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

## 3. Probar con Postman

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

## 4. Requests manuales en Postman

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

Respuesta esperada: `201 Created`. Copiar el `id` de la respuesta para usarlo como `client.id` al crear el vehiculo.

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

Respuesta esperada: `201 Created`. Copiar el `id` de la respuesta para usarlo como `vehicle.id` al crear la orden.

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

Respuesta esperada: `201 Created`. La fecha debe usar el formato `YYYY-MM-DD` y `vehicle.id` debe existir.

### Consultar ordenes

```text
GET http://localhost:8080/api/service-orders
GET http://localhost:8080/api/service-orders/{serviceOrderId}
```

## Endpoints

| Metodo | Ruta | Resultado esperado |
|---|---|---|
| GET | `/api/clients` | Lista de clientes |
| POST | `/api/clients` | `201 Created` |
| GET | `/api/clients/{id}` | Cliente por ID |
| GET | `/api/vehicles` | Lista de vehiculos |
| POST | `/api/vehicles` | `201 Created` |
| GET | `/api/vehicles/{id}` | Vehiculo por ID |
| GET | `/api/service-orders` | Lista de ordenes |
| POST | `/api/service-orders` | `201 Created` |
| GET | `/api/service-orders/{id}` | Orden por ID |

## Datos importantes

- Todos los requests con body deben usar `Content-Type: application/json`.
- Primero se crea el cliente, despues el vehiculo y finalmente la orden.
- El vehiculo necesita un cliente existente.
- La orden necesita un vehiculo existente dentro de `vehicle.id`.
- `entryDate` usa el formato `YYYY-MM-DD`.

## Ejecutar pruebas automatizadas

```powershell
./gradlew test
```
