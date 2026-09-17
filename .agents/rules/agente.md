---
trigger: always_on
---

Actúa como un arquitecto de software senior y desarrollador full-stack senior. Vamos a construir desde cero un SISTEMA INTEGRAL DE GESTIÓN PARA UNA GRANJA PORCINA.

El sistema debe ser modular, escalable, mantenible y preparado para uso empresarial real. No construyas todo de golpe. Primero analiza la arquitectura y después desarrollaremos módulo por módulo.

## STACK

Backend:

* ASP.NET Core Web API
* .NET 8
* Entity Framework Core
* SQL Server
* JWT Authentication
* Swagger/OpenAPI
* FluentValidation
* Serilog

Frontend:

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Axios
* React Hook Form
* Zod
* TanStack Query

Arquitectura Backend:

src/
├── Api/
├── Application/
├── Domain/
├── Infrastructure/
└── Shared/

Frontend:

src/
├── app/
├── components/
├── features/
├── layouts/
├── pages/
├── services/
├── hooks/
├── types/
├── utils/
└── lib/

Usa Clean Architecture y separación clara de responsabilidades.

## MÓDULOS DEL SISTEMA

1. Autenticación y usuarios
2. Configuración de granja
3. Plantel porcino
4. Lotes
5. Ubicaciones
6. Reproducción
7. Maternidad
8. Destete y crecimiento
9. Pesajes
10. Alimentación
11. Sanidad veterinaria
12. Mortalidad
13. Inventario
14. Compras y proveedores
15. Ventas y despacho
16. Costos
17. Dashboard
18. Reportes
19. Auditoría

Los módulos deben estar desacoplados pero compartir entidades cuando corresponda.

## REGLA DE DESARROLLO

Para cada módulo seguir:

ANÁLISIS
→ MODELO DE DATOS
→ ENTIDADES
→ REGLAS DE NEGOCIO
→ SERVICIOS
→ DTOs
→ API
→ FRONTEND
→ VALIDACIONES
→ TESTS
→ DOCUMENTACIÓN

No crear únicamente CRUDs. Cada módulo debe implementar sus reglas de negocio y trazabilidad.

No inventes reglas de negocio específicas de la granja. Si una decisión depende de la operación real, marcarla como CONFIGURABLE.

## CORE DEL SISTEMA

La estructura principal de la granja será:

Granja
→ Áreas
→ Galpones
→ Corrales/Jaulas
→ Ubicaciones

El sistema debe saber siempre dónde se encuentra un animal o lote.

## PLANTEL PORCINO

Registrar:

* Código/identificador
* Sexo
* Raza/genética
* Fecha de nacimiento
* Padre
* Madre
* Estado
* Fecha de ingreso
* Fecha de baja
* Motivo de baja
* Ubicación
* Lote
* Observaciones

Estados configurables:

Activo
Vendido
Muerto
Descartado
Trasladado

Cada animal tendrá una ficha con:

Información general
→ Genealogía
→ Ubicación
→ Movimientos
→ Pesajes
→ Sanidad
→ Alimentación
→ Reproducción
→ Historial

## LOTES

Registrar:

* Código
* Nombre
* Etapa productiva
* Fecha de ingreso
* Cantidad inicial
* Cantidad actual
* Ubicación
* Estado
* Observaciones

Debe existir trazabilidad de movimientos entre lotes y ubicaciones.

## REPRODUCCIÓN

Registrar:

* Celo
* Servicio
* Inseminación artificial
* Macho utilizado
* Fecha de servicio
* Diagnóstico de gestación
* Fecha probable de parto
* Parto
* Abortos
* Repeticiones de celo

Calcular indicadores como fertilidad, tasa de parto, nacidos vivos, nacidos muertos, momificados, destetados e intervalo entre partos.

## MATERNIDAD

Registrar:

* Madre
* Camada
* Fecha de parto
* Nacidos
* Nacidos vivos
* Nacidos muertos
* Momificados
* Adopciones
* Mortalidad
* Destete
* Peso al destete

Mantener trazabilidad:

Madre → Parto → Camada → Lechones → Destete → Lote

## PESAJES Y CRECIMIENTO

Registrar:

* Animal/lote
* Fecha
* Peso
* Etapa
* Responsable

Calcular:

* Peso promedio
* Ganancia de peso
* Ganancia diaria de peso
* Evolución del peso
* Conversión alimenticia cuando existan los datos necesarios

## ALIMENTACIÓN

Administrar:

* Tipos de alimento
* Fórmulas
* Proveedores
* Stock
* Consumo
* Consumo por lote
* Consumo por etapa

Registrar fecha, lote, alimento, cantidad, unidad y responsable.

## SANIDAD

Administrar:

* Enfermedades
* Diagnósticos
* Medicamentos
* Tratamientos
* Vacunas
* Desparasitaciones
* Dosis
* Fechas
* Veterinario
* Período de retiro
* Observaciones

Mantener historial sanitario por animal y lote.

## MORTALIDAD

Registrar:

* Animal/lote
* Fecha
* Edad
* Peso
* Ubicación
* Causa
* Observaciones
* Responsable

Generar estadísticas por lote, etapa, causa y período.

## INVENTARIO

Administrar:

* Alimentos
* Medicamentos
* Vacunas
* Insumos
* Herramientas
* Repuestos
* Otros productos

Movimientos:

Entrada
Salida
Ajuste
Transferencia

Controlar stock, stock mínimo, unidad, costo, lote y vencimiento.

