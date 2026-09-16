# 🚀 GUÍA DE DESPLIEGUE Y CONFIGURACIÓN DE ENTORNO

Este documento describe los requisitos previos, la configuración de variables de entorno y los pasos para compilar, ejecutar y desplegar el **Sistema Integral de Gestión Porcina** tanto en entorno local como en producción.

---

## 1. Requisitos Previos del Sistema

### 1.1. Entorno de Desarrollo
* **.NET SDK:** Versión 8.0 LTS o superior.
* **Node.js:** Versión 20.x o 22.x LTS + npm 10+.
* **Base de Datos:** Microsoft SQL Server 2022+ (Developer, Express, LocalDB o contenedor Docker `mcr.microsoft.com/mssql/server:2022-latest`).
* **Herramientas de CLI recomendadas:**
  * `dotnet-ef` CLI tool: `dotnet tool install --global dotnet-ef`
  * Git

---

## 2. Configuración y Ejecución en Desarrollo Local

### 2.1. Configuración de Base de Datos y Backend
1. Clonar el repositorio y ubicarse en la carpeta raíz:
   ```bash
   cd sistema-granja-porcina
   ```
2. Configurar la cadena de conexión en `backend/src/Api/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SistemaGranjaPorcinaDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
     },
     "JwtSettings": {
       "Secret": "TU_CLAVE_SUPER_SECRETA_Y_SEGURA_DE_AL_MENOS_32_CARACTERES_12345",
       "Issuer": "SistemaGranjaPorcinaApi",
       "Audience": "SistemaGranjaPorcinaApp",
       "ExpiryMinutes": 60,
       "RefreshTokenExpiryDays": 7
     },
     "Serilog": {
       "MinimumLevel": {
         "Default": "Information",
         "Override": {
           "Microsoft": "Warning",
           "Microsoft.EntityFrameworkCore": "Information"
         }
       }
     }
   }
   ```
3. Aplicar las migraciones de Entity Framework Core para crear el esquema inicial:
   ```bash
   cd backend
   dotnet ef database update --project src/Infrastructure --startup-project src/Api
   ```
4. Ejecutar el backend:
   ```bash
   dotnet run --project src/Api
   ```
   * La API estará disponible en `https://localhost:7001` o `http://localhost:5001`.
   * La documentación interactiva Swagger estará accesible en `https://localhost:7001/swagger`.

---

### 2.2. Configuración y Ejecución del Frontend
1. Abrir una nueva terminal y navegar a la carpeta `frontend/`:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `frontend/.env.development`:
   ```env
   VITE_API_BASE_URL=https://localhost:7001/api/v1
   VITE_APP_TITLE=Sistema de Gestión Porcina
   ```
4. Iniciar el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   * La aplicación web estará disponible en `http://localhost:5173`.

---

## 3. Despliegue con Docker y Docker Compose

Se provee una configuración completa de contenedores para levantar el ecosistema completo (SQL Server + API .NET 8 + Frontend Nginx).

### 3.1. `docker-compose.yml`
```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: granja-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd!2026
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sql_data:/var/opt/mssql
    networks:
      - granja-network

  backend-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: granja-backend
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=SistemaGranjaPorcinaDb;User Id=sa;Password=YourStrong@Passw0rd!2026;TrustServerCertificate=True;
      - JwtSettings__Secret=TU_CLAVE_SUPER_SECRETA_Y_SEGURA_DE_AL_MENOS_32_CARACTERES_12345
      - JwtSettings__Issuer=SistemaGranjaPorcinaApi
      - JwtSettings__Audience=SistemaGranjaPorcinaApp
    ports:
      - "5000:8080"
    depends_on:
      - sqlserver
    networks:
      - granja-network

  frontend-app:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: granja-frontend
    ports:
      - "80:80"
    depends_on:
      - backend-api
    networks:
      - granja-network

volumes:
  sql_data:

networks:
  granja-network:
    driver: bridge
```

### 3.2. Comandos para Ejecutar con Docker
```bash
docker-compose up -d --build
```

---

## 4. Checklist de Validación para Paso a Producción
- [ ] Cadena de conexión a base de datos segura y con principio de mínimo privilegio.
- [ ] Clave secreta JWT robusta almacenada en Key Vault o variables de entorno del servidor.
- [ ] Políticas CORS configuradas únicamente para los orígenes de dominio autorizados.
- [ ] Migraciones de EF Core aplicadas exitosamente con control de versiones.
- [ ] Registros de logs centralizados (Serilog hacia archivo rotativo o servicio cloud).
- [ ] Verificación de endpoints de salud (`/health` y `/ready`).
