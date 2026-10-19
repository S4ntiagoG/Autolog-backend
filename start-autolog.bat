@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo Starting PostgreSQL...
docker compose -f "%BACKEND_DIR%\docker-compose.yml" up -d
if errorlevel 1 goto :error

curl.exe --fail --silent http://localhost:8080/api/clients >nul 2>&1
if not errorlevel 1 goto :backend_running

echo Building the Spring Boot application...
call "%BACKEND_DIR%\gradlew.bat" -p "%BACKEND_DIR%" bootJar -x test
if errorlevel 1 goto :error

echo Starting backend at http://localhost:8080...
start "AutoLog Backend" /D "%BACKEND_DIR%" cmd /k "java -jar build\libs\backend-0.0.1-SNAPSHOT.jar --server.port=8080"
goto :start_frontend

:backend_running
echo Backend already responds at http://localhost:8080; not starting a duplicate.

:start_frontend
curl.exe --fail --silent http://localhost:4200 >nul 2>&1
if not errorlevel 1 goto :frontend_running

echo Starting frontend at http://localhost:4200...
start "AutoLog Frontend" /D "%FRONTEND_DIR%" cmd /k "npm.cmd start -- --host 127.0.0.1"
goto :services_started

:frontend_running
echo Frontend already responds at http://localhost:4200; not starting a duplicate.

:services_started
echo.
echo AutoLog services are starting in separate windows.
echo Keep both windows open while using the application.
echo Frontend: http://localhost:4200
echo Backend:  http://localhost:8080
exit /b 0

:error
echo.
echo AutoLog could not be started. Review the error above.
pause
exit /b 1