## COMPRAS

Administrar:

* Proveedores
* Productos
* Solicitudes
* Órdenes de compra
* Recepciones
* Facturas
* Costos

La recepción de una compra debe actualizar automáticamente el inventario.

## VENTAS Y DESPACHO

Registrar:

* Cliente
* Fecha
* Lote
* Cantidad de animales
* Peso
* Precio/kg
* Precio total
* Transportista
* Destino
* Documento de salida

La salida debe actualizar automáticamente los animales disponibles.

## COSTOS

Preparar cálculo de costos por:

* Animal
* Lote
* Etapa
* Kg producido

Considerar alimentación, medicamentos, vacunas, mano de obra, servicios, compras y otros costos.

No asumir una metodología contable específica. Diseñar el módulo para que pueda configurarse.

## DASHBOARD

Mostrar:

* Animales activos
* Madres
* Machos
* Lechones
* Lotes activos
* Mortalidad
* Nacimientos
* Destetes
* Peso promedio
* Ganancia diaria
* Consumo de alimento
* Stock
* Ventas
* Costos

Filtros por fecha, granja, área, galpón, etapa y lote.

## REPORTES

Preparar reportes de:

* Animales
* Lotes
* Mortalidad
* Reproducción
* Partos
* Destetes
* Pesajes
* Alimentación
* Sanidad
* Inventario
* Compras
* Ventas
* Costos

Preparar exportación futura a Excel, PDF y CSV.

## USUARIOS Y PERMISOS

Roles iniciales:

Administrador
Gerente
Veterinario
Producción
Almacén
Ventas
Operario

Utilizar autorización basada en roles/permisos.

## AUDITORÍA

Registrar:

* Usuario
* Fecha/hora
* Módulo
* Acción
* Registro afectado
* Valor anterior
* Valor nuevo

Acciones:

CREAR
ACTUALIZAR
ELIMINAR
ANULAR
LOGIN
LOGOUT

Para información crítica utilizar eliminación lógica cuando corresponda.

## BASE DE DATOS

Usar:

* PK
* FK
* índices
* constraints
* unique constraints
* timestamps
* relaciones correctamente normalizadas

No crear tablas innecesarias.

Usar nombres consistentes como:

Animals
AnimalMovements
AnimalWeighings
Batches
ReproductiveEvents
Litters
FeedMovements
InventoryMovements
Treatments
Vaccinations
Deaths
Purchases
Sales

No exponer entidades EF directamente desde la API. Utilizar DTOs.

## API

Utilizar REST:

GET /api/animals
GET /api/animals/{id}
POST /api/animals
PUT /api/animals/{id}
DELETE /api/animals/{id}

Implementar correctamente códigos HTTP, validaciones y manejo de errores.

## UI

Crear una interfaz empresarial limpia y responsive.

Utilizar:

* Sidebar
* Header
* Breadcrumbs
* Tablas
* Filtros
* Formularios
* Paginación
* Búsqueda
* Modales
* Toasts
* Loading states
* Error states
* Confirmaciones para operaciones críticas

Priorizar claridad, velocidad y usabilidad sobre decoración.

## TRAZABILIDAD

Este es un requisito fundamental.

Debe poder reconstruirse la historia de un animal:

Nacimiento
→ Padre/Madre
→ Lote
→ Ubicación
→ Pesajes
→ Alimentación
→ Tratamientos
→ Movimientos
→ Venta/Muerte/Descarte

También debe poder reconstruirse la historia completa de un lote.

## DOCUMENTACIÓN

Crear y mantener:

/docs/ARCHITECTURE.md
/docs/DATABASE.md
/docs/API.md
/docs/MODULES.md
/docs/DEPLOYMENT.md

## GIT

Realizar commits pequeños y descriptivos:

feat: create animal management
feat: add animal movements
feat: add reproductive events
fix: validate duplicate animal codes
refactor: improve animal service
docs: update database documentation

## FORMA DE TRABAJO

NO desarrollar todos los módulos en una sola ejecución.

FASE 0:
Analizar requisitos, arquitectura, dependencias, modelo de datos y roadmap.

FASE 1:
Implementar Core:

* Proyecto
* Arquitectura
* SQL Server
* EF Core
* Migraciones
* Autenticación
* Usuarios
* Roles
* Granja
* Áreas
* Galpones
* Corrales
* Ubicaciones

FASE 2:
Animales
Lotes
Movimientos
Pesajes

FASE 3:
Reproducción
Maternidad
Destete

FASE 4:
Sanidad
Mortalidad

FASE 5:
Alimentación
Inventario
Compras

FASE 6:
Ventas
Despachos

FASE 7:
Costos
Dashboard
Reportes
Auditoría

Antes de pasar de fase, verificar:

Build
→ Migraciones
→ Backend
→ API
→ Frontend
→ Validaciones
→ Tests
→ Documentación

## PRIMERA TAREA

NO empieces todavía a crear todos los módulos.

Primero analiza el proyecto y entrega:

1. Arquitectura propuesta.
2. Estructura de carpetas.
3. Mapa de módulos.
4. Dependencias entre módulos.
5. Modelo inicial de base de datos.
6. Principales entidades y relaciones.
7. Roadmap.
8. Riesgos técnicos.
9. Decisiones que deben quedar configurables.

Después de presentar el análisis, comienza únicamente con FASE 1 — CORE.

Mantén todo el código limpio, tipado, documentado y preparado para crecimiento futuro.
