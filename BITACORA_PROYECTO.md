# Bitácora de Progreso: Portal Sandoval

Este documento sirve como una memoria y un registro del estado de desarrollo del proyecto "Portal Sandoval".

_Última actualización: 13 de Julio, 2025_

---

## ✅ Estado Actual de la Aplicación

La aplicación se encuentra en un estado **muy estable y funcional**. El módulo de Clientes está completo y es robusto, sirviendo como modelo para el resto de la aplicación.

-   **Entorno Docker:** Estable y funcionando (Backend, Frontend, Base de Datos).
-   **Autenticación:** El sistema de Login/Logout con tokens JWT es robusto.
-   **Módulos Principales:**
    -   [x] **Clientes:** Funcionalidad completa (Crear, Leer, Actualizar, Archivar, Restaurar).
    -   [x] **Cálculo de Costes:** La API calcula y muestra automáticamente el coste inicial, extra y total por cliente.
    -   [ ] **Proyectos:** Funcionalidad básica (Crear, Listar). Pendiente de implementar Edición y Archivado.
    -   [ ] **Tareas:** Funcionalidad básica (Crear, Listar, Actualizar estado).
-   **Interactividad:**
    -   [x] Se puede cambiar el estado de una tarea (Pendiente/Completada) desde la interfaz.
-   **Navegación:**
    -   [x] Implementado un sistema de rutas con una página principal (Dashboard) y una página de detalle para cada proyecto.

---

## 🏆 Último Logro Conseguido

¡FUNCIONALIDAD COMPLETA PARA CLIENTES! Se ha implementado con éxito todo el ciclo de vida para la gestión de Clientes, incluyendo:
*   **Edición en línea:** Un formulario intuitivo permite modificar todos los datos del cliente, incluyendo sus credenciales de acceso.
*   **Archivado y Restauración (Soft-Delete):** En lugar de borrar, los clientes se archivan, preservando la integridad de los datos. Se pueden restaurar en cualquier momento.
*   **Cálculo de Costes Automatizado:** La API ahora calcula y muestra el coste inicial, extra y total para cada cliente, proporcionando una visión financiera clara en el Dashboard.

---

## 🚀 Próximos Pasos Sugeridos

1.  **Implementar el Ciclo Completo para Proyectos:**
    *   Replicar la lógica de **Edición, Archivado y Restauración** que implementamos para los Clientes, pero ahora para los Proyectos.
2.  **Mejorar la Página de Detalle del Proyecto:**
    *   Mostrar el desglose de costes del proyecto (coste inicial + suma de costes de tareas).
    *   Añadir un formulario para crear tareas que pertenezcan **directamente** a ese proyecto, mejorando el flujo de trabajo.

---

## 🔧 Comandos de Emergencia (¡Tu Caja de Herramientas!)

Estos son los comandos que hemos usado para solucionar los problemas más comunes. Guárdalos bien. **Recuerda ejecutarlos siempre desde la carpeta principal `Portal-Sandoval/`**.

### Para reiniciar los servicios (la forma normal)

```bash
# Detener los servicios (sin borrar datos)
docker-compose down

# Iniciar los servicios
docker-compose up
