# 🚀 Despliegue Rápido en Portainer - Portal Sandoval

## ⚡ Configuración Express (5 minutos)

### 1. Crear Stack en Portainer
- **Nombre**: `portal-sandoval`
- **Método**: Repository
- **URL**: `https://github.com/carlonchosando/portal-sandoval`
- **Branch**: `refs/heads/main`
- **Compose path**: `docker-compose.production.yml`

### 2. Variables de Entorno Mínimas

```bash
# Base de datos
POSTGRES_DB=portal_sandoval_prod
POSTGRES_USER=portal_admin
POSTGRES_PASSWORD=MiContraseñaSuperSegura2024!

# Django
SECRET_KEY=django-insecure-CAMBIA_ESTA_CLAVE_POR_UNA_NUEVA
DEBUG=False
DJANGO_ALLOWED_HOSTS=*

# Usuario Administrador (¡CAMBIA ESTAS CREDENCIALES!)
DJANGO_SUPERUSER_USERNAME=miadmin
DJANGO_SUPERUSER_EMAIL=mi@email.com
DJANGO_SUPERUSER_PASSWORD=MiPasswordAdmin2024!

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### 3. Generar SECRET_KEY Segura

Ejecuta en tu terminal local:
```bash
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 4. Desplegar
- Haz clic en **"Deploy the stack"**
- Espera 2-3 minutos a que se construyan las imágenes
- ¡Listo!

### 5. Acceder
- **Frontend**: `http://tu-servidor:3000`
- **Admin Panel**: `http://tu-servidor:8000/admin/`
- **API**: `http://tu-servidor:8000/api/v1/`

## 🔐 IMPORTANTE - Seguridad

### ⚠️ Después del primer acceso:
1. Cambia las credenciales del administrador
2. Actualiza `DJANGO_ALLOWED_HOSTS` con tu dominio real
3. Configura HTTPS si es posible

### 🔧 Puertos por defecto:
- Backend: `8000`
- Frontend: `3000`
- Database: `5432`

## 🆘 Solución Rápida de Problemas

### Contenedores no inician:
```bash
# Ver logs en Portainer:
Containers > Selecciona contenedor > Logs
```

### Error de conexión DB:
- Verifica `POSTGRES_PASSWORD`
- Asegúrate que el contenedor `db` esté corriendo

### Frontend no conecta:
- Verifica `REACT_APP_API_URL`
- Debe apuntar a tu servidor real, no localhost

## 📞 Archivos de Referencia

- **Guía completa**: `PORTAINER_DEPLOYMENT.md`
- **Variables completas**: `.env.production.example`
- **Docker Compose**: `docker-compose.production.yml`

---
**¡Portal Sandoval listo en 5 minutos!** 🎉
