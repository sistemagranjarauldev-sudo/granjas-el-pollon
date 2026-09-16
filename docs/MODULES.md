# 📦 ESPECIFICACIÓN DE MÓDULOS DEL SISTEMA

Este documento detalla los 19 módulos funcionales del Sistema Integral de Gestión Porcina, sus reglas de negocio, parámetros configurables e interacciones.

---

## 1. Módulo de Autenticación y Usuarios
* **Propósito:** Gestión de identidades, sesiones seguras, control de acceso basado en roles y permisos (RBAC/PBAC) y asignación multi-granja.
* **Entidades:** `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `UserFarm`, `RefreshToken`.
* **Reglas de Negocio:**
  * Contraseñas con requisitos de complejidad y hasheo seguro con Salt.
  * Tokens JWT con expiración corta (ej. 60 min) y Refresh Tokens revocables.
  * Los usuarios sólo pueden consultar y operar granjas a las que han sido explícitamente asignados (`UserFarm`).
  * Los roles del sistema (`Admin`, `Veterinario`, `Producción`, etc.) tienen permisos base protegidos contra eliminación accidental.

---

## 2. Módulo de Configuración de Granja
* **Propósito:** Parametrización operativa y zootécnica personalizada por cada unidad productiva.
* **Entidades:** `Farm`, `FarmConfiguration`.
* **Parámetros Configurables:**
  * Días promedio de gestación (Default: 114 días, rango editable 110-118).
  * Días promedio de lactancia / edad al destete (Default: 21-28 días).
  * Intervalo de detección de celo post-destete (Default: 4-7 días).
  * Umbral de alerta de repetición de celo (18-24 días).
  * Días estándar de cuarentena para animales nuevos.
  * Método de costeo de inventario (Promedio Ponderado / FIFO).
  * Capacidad y densidad animal permitida ($m^2$ por cerdo según etapa).

---

## 3. Módulo de Plantel Porcino
* **Propósito:** Ficha individual completa de reproductores (madres, primerizas, verracos) y animales de seguimiento unitario.
* **Entidades:** `Pig`, `PigMovement`, `PigWeighing`, `ReproductiveEvent`.
* **Reglas de Negocio:**
  * Código de identificación único por granja (arete/tatuaje).
  * Validación estricta de genealogía: No se permite seleccionar como padre a una hembra o como madre a un macho; validación contra ciclos de consanguinidad directa cuando se conozca.
  * Estados zootécnicos del ciclo: `Primeriza` $\rightarrow$ `Servida/Inseminada` $\rightarrow$ `Gestante` $\rightarrow$ `Lactante` $\rightarrow$ `Destetada/Vacía`.
  * Un animal siempre debe tener una ubicación física válida (`PenId`). Al cambiar de corral, se registra automáticamente el movimiento.
  * Los estados de baja (`Vendido`, `Muerto`, `Descartado`, `Trasladado`) liberan inmediatamente la ocupación de su corral.

---

## 4. Módulo de Lotes
* **Propósito:** Gestión grupal de animales en etapas de transición, cría, recría y engorde/cebo.
* **Entidades:** `Batch`, `BatchMovement`, `BatchWeighing`, `FeedConsumption`, `Death`.
* **Reglas de Negocio:**
  * Un lote nace a partir del destete de una o varias camadas, o de una compra externa.
  * El saldo de animales del lote se actualiza en tiempo real ante: nacimientos/ingresos (+), traslados (+/-), muertes (-), descartes (-) y ventas (-).
  * No se permite registrar consumos, pesajes o ventas en lotes con estado `Cerrado` o `Liquidado`.
  * Trazabilidad completa de fusiones o divisiones de lotes.

---

## 5. Módulo de Ubicaciones y Topología Física
* **Propósito:** Control de la estructura espacial: `Granja` $\rightarrow$ `Área` $\rightarrow$ `Galpón` $\rightarrow$ `Corral/Jaula`.
* **Entidades:** `Farm`, `Area`, `Shed`, `Pen`.
* **Reglas de Negocio:**
  * Control de capacidad máxima: Alerta preventiva o bloqueo si la ocupación actual supera el límite configurado.
  * Estados de corral: `Vacío`, `Ocupado`, `En Mantenimiento`, `En Sanitización / Vacío Sanitario`.
  * Registro de fecha de inicio y fin de vacío sanitario para bioseguridad.

---

## 6. Módulo de Reproducción
* **Propósito:** Control de celos, servicios (monta natural o inseminación artificial), diagnósticos de preñez y alertas.
* **Entidades:** `ReproductiveEvent`, `SemenBatch`.
* **Reglas de Negocio:**
  * Registro de inseminaciones con dosis, procedencia del semen o macho utilizado.
  * Cálculo automático de fecha probable de parto: $\text{Fecha Parto} = \text{Fecha Servicio} + \text{Días Gestación Configurados}$.
  * Alertas automáticas para diagnóstico de gestación por ecografía a los 21-28 días y confirmación a los 45 días.
  * Registro de repeticiones de celo (cíclica 18-24 días vs acíclica) y abortos.

---

## 7. Módulo de Maternidad y Camadas
* **Propósito:** Registro del evento de parto, camadas, lechones y manejo de nodrizas/adopciones.
* **Entidades:** `Litter`, `Piglet`, `LitterFoster`.
* **Reglas de Negocio:**
  * Registro detallado: Nacidos Vivos, Nacidos Muertos, Momificados, Peso total de la camada y peso promedio al nacer.
  * Transferencias / Adopciones: Al mover lechones entre cerdas nodrizas, se descuenta de la camada origen y se suma a la camada receptora para mantener la trazabilidad de lactancia.
  * Cálculo de tasa de mortalidad en lactancia.

---

## 8. Módulo de Destete y Crecimiento
* **Propósito:** Cierre de fase de maternidad, registro de lechones destetados y transferencia a recría/lotes.
* **Entidades:** `Weaning`, `Litter`, `Batch`.
* **Reglas de Negocio:**
  * Al registrar el destete, la madre pasa a estado `Vacía / En Espera de Celo` y se libera su jaula de maternidad.
  * Se registra cantidad de lechones destetados, peso total, peso promedio y días de lactancia reales.
  * Los lechones destetados se asignan a un nuevo lote en el área de Nursery/Transición.

---

## 9. Módulo de Pesajes y Rendimiento
* **Propósito:** Monitoreo del crecimiento ponderal de animales individuales y lotes.
* **Entidades:** `PigWeighing`, `BatchWeighing`.
* **Reglas de Negocio:**
  * Cálculo automático de la **Ganancia Diaria de Peso (GDP)**:
    $$\text{GDP (g/día)} = \frac{\text{Peso Actual} - \text{Peso Anterior}}{\text{Días Transcurridos}} \times 1000$$
  * Cálculo de peso promedio, dispersión y uniformidad del lote.
  * Generación de curvas de crecimiento comparadas con la curva teórica de la línea genética.

---

## 10. Módulo de Alimentación
* **Propósito:** Formulación, asignación de dietas y registro de consumo de alimento por lote y etapa.
* **Entidades:** `FeedFormula`, `FeedConsumption`, `FeedSchedule`.
* **Reglas de Negocio:**
  * Todo consumo registrado descuenta automáticamente el inventario del almacén correspondiente.
  * Cálculo de la **Conversión Alimenticia (CA)**:
    $$\text{Conversión Alimenticia} = \frac{\text{Kg Alimento Consumido}}{\text{Kg Ganancia de Peso}}$$
  * Alertas de desviación de consumo respecto a la tabla nutricional esperada.

---

## 11. Módulo de Sanidad Veterinaria
* **Propósito:** Planes de vacunación, tratamientos curativos, diagnóstico de enfermedades y control de retiro.
* **Entidades:** `Disease`, `Medication`, `Vaccine`, `SanitaryTreatment`, `VaccinationPlan`.
* **Reglas de Negocio:**
  * Control estricto de **Período de Retiro**: Si un animal o lote ha recibido un medicamento con período de retiro activo, el sistema **bloquea su despacho para venta a matadero** hasta cumplir los días requeridos.
  * Historial clínico individual por animal y colectivo por lote.

---

## 12. Módulo de Mortalidad
* **Propósito:** Registro detallado de bajas, causas de muerte, hallazgos de necropsia y estadísticas.
* **Entidades:** `Death`, `DeathCause`.
* **Reglas de Negocio:**
  * Descuenta de forma inmediata el animal individual del plantel o del conteo vivo del lote.
  * Generación de estadísticas de mortalidad por galpón, etapa, causa patológica y responsable.

---

## 13. Módulo de Inventario
* **Propósito:** Control multialmacén de insumos, alimentos, medicamentos, biológicos, herramientas y semen.
* **Entidades:** `Warehouse`, `InventoryItem`, `InventoryMovement`, `StockAlert`.
* **Reglas de Negocio:**
  * Movimientos: `Entrada (Compra/Devolución)`, `Salida (Consumo/Tratamiento)`, `Ajuste (Inventario Físico)`, `Transferencia entre Almacenes`.
  * Control de stock mínimo, stock de seguridad y alertas de proximidad a fecha de caducidad.
  * Kardex inmutable valorizado con costo promedio.

---

## 14. Módulo de Compras y Proveedores
* **Propósito:** Gestión de proveedores, órdenes de compra, cotizaciones y recepción de insumos.
* **Entidades:** `Supplier`, `PurchaseOrder`, `PurchaseItem`, `PurchaseReception`.
* **Reglas de Negocio:**
  * La recepción de una orden de compra genera automáticamente los movimientos de entrada en `InventoryMovements` y actualiza el costo promedio ponderado.

---

## 15. Módulo de Ventas y Despacho
* **Propósito:** Venta de lechones, animales en pie para matadero, reproductoras de descarte y lechones de cría.
* **Entidades:** `Customer`, `SaleOrder`, `SaleItem`, `DispatchGuide`.
* **Reglas de Negocio:**
  * Registro de peso bruto, tara y peso neto de salida en báscula.
  * Liquidación de venta por precio por kg o por cabeza.
  * Verificación obligatoria de restricciones de bioseguridad y período de retiro antes de emitir la guía de salida.
  * La salida confirmada descuenta definitivamente los animales del sistema y cierra lotes si corresponde.

---

## 16. Módulo de Costos
* **Propósito:** Costeo analítico de producción por animal, por lote, por etapa y por kg de carne en pie producido.
* **Entidades:** `CostCenter`, `CostEntry`, `CostAllocation`.
* **Reglas de Negocio:**
  * Absorbe costos directos (alimentación consumida, medicamentos aplicados, compra inicial) y costos indirectos asignados (mano de obra, servicios, amortizaciones).
  * No asume una metodología fija; permite configuración de prorrateo por días-animal o por biomasa generada.

---

## 17. Módulo de Dashboard
* **Propósito:** Centro de control visual interactivo para directores, veterinarios y administradores.
* **Componentes:**
  * KPIs en tiempo real: Censo actual, cerdas productivas, lechones destetados/cerda/año, tasa de partos, fertilidad, mortalidad por etapa, GDP general y conversión alimenticia.
  * Alertas operativas: Cerdas a parir en los próximos 5 días, diagnósticos de gestación pendientes, tareas sanitarias del día, lotes en período de retiro.

---

## 18. Módulo de Reportes y Exportación
* **Propósito:** Generación de informes analíticos y operativos para toma de decisiones y cumplimiento legal.
* **Formatos:** Excel (.xlsx), PDF y CSV.
* **Reportes Clave:**
  * Sábana zootécnica de reproducción.
  * Trazabilidad completa de animal/lote desde origen hasta venta.
  * Informe de eficiencia alimenticia y costos por lote.
  * Libro de tratamientos veterinarios y uso de antibióticos.

---

## 19. Módulo de Auditoría
* **Propósito:** Registro forense inmutable de todas las operaciones realizadas en el sistema.
* **Entidades:** `AuditLog`.
* **Reglas de Negocio:**
  * Almacena usuario, fecha/hora UTC, dirección IP, acción (`CREATE`, `UPDATE`, `DELETE`, `VOID`), módulo, entidad, valores antes y después en JSON.
  * Los registros de auditoría no pueden ser editados ni eliminados por ningún usuario desde la aplicación.
