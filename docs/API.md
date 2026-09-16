# 🌐 ESPECIFICACIÓN DE LA API RESTful — SISTEMA DE GESTIÓN PORCINA

## 1. Estándares y Convenciones
* **Protocolo:** HTTPS / RESTful.
* **Formato de intercambio:** `application/json; charset=utf-8`.
* **Nomenclatura en URLs:** Minúsculas con guiones o plural en minúsculas (`/api/v1/farms`, `/api/v1/farm-structure/areas`, `/api/v1/pigs`).
* **Nomenclatura JSON:** `camelCase` para propiedades en requests y responses.
* **Versionado:** Vía ruta `/api/v1/...`.

---

## 2. Cabeceras HTTP Estándar

| Cabecera | Requerido | Descripción | Ejemplo |
| :--- | :---: | :--- | :--- |
| `Authorization` | SÍ (en endpoints protegidos) | Bearer JWT Token | `Bearer eyJhbGciOi...` |
| `X-Farm-Id` | SÍ (en operaciones de granja) | UUID de la granja activa para aislamiento de datos | `c7b2a64e-7d6f-40e1-85e3-49fa5f11812a` |
| `Content-Type` | SÍ (en POST/PUT/PATCH) | Tipo de contenido | `application/json` |

---

## 3. Estructura Unificada de Respuestas

### 3.1. Respuesta Exitosa Simple (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operación completada exitosamente.",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Galpón 1 - Gestación",
    "code": "GAL-01"
  },
  "errors": null
}
```

### 3.2. Respuesta Paginada (`PaginatedResponse<T>`)
```json
{
  "success": true,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "identificationCode": "H-2024-001",
      "breed": "Camborough",
      "status": "Active"
    }
  ],
  "pagination": {
    "pageIndex": 1,
    "pageSize": 20,
    "totalCount": 145,
    "totalPages": 8,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "errors": null
}
```

### 3.3. Respuesta de Error / Validación (RFC 7807 Problem Details)
```json
{
  "success": false,
  "title": "Error de validación",
  "status": 400,
  "detail": "Uno o más campos no cumplen con las reglas de negocio.",
  "errors": {
    "identificationCode": [
      "El código de identificación 'H-2024-001' ya existe en esta granja."
    ],
    "birthDate": [
      "La fecha de nacimiento no puede ser futura."
    ]
  }
}
```

---

## 4. Códigos de Estado HTTP Utilizados

| Código | Significado | Uso |
| :---: | :--- | :--- |
| `200 OK` | Éxito | Consultas exitosas y actualizaciones (`GET`, `PUT`, `PATCH`). |
| `201 Created` | Creado | Creación exitosa de recursos (`POST`). Retorna cabecera `Location`. |
| `204 No Content` | Sin Contenido | Eliminaciones exitosas (`DELETE`). |
| `400 Bad Request` | Petición Inválida | Errores de validación de campos o reglas de negocio. |
| `401 Unauthorized` | No Autenticado | Token ausente, expirado o inválido. |
| `403 Forbidden` | No Autorizado | El usuario no posee los permisos/roles necesarios. |
| `404 Not Found` | No Encontrado | El recurso solicitado no existe. |
| `409 Conflict` | Conflicto | Restricciones de unicidad o estado inconsistente. |
| `500 Internal Error` | Error de Servidor | Excepción no controlada registrada en Serilog. |

---

## 5. Catálogo de Endpoints de Fase 1 (Core y Estructura)

### 5.1. Autenticación (`/api/v1/auth`)
* `POST /api/v1/auth/login`: Autenticación con usuario/correo y contraseña. Retorna JWT + RefreshToken + Granjas permitidas.
* `POST /api/v1/auth/refresh-token`: Renovación de JWT mediante RefreshToken válido.
* `POST /api/v1/auth/logout`: Revocación del RefreshToken actual.
* `GET  /api/v1/auth/me`: Obtención del perfil y permisos del usuario en sesión.

### 5.2. Usuarios y Roles (`/api/v1/users`, `/api/v1/roles`)
* `GET    /api/v1/users`: Listado paginado con filtros de usuarios.
* `POST   /api/v1/users`: Creación de un nuevo usuario con asignación de roles y granjas.
* `GET    /api/v1/users/{id}`: Detalle de usuario.
* `PUT    /api/v1/users/{id}`: Actualización de datos y roles.
* `PATCH  /api/v1/users/{id}/status`: Activar o desactivar usuario.
* `GET    /api/v1/roles`: Listado de roles del sistema y personalizados.
* `GET    /api/v1/roles/{id}/permissions`: Permisos asignados a un rol.

### 5.3. Granjas (`/api/v1/farms`)
* `GET    /api/v1/farms`: Listado de granjas a las que el usuario tiene acceso.
* `POST   /api/v1/farms`: Creación de una nueva granja.
* `GET    /api/v1/farms/{id}`: Ficha de granja.
* `PUT    /api/v1/farms/{id}`: Actualización de granja.
* `GET    /api/v1/farms/{id}/configurations`: Parámetros operativos configurables.
* `PUT    /api/v1/farms/{id}/configurations`: Actualización de parámetros de granja.

### 5.4. Estructura Topológica: Áreas, Galpones y Corrales
* `GET    /api/v1/areas`: Áreas de la granja activa (`X-Farm-Id`).
* `POST   /api/v1/areas`: Crear área productiva.
* `GET    /api/v1/areas/{id}`: Detalle de área y resumen de galpones.
* `PUT    /api/v1/areas/{id}`: Actualizar área.
* `DELETE /api/v1/areas/{id}`: Eliminación lógica de área.
* `GET    /api/v1/sheds`: Galpones filtrados por área o granja.
* `POST   /api/v1/sheds`: Crear galpón.
* `GET    /api/v1/sheds/{id}`: Detalle de galpón y resumen de corrales.
* `PUT    /api/v1/sheds/{id}`: Actualizar galpón.
* `GET    /api/v1/pens`: Corrales filtrados por galpón, tipo de corral o disponibilidad.
* `POST   /api/v1/pens`: Crear corral o jaula.
* `GET    /api/v1/pens/{id}`: Detalle de corral, estado sanitario y ocupación actual.
* `PUT    /api/v1/pens/{id}`: Actualizar corral.
* `PATCH  /api/v1/pens/{id}/status`: Cambiar estado (Mantenimiento, Vacío Sanitario, etc.).

### 5.5. Auditoría (`/api/v1/audit`)
* `GET    /api/v1/audit/logs`: Consulta paginada y filtrada por fecha, usuario, módulo y entidad.
* `GET    /api/v1/audit/logs/{id}`: Comparador detallado de valores anteriores y nuevos (Diff JSON).

---

## 6. Endpoints de Fases Posteriores (Roadmap)
* **Fase 2:** `/api/v1/pigs`, `/api/v1/batches`, `/api/v1/pig-movements`, `/api/v1/weighings`
* **Fase 3:** `/api/v1/reproductive-events`, `/api/v1/litters`, `/api/v1/weanings`
* **Fase 4:** `/api/v1/health/treatments`, `/api/v1/health/vaccinations`, `/api/v1/deaths`
* **Fase 5:** `/api/v1/feed/formulas`, `/api/v1/feed/consumptions`, `/api/v1/inventory/items`, `/api/v1/purchases`
* **Fase 6:** `/api/v1/sales`, `/api/v1/dispatch-guides`
* **Fase 7:** `/api/v1/costs`, `/api/v1/dashboard/kpis`, `/api/v1/reports/export`
