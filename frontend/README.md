# AUTOLOG frontend

Frontend Angular standalone para registrar ingresos de vehículos contra el backend existente.

## Ejecución local

Desde esta carpeta:

```powershell
npm install
npm start
```

La aplicación queda en `http://localhost:4200/`. El proxy de desarrollo reenvía `/api` a `http://localhost:8080`.

El backend se ejecuta desde `backend` con:

```powershell
.\gradlew.bat bootRun
```

## Contrato utilizado

El backend no expone un endpoint compuesto de intake. El servicio ejecuta en secuencia:

1. `POST /api/clients`
2. `POST /api/vehicles` con `client.id`
3. `POST /api/service-orders` con `vehicle.id` y `entryDate` en formato `YYYY-MM-DD`

Los catálogos del formulario están centralizados en `src/app/features/vehicle-intake/models/vehicle-intake.constants.ts`, porque el backend no ofrece endpoints de catálogo.

El backend actual no tiene carga multipart de evidencias. La interfaz valida, previsualiza y elimina imágenes localmente; al guardar, solo envía los nombres de archivo en los campos `photo*` que ya existen en `ServiceOrder`.

## Verificación

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```
