# Portal Sandoval Frontend

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Production](https://img.shields.io/badge/production-ready-success.svg)

## 🎨 Sistema de Gestión Empresarial - Frontend React

**Portal Sandoval Frontend** es la interfaz de usuario moderna y responsive desarrollada en React 18, diseñada para ofrecer una experiencia de usuario excepcional en la gestión empresarial.

### 🎯 **Creado por Carlos Daniel Sandoval**
- **Arquitecto de Software e Inversor Principal**
- Desarrollado con asistencia de IA avanzada (Cascade AI, Claude AI, ChatGPT, GitHub Copilot)
- Licencia MIT 2025

---

## ✨ Características Principales

### 🎨 **Personalización Dinámica**
- Cambio de nombre de la aplicación en tiempo real
- Favicon personalizable que se actualiza automáticamente
- Branding completo adaptable a cualquier empresa

### 📊 **Dashboard Moderno**
- Interfaz intuitiva y profesional
- Métricas visuales en tiempo real
- Reportes descargables (PDF, Excel, CSV)
- Diseño responsive para todos los dispositivos

### 🔐 **Autenticación Segura**
- Login con JWT tokens
- Refresh automático de sesiones
- Recuperación de contraseñas
- Protección de rutas privadas

### 📱 **Experiencia de Usuario**
- Diseño Material Design moderno
- Iconos profesionales (FontAwesome)
- Animaciones suaves y transiciones
- Formularios intuitivos con validación

---

## 🐳 Uso con Docker

### Instalación Rápida

```bash
# Descargar la imagen
docker pull carlonchosando/portal-sandoval-frontend:latest

# Ejecutar (para desarrollo)
docker run -d \
  --name portal-frontend \
  -p 3000:3000 \
  carlonchosando/portal-sandoval-frontend:latest
```

### Con NGINX Reverse Proxy (Producción Recomendada)

```yaml
version: '3.8'
services:
  frontend:
    image: carlonchosando/portal-sandoval-frontend:2.0.0
    expose:
      - "3000"
    networks:
      - portal-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
    networks:
      - portal-network

networks:
  portal-network:
    driver: bridge
```

### Configuración NGINX Ejemplo

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🌐 Funcionalidades de la Interfaz

### 📋 **Gestión Completa**
- **Dashboard Principal**: Métricas y estadísticas visuales
- **Clientes**: Lista, creación, edición con modal profesional
- **Proyectos**: Gestión completa con archivos y YouTube
- **Tareas**: Seguimiento con estados y fechas límite
- **Reportes**: Generación de PDF, Excel y CSV

### 🎨 **Personalización**
- **Configuración**: Panel para cambiar nombre y favicon
- **Branding**: Actualización automática en toda la app
- **Temas**: Diseño profesional adaptable

### 📱 **Responsive Design**
- **Mobile First**: Optimizado para dispositivos móviles
- **Tablet**: Experiencia perfecta en tablets
- **Desktop**: Interfaz completa para escritorio
- **PWA Ready**: Preparado para Progressive Web App

---

## ⚙️ Configuración

### Variables de Entorno (Build Time)

```bash
# API Backend URL
REACT_APP_API_URL=http://localhost:8000

# Configuración de producción
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0
```

### Configuración de Desarrollo

```bash
# Clonar y configurar
git clone https://github.com/tu-usuario/portal-sandoval.git
cd portal-sandoval/frontend

# Instalar dependencias
npm install

# Configurar variables
cp .env.example .env.local

# Ejecutar en desarrollo
npm start
```

---

## 🚀 Características Técnicas

- **Framework**: React 18 con Hooks
- **Routing**: React Router v6
- **Estado**: Context API + useState/useEffect
- **Estilos**: CSS3 + CSS Modules
- **Iconos**: FontAwesome
- **HTTP**: Axios con interceptors
- **Build**: Create React App optimizado
- **Servidor**: Serve (para producción)
- **Puerto**: 3000 (interno)

---

## 📦 Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.3.0",
  "@fortawesome/react-fontawesome": "^0.2.0",
  "date-fns": "^2.29.0"
}
```

---

## 🔗 Integración con Backend

### Endpoints Utilizados
- `GET /api/v1/` - API Root y documentación
- `POST /api/v1/token/` - Autenticación
- `GET/PATCH /api/v1/app-config/` - Personalización
- `CRUD /api/v1/clients/` - Gestión de clientes
- `CRUD /api/v1/projects/` - Gestión de proyectos
- `CRUD /api/v1/tasks/` - Gestión de tareas
- `GET /api/v1/admin/metrics/` - Métricas del dashboard

### Autenticación
- JWT tokens con refresh automático
- Headers de autorización automáticos
- Manejo de errores 401/403
- Redirección a login cuando expira

---

## 🎯 Casos de Uso

✅ **Administradores**: Panel completo de gestión  
✅ **Gerentes**: Seguimiento de proyectos y equipos  
✅ **Clientes**: Acceso a sus proyectos y tareas  
✅ **Equipos**: Colaboración en proyectos  
✅ **Reportes**: Generación de documentos profesionales  

---

## 🔗 Enlaces Útiles

- **Backend**: [carlonchosando/portal-sandoval-backend](https://hub.docker.com/r/carlonchosando/portal-sandoval-backend)
- **Documentación**: Ver README.md en el repositorio
- **Demo**: Disponible próximamente
- **Soporte**: Contactar a Carlos Daniel Sandoval

---

## 📱 Capturas de Pantalla

*Próximamente: Screenshots del dashboard, gestión de clientes, proyectos y reportes*

---

## 📄 Licencia

MIT License - Libre para uso comercial y personal con atribución requerida.

**© 2025 Carlos Daniel Sandoval - Todos los derechos reservados**

---

*Desarrollado con ❤️ por Carlos Daniel Sandoval con asistencia de IA avanzada*
