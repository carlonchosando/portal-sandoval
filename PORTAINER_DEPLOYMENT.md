# 🚀 Guía de Despliegue en Portainer - Portal Sandoval

Esta guía te ayudará a desplegar Portal Sandoval en Portainer usando Docker Compose desde el repositorio de GitHub.

## 📋 Requisitos Previos

- Portainer instalado y funcionando
- Acceso a Portainer con permisos de administrador
- Servidor con Docker y Docker Compose
- Acceso al repositorio: `https://github.com/carlonchosando/portal-sandoval.git`

## 🔧 Paso a Paso para Despliegue

### 1. Acceder a Portainer

1. Abre tu navegador y ve a tu instancia de Portainer
2. Inicia sesión con tus credenciales de administrador
3. Selecciona el environment donde quieres desplegar

### 2. Crear un Nuevo Stack

1. En el menú lateral, haz clic en **"Stacks"**
2. Haz clic en **"+ Add stack"**
3. Asigna un nombre al stack: `portal-sandoval`

### 3. Configurar el Stack desde GitHub

1. Selecciona **"Repository"** como método de despliegue
2. Configura los siguientes campos:
   - **Repository URL**: `https://github.com/carlonchosando/portal-sandoval`
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.production.yml`

### 4. Configurar Variables de Entorno

En la sección **"Environment variables"**, agrega las siguientes variables:

#### Variables Obligatorias:
```
# Base de datos
POSTGRES_DB=portal_sandoval_prod
POSTGRES_USER=portal_admin
POSTGRES_PASSWORD=TU_CONTRASEÑA_SUPER_SEGURA_AQUI

# Django
SECRET_KEY=GENERA_UNA_NUEVA_CLAVE_SECRETA_AQUI
DEBUG=False
DJANGO_ALLOWED_HOSTS=tu-dominio.com,localhost,127.0.0.1

# Usuario Administrador (¡CAMBIA ESTAS CREDENCIALES!)
DJANGO_SUPERUSER_USERNAME=tu_usuario_admin
DJANGO_SUPERUSER_EMAIL=tu_email@dominio.com
DJANGO_SUPERUSER_PASSWORD=tu_contraseña_admin_segura

# Frontend
REACT_APP_API_URL=http://tu-servidor:8000
```

#### Variables Opcionales (puertos personalizados):
```
BACKEND_PORT=8000
FRONTEND_PORT=3000
DB_PORT=5432
HTTP_PORT=80
HTTPS_PORT=443
```

### 5. Generar SECRET_KEY

Para generar una SECRET_KEY segura, puedes usar:

```bash
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

O usar un generador online de claves Django.

### 6. Desplegar el Stack

1. Revisa toda la configuración
2. Haz clic en **"Deploy the stack"**
3. Espera a que Portainer clone el repositorio y construya las imágenes
4. Monitorea los logs para verificar que todo se ejecute correctamente

### 7. Verificar el Despliegue

Una vez desplegado, verifica que los servicios estén funcionando:

1. Ve a **"Containers"** en Portainer
2. Deberías ver 3 contenedores corriendo:
   - `portal_sandoval_backend_prod`
   - `portal_sandoval_db_prod`
   - `portal_sandoval_frontend_prod`

### 8. Usuario Administrador (Creación Automática)

🎉 **¡El usuario administrador se crea automáticamente!**

Si configuraste las variables de entorno correctamente:
- `DJANGO_SUPERUSER_USERNAME`
- `DJANGO_SUPERUSER_EMAIL` 
- `DJANGO_SUPERUSER_PASSWORD`

El sistema creará automáticamente el usuario administrador durante el primer despliegue.

#### ⚠️ IMPORTANTE - Cambiar Credenciales por Defecto

Si usaste las credenciales por defecto, **CÁMBIALAS INMEDIATAMENTE** después del primer acceso:

1. Accede al panel de admin: `http://tu-servidor:8000/admin/`
2. Inicia sesión con las credenciales configuradas
3. Ve a **"Users"** > Selecciona tu usuario admin
4. Cambia el username, email y contraseña
5. Guarda los cambios

#### Crear Usuario Manualmente (si es necesario)

Si necesitas crear un usuario manualmente:

1. Ve al contenedor `portal_sandoval_backend_prod` en Portainer
2. Abre la consola del contenedor
3. Ejecuta:
```bash
python manage.py createsuperuser
```

### 9. Acceder a la Aplicación

Una vez desplegado exitosamente:

- **Frontend (React)**: `http://tu-servidor:3000`
- **Backend Admin**: `http://tu-servidor:8000/admin/`
- **API**: `http://tu-servidor:8000/api/v1/`

## 🔒 Configuraciones de Seguridad Adicionales

### Para Producción Real:

1. **Cambiar ALLOWED_HOSTS**: Reemplaza `*` por tu dominio real
2. **Usar HTTPS**: Configura SSL/TLS
3. **Configurar Nginx**: Descomenta el servicio nginx en el docker-compose
4. **Backup de Base de Datos**: Configura backups automáticos
5. **Monitoreo**: Configura logs y monitoreo

### Configuración de Nginx (Opcional):

Si quieres usar Nginx como proxy reverso, crea el archivo `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name tu-dominio.com;
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 🛠️ Comandos Útiles

### Gestión del Stack en Portainer:
- **Ver logs**: Selecciona el contenedor > "Logs"
- **Reiniciar servicio**: Selecciona el contenedor > "Restart"
- **Actualizar stack**: Ve a "Stacks" > Selecciona tu stack > "Update"

### Comandos de Django (ejecutar en el contenedor backend):
```bash
# Migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recopilar archivos estáticos
python manage.py collectstatic --noinput

# Shell de Django
python manage.py shell
```

## 🆘 Solución de Problemas

### Problema: Contenedores no inician
- Verifica las variables de entorno
- Revisa los logs de cada contenedor
- Asegúrate de que los puertos no estén en uso

### Problema: Error de conexión a la base de datos
- Verifica las credenciales de PostgreSQL
- Asegúrate de que el contenedor de la DB esté corriendo
- Revisa la configuración de red

### Problema: Frontend no se conecta al backend
- Verifica la variable `REACT_APP_API_URL`
- Asegúrate de que el backend esté accesible
- Revisa la configuración de CORS en Django

## 📞 Soporte

Si tienes problemas durante el despliegue, revisa:
1. Los logs de Portainer
2. Los logs de cada contenedor
3. La configuración de variables de entorno
4. La conectividad de red entre contenedores

¡Listo! Tu Portal Sandoval debería estar funcionando en producción. 🎉
