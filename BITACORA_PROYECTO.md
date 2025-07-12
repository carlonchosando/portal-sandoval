# Bitácora de Progreso: Portal Sandoval

Este documento sirve como una memoria y un registro del estado de desarrollo del proyecto "Portal Sandoval".

_Última actualización: 10 de Julio, 2025_

---

## ✅ Estado Actual de la Aplicación

La aplicación se encuentra en un estado **estable y funcional**. Hemos superado con éxito la fase de configuración inicial y el núcleo de la aplicación está operativo.

-   **Entorno Docker:** Estable y funcionando (Backend, Frontend, Base de Datos).
-   **Autenticación:** El sistema de Login/Logout con tokens JWT es robusto.
-   **Módulos Principales (CRUD Básico):**
    -   [x] **Clientes:** Se pueden crear y listar.
    -   [x] **Proyectos:** Se pueden crear y asignar a un cliente.
    -   [x] **Tareas:** Se pueden crear y asignar a un proyecto.
-   **Interactividad:**
    -   [ ] Se puede cambiar el estado de una tarea (Pendiente/Completada) desde la interfaz.
-   **Navegación:**
    -   [x] Implementado un sistema de rutas con una página principal (Dashboard) y una página de detalle para cada proyecto.

---

## 🏆 Último Logro Conseguido

¡VICTORIA! Superamos todos los problemas de configuración y la aplicación es estable. El login, la creación de Clientes, Proyectos y Tareas, y la navegación a la página de detalle de proyecto funcionan a la perfección.

---

## 🚀 Próximos Pasos Sugeridos

1.  **Mejorar la Página de Detalle del Proyecto:**
    *   Añadir un formulario para crear tareas que pertenezcan **directamente** a ese proyecto, mejorando el flujo de trabajo.
2.  **Añadir Funcionalidad de Edición:**
    *   Permitir editar el título o la descripción de una tarea o proyecto existente. Esto podría hacerse con un modal o una nueva página de edición.
3.  **Implementar el Módulo de Mensajería:**
    *   Empezar a construir el sistema de comunicación por proyecto, que es una de las funcionalidades clave del portal.

---

## 🔧 Comandos de Emergencia (¡Tu Caja de Herramientas!)

Estos son los comandos que hemos usado para solucionar los problemas más comunes. Guárdalos bien. **Recuerda ejecutarlos siempre desde la carpeta principal `Portal-Sandoval/`**.

### Para reiniciar los servicios (la forma normal)

```bash
# Detener los servicios (sin borrar datos)
docker-compose down

# Iniciar los servicios
docker-compose up
```

### Para ejecutar un comando dentro del backend (como `migrate` o `createsuperuser`)

```bash
docker-compose exec backend python manage.py <comando>
```

### Para la "Limpieza Nuclear" (si todo se rompe de nuevo)

**¡CUIDADO! Esto borrará TODOS los datos de la base de datos.**

```bash
# 1. Desmontar todo lo del proyecto (incluyendo datos)
docker-compose down -v --remove-orphans

# 2. Limpiar todo el sistema Docker
docker system prune -a -f

# 3. (Opcional, si el paso 2 no es suficiente) Reiniciar el motor de Docker
sudo systemctl restart docker

# 4. Volver a levantar todo desde cero
docker-compose up --build
```