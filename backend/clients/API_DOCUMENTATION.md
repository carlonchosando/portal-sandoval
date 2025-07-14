# Documentación de la API - Portal Sandoval

Este documento describe los endpoints disponibles en la API del Portal Sandoval, cómo usarlos, qué datos enviar y qué respuestas esperar.

_Última actualización: 13 de Julio, 2025_

---

## Información General

- **URL Base:** `http://localhost:8000/api/v1/`
- **Formato de Datos:** Todas las peticiones y respuestas son en formato `JSON`.
- **Autenticación:** La mayoría de los endpoints requieren autenticación mediante JSON Web Tokens (JWT). Debes incluir el token de acceso en la cabecera de tus peticiones de la siguiente manera:
  ```
  Authorization: Bearer <tu_access_token>
  ```

---

## 1. Autenticación

### Obtener Tokens de Acceso

- **Endpoint:** `token/`
- **Método:** `POST`
- **Descripción:** Permite a un usuario iniciar sesión y obtener sus tokens de acceso y refresco.
- **Autenticación:** No requerida.
- **Cuerpo de la Petición (Request Body):**
  ```json
  {
    "username": "nombre_de_usuario_cliente",
    "password": "la_contraseña_del_cliente"
  }
  ```
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 2. Clientes (`clients`)

### Listar Clientes Activos
- **Endpoint:** `clients/`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todos los clientes que no están archivados.
- **Respuesta (Ejemplo de un cliente en la lista):**
  ```json
  {
    "id": 1,
    "user": { "id": 2, "username": "cliente_ejemplo", "email": "cliente@ejemplo.com" },
    "business_name": "Empresa Ejemplo",
    "is_active": true,
    "initial_cost": "50000.00",
    "extra_cost": "15000.00",
    "total_cost": "65000.00"
  }
  ```

### Crear un Cliente
- **Endpoint:** `clients/`
- **Método:** `POST`
- **Descripción:** Crea un nuevo cliente y su usuario asociado.
- **Cuerpo de la Petición:**
  ```json
  {
    "business_name": "Nombre de la Empresa",
    "contact_name": "Nombre del Contacto",
    "phone": "1122334455",
    "internal_notes": "Notas internas sobre el cliente.",
    "username": "usuario_nuevo",
    "email": "correo@empresa.com",
    "password": "una_contraseña_segura"
  }
  ```

### Obtener, Actualizar o Archivar un Cliente
- **Endpoint:** `clients/<id>/`
- **Métodos:**
  - `GET`: Obtiene los detalles de un cliente específico.
  - `PATCH`: Actualiza parcialmente los datos de un cliente o su usuario. Puedes enviar solo los campos que quieres cambiar.
  - `DELETE`: Archiva un cliente (soft delete).

### Listar Clientes Archivados
- **Endpoint:** `clients/archived/`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de los clientes archivados.

### Restaurar un Cliente
- **Endpoint:** `clients/<id>/restore/`
- **Método:** `POST`
- **Descripción:** Restaura un cliente previamente archivado.

---

## 3. Proyectos (`projects`)

### Listar Proyectos
- **Endpoint:** `projects/`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todos los proyectos con sus costes calculados.
- **Respuesta (Ejemplo de un proyecto en la lista):**
  ```json
  {
    "id": 1,
    "name": "Campaña de Marketing Digital",
    "client": { "id": 1, "business_name": "Empresa Ejemplo" },
    "status": "EN_PROGRESO",
    "initial_cost": "50000.00",
    "extra_cost": "15000.00",
    "total_cost": "65000.00",
    "task_count": 3
  }
  ```

### Crear un Proyecto
- **Endpoint:** `projects/`
- **Método:** `POST`
- **Descripción:** Crea un nuevo proyecto.
- **Cuerpo de la Petición (form-data):**
  - `name`: "Nombre del Nuevo Proyecto"
  - `client_id`: ID del cliente al que pertenece (Importante: el campo se llama `client_id`)
  - `description`: "Descripción detallada del proyecto."
  - `status`: "PENDIENTE" (o el estado inicial que corresponda)
  - `initial_cost`: "60000.00"

### Obtener Detalles de un Proyecto
- **Endpoint:** `projects/<id>/`
- **Método:** `GET`

### Actualizar un Proyecto
- **Endpoint:** `projects/<id>/`
- **Método:** `PATCH`
- **Descripción:** Actualiza parcialmente los datos de un proyecto.

### Obtener Tareas de un Proyecto Específico
- **Endpoint:** `projects/<projectId>/tasks/`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todas las tareas que pertenecen al proyecto con el ID `projectId`.

---

## 4. Tareas (`tasks`)

### Listar Todas las Tareas
- **Endpoint:** `tasks/`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todas las tareas de todos los proyectos.
- **Respuesta (Ejemplo de una tarea en la lista):**
  ```json
  {
    "id": 1,
    "project_name": "Campaña de Marketing Digital",
    "client_name": "Empresa Ejemplo",
    "title": "Diseñar creativos para la campaña",
    "status": "PENDIENTE",
    "cost": "2500.50",
    "attachment": "/media/task_attachments/reporte.pdf"
  }
  ```

### Crear una Tarea
- **Endpoint:** `tasks/`
- **Método:** `POST`
- **Descripción:** Crea una nueva tarea asociada a un proyecto.
- **Cuerpo de la Petición (form-data):**
  - `project`: ID del proyecto al que pertenece
  - `title`: "Título de la nueva tarea"
  - `description`: (Opcional) "Descripción de la tarea."
  - `due_date`: (Opcional) "YYYY-MM-DD"
  - `status`: (Opcional, por defecto 'PENDIENTE') "PENDIENTE"
  - `cost`: (Opcional, por defecto 0.00) "2500.50"
  - `attachment`: (Opcional) El archivo a subir.
  - `youtube_url`: (Opcional) "https://..."

### Obtener, Actualizar o Eliminar una Tarea
- **Endpoint:** `tasks/<id>/`
- **Métodos:**
  - `GET`: Obtiene los detalles de una tarea específica.
  - `PATCH`: Actualiza parcialmente los datos de una tarea.
  - `DELETE`: Elimina permanentemente una tarea.