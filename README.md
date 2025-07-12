# Portal Sandoval

**Portal Sandoval** es una aplicación web para centralizar la gestión de clientes, proyectos, comunicación y seguimiento de pagos para servicios de marketing digital.

Este proyecto está construido con un enfoque moderno, utilizando contenedores de Docker para asegurar un entorno de desarrollo y producción consistente y fácil de manejar.

## 🚀 Stack Tecnológico

* **Contenerización:** Docker & Docker Compose
* **Backend:** Python con el framework Django y Django REST Framework.
* **Frontend:** JavaScript con la librería React.
* **Base de Datos:** PostgreSQL.

## 📂 Estructura del Proyecto

Portal-Sandoval/
├── backend/         # Contiene todo el código de Django (API)
├── frontend/        # Contiene todo el código de React (Interfaz de Usuario)
├── .env.example     # Archivo de ejemplo para las variables de entorno
├── docker-compose.yml # El archivo que orquesta todos los contenedores
└── README.md        # Este archivo

```
Portal-Sandoval/
├── backend/         # Contiene todo el código de Django (API)
├── frontend/        # Contiene todo el código de React (Interfaz de Usuario)
├── .env.example     # Archivo de ejemplo para las variables de entorno
├── docker-compose.yml # El archivo que orquesta todos los contenedores
└── README.md        # Este archivo
```

## ⚙️ Configuración Inicial (¡Solo se hace una vez!)

Sigue estos pasos para levantar el proyecto por primera vez en tu máquina.

### Paso 1: Preparar las Variables de Entorno

Este proyecto necesita algunas claves y contraseñas para funcionar. Por seguridad, no se guardan directamente en el código, sino en un archivo `.env` que solo existirá en tu máquina.

1. Crea una copia del archivo de ejemplo `.env.example` y renómbrala a `.env`.

    ```bash
    cp .env.example .env
    ```

2. Abre el nuevo archivo `.env` con un editor de texto.

3. Rellena los valores. Puedes usar los que están en `.env.example` para empezar.
    * **IMPORTANTE:** Para `SECRET_KEY`, debes generar una clave única y secreta. Puedes usar un generador online o ejecutar este comando en tu terminal para crear una:

        ```bash
        python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
        ```

        Pega el resultado en el archivo `.env`.

### Paso 2: Construir y Levantar los Contenedores

Este es el paso mágico de Docker. Con un solo comando, Docker leerá el archivo `docker-compose.yml`, descargará las imágenes necesarias (como Python, Node.js y PostgreSQL), construirá tus aplicaciones de backend y frontend, y las conectará entre sí.

1. Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

2. Abre una terminal y navega hasta la raíz de este proyecto (`Portal-Sandoval/`).

3. Ejecuta el siguiente comando:

    ```bash
    docker-compose up --build
    ```

    * `--build`: Esta bandera le dice a Docker que construya las imágenes desde cero la primera vez (o si has hecho cambios en los `Dockerfile`).
    * La primera vez, este proceso puede tardar varios minutos mientras se descargan y configuran todas las dependencias. ¡Ten paciencia!

### Paso 3: ¡Verifica que todo funciona

Una vez que el comando anterior termine y veas los logs de los servicios corriendo, abre tu navegador web y visita:

* **Frontend (React):** `http://localhost:3000`
  * Deberías ver una página de bienvenida de React.
* **Backend (Django Admin):** `http://localhost:8000/admin/`
  * Deberías ver la página de inicio de sesión del administrador de Django. ¡Esto confirma que el backend y la base de datos están funcionando y conectados!

### Paso 4: Crear un Superusuario (Administrador)

Para poder entrar al panel de administrador de Django, necesitas crear una cuenta de administrador.

1. Asegúrate de que los contenedores estén corriendo (`docker-compose up`).

2. Abre **una nueva terminal** (no cierres la que está ejecutando `docker-compose`).

3. Navega a la carpeta `Portal-Sandoval/` y ejecuta el siguiente comando:

    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```

4. Sigue las instrucciones en la terminal para crear tu nombre de usuario, email y contraseña.

5. ¡Listo! Ahora puedes ir a `http://localhost:8000/admin/` y entrar con las credenciales que acabas de crear.

## ▶️ Cómo Iniciar y Detener el Entorno

* **Para iniciar:** `docker-compose up` (desde la carpeta del proyecto)
* **Para detener:** `docker-compose down` (esto apaga y elimina los contenedores, pero tus datos en la base de datos y tu código se conservan gracias a los volúmenes de Docker).
