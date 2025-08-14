# Portal Sandoval Backend

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Production](https://img.shields.io/badge/production-ready-success.svg)

## 🚀 Sistema de Gestión Empresarial - Backend API

**Portal Sandoval** es una plataforma completa de gestión empresarial desarrollada con Django REST Framework, diseñada para adaptarse a cualquier tipo de negocio: comerciantes, emprendedores, PYMEs, freelancers, agencias y consultores.

### 🎯 **Creado por Carlos Daniel Sandoval**
- **Arquitecto de Software e Inversor Principal**
- Desarrollado con asistencia de IA avanzada (Cascade AI, Claude AI, ChatGPT, GitHub Copilot)
- Licencia MIT 2025

---

## ✨ Características Principales

### 🎨 **Sistema de Personalización Completo**
- Cambio dinámico del nombre de la aplicación
- Favicon personalizable en tiempo real
- Branding completo adaptable a cualquier empresa

### 📊 **Dashboard Administrativo Avanzado**
- Métricas financieras en tiempo real
- Reportes profesionales (PDF, Excel, CSV)
- Estadísticas de proyectos y tareas

### 🔐 **Seguridad y Autenticación**
- Autenticación JWT (JSON Web Tokens)
- Permisos granulares por usuario
- Recuperación de contraseñas por email

### 📁 **Gestión Completa**
- **Clientes**: CRUD completo con archivado/restauración
- **Proyectos**: Gestión con archivos, URLs de YouTube, costos
- **Tareas**: Seguimiento completo con fechas límite
- **Archivos**: Subida segura de documentos e imágenes

---

## 🐳 Uso con Docker

### Instalación Rápida

```bash
# Descargar la imagen
docker pull carlonchosando/portal-sandoval-backend:latest

# Ejecutar con variables de entorno
docker run -d \
  --name portal-backend \
  -p 8000:8000 \
  -e POSTGRES_DB=portal_db \
  -e POSTGRES_USER=portal_user \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_HOST=tu_db_host \
  -e SECRET_KEY=tu_secret_key \
  carlonchosando/portal-sandoval-backend:latest
```

### Con Docker Compose (Recomendado)

```yaml
version: '3.8'
services:
  backend:
    image: carlonchosando/portal-sandoval-backend:2.0.0
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_DB=portal_db
      - POSTGRES_USER=portal_user
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_HOST=db
      - SECRET_KEY=your-secret-key-here
    depends_on:
      - db
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=portal_db
      - POSTGRES_USER=portal_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🌐 API Endpoints

### 🔑 Autenticación
- `POST /api/v1/token/` - Obtener token de acceso
- `POST /api/v1/token/refresh/` - Refrescar token

### 🎨 Personalización
- `GET/PATCH /api/v1/app-config/` - Configurar nombre y favicon

### 📋 Gestión
- `/api/v1/clients/` - Gestión de clientes
- `/api/v1/projects/` - Gestión de proyectos  
- `/api/v1/tasks/` - Gestión de tareas
- `/api/v1/admin/metrics/` - Métricas del dashboard

### 📖 Documentación Interactiva
- `GET /api/v1/` - API Root con documentación completa

---

## ⚙️ Variables de Entorno Requeridas

```bash
# Base de datos
POSTGRES_DB=portal_db
POSTGRES_USER=portal_user
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Django
SECRET_KEY=tu-clave-secreta-muy-larga-y-segura
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,tu-dominio.com

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
```

---

## 🚀 Características Técnicas

- **Framework**: Django 5.2 + Django REST Framework
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT con refresh tokens
- **Archivos**: Subida multipart/form-data
- **Healthcheck**: Endpoint de salud incluido
- **Usuario**: No-root para seguridad
- **Puerto**: 8000 (interno)

---

## 🔗 Enlaces Útiles

- **Frontend**: [carlonchosando/portal-sandoval-frontend](https://hub.docker.com/r/carlonchosando/portal-sandoval-frontend)
- **Documentación**: Ver README.md en el repositorio
- **Licencia**: MIT License
- **Soporte**: Contactar a Carlos Daniel Sandoval

---

## 🎯 Casos de Uso

✅ **Comerciantes**: Gestión de clientes y ventas  
✅ **Emprendedores**: Seguimiento de proyectos  
✅ **PYMEs**: Control financiero y reportes  
✅ **Freelancers**: Gestión de clientes y tareas  
✅ **Agencias**: Proyectos múltiples y equipos  
✅ **Consultores**: Seguimiento de consultorías  

---

## 📄 Licencia

MIT License - Libre para uso comercial y personal con atribución requerida.

**© 2025 Carlos Daniel Sandoval - Todos los derechos reservados**

---

*Desarrollado con ❤️ por Carlos Daniel Sandoval con asistencia de IA avanzada*
