# 🚀 Portal Sandoval

<div align="center">

![Portal Sandoval](https://img.shields.io/badge/Portal%20Sandoval-v2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![Production](https://img.shields.io/badge/Production-Ready-success?style=for-the-badge)

**Sistema integral de gestión empresarial para comercios, emprendedores y negocios de cualquier tamaño**

*Centraliza la gestión de clientes, proyectos, tareas, comunicación y seguimiento financiero en una sola plataforma profesional*

</div>

---

## 👨‍💻 **Creador y Desarrollador**

**🎯 Carlos Daniel Sandoval**
- **Creador e Inversor Principal** del proyecto Portal Sandoval
- **Arquitecto de Software** y visionario del sistema
- **Inversor de tiempo y recursos** para hacer realidad esta solución empresarial

*"Portal Sandoval nació de la necesidad real de tener un sistema completo y personalizable para gestionar cualquier tipo de negocio, desde emprendimientos hasta empresas establecidas."*

---

## 🌟 **¿Qué es Portal Sandoval?**

Portal Sandoval es una **plataforma web completa y profesional** diseñada para revolucionar la gestión empresarial. No importa si eres:

- 🏪 **Comerciante local** - Gestiona tu tienda y clientes
- 🚀 **Emprendedor** - Organiza tus proyectos y finanzas
- 🏢 **Pequeña/Mediana empresa** - Centraliza todas tus operaciones
- 💼 **Freelancer** - Controla tus clientes y proyectos
- 🎯 **Agencia de servicios** - Administra múltiples clientes
- 📈 **Consultor** - Seguimiento completo de proyectos

**Portal Sandoval se adapta a tu negocio, no al revés.**

---

## ✨ **Características Principales**

### 🎨 **Sistema de Personalización Completo**
- **Nombre de aplicación personalizable** - Cambia "Portal Sandoval" por el nombre de tu empresa
- **Favicon personalizable** - Sube tu logo y se reflejará en toda la aplicación
- **Branding dinámico** - Tu marca en cada reporte, pantalla y documento

### 👥 **Gestión de Clientes**
- Base de datos completa de clientes
- Historial de interacciones
- Información de contacto centralizada
- Seguimiento de estado de clientes

### 📊 **Gestión de Proyectos**
- Creación y seguimiento de proyectos
- Asignación de clientes a proyectos
- Control de costos y presupuestos
- Estados de proyecto personalizables
- Integración con YouTube y archivos adjuntos

### ✅ **Gestión de Tareas**
- Sistema completo de tareas por proyecto
- Estados personalizables (Pendiente, En Progreso, Completada)
- Asignación de costos por tarea
- Archivos adjuntos y enlaces
- Seguimiento temporal

### 📈 **Dashboard Administrativo**
- **Métricas financieras en tiempo real**
- **Reportes profesionales en PDF, Excel y CSV**
- **Gráficos interactivos** con estadísticas de proyectos
- **Filtros por cliente** para análisis específicos
- **Resumen ejecutivo** con KPIs importantes

### 🔐 **Seguridad y Autenticación**
- Sistema de usuarios con JWT
- Autenticación segura
- Recuperación de contraseñas
- Protección de datos empresariales

---

## 🏗️ **Arquitectura Tecnológica**

### **Backend (API REST)**
- **Django 5.2** - Framework web robusto y escalable
- **Django REST Framework** - API REST profesional
- **PostgreSQL** - Base de datos empresarial
- **JWT Authentication** - Autenticación segura
- **Docker** - Contenerización para deployment

### **Frontend (SPA)**
- **React 18** - Interfaz de usuario moderna y reactiva
- **Context API** - Gestión de estado global
- **Responsive Design** - Compatible con todos los dispositivos
- **Professional UI/UX** - Diseño empresarial elegante

### **DevOps y Deployment**
- **Docker & Docker Compose** - Contenerización completa
- **NGINX** - Servidor web de producción
- **SSL/HTTPS** - Seguridad en producción
- **DockerHub** - Imágenes listas para deployment

---

## 📂 **Estructura del Proyecto**

```
Portal-Sandoval/
├── 🐍 backend/                          # Django API REST
│   ├── clients/                         # Gestión de clientes
│   ├── projects/                        # Gestión de proyectos
│   ├── tasks/                          # Gestión de tareas
│   ├── portal_sandoval_project/        # Configuración principal
│   └── templates/                      # Templates Django
├── ⚛️ frontend/                         # React SPA
│   ├── src/
│   │   ├── components/                 # Componentes reutilizables
│   │   ├── pages/                      # Páginas principales
│   │   ├── contexts/                   # Context API
│   │   └── utils/                      # Utilidades
│   └── public/                         # Archivos estáticos
├── 🐳 docker-compose.yml               # Desarrollo local
├── 🐳 docker-compose.production.yml    # Producción
├── 🚀 build-and-push-dockerhub.sh     # Script de deployment
├── 🌐 nginx-external-config-example.conf # Configuración NGINX
├── 📋 .env.production.example          # Variables de entorno
└── 📚 docs/                            # Documentación
```

---

## 🚀 **Instalación y Configuración**

### **Opción 1: Desarrollo Local**

1. **Clonar el repositorio:**
```bash
git clone https://github.com/carlonchosando/Portal-Sandoval.git
cd Portal-Sandoval
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Levantar con Docker:**
```bash
docker-compose up --build
```

4. **Acceder a la aplicación:**
- Frontend: http://localhost:3000
- Backend Admin: http://localhost:8000/admin/
- API: http://localhost:8000/api/v1/

### **Opción 2: Producción con DockerHub**

```bash
# Usar imágenes pre-construidas
docker-compose -f docker-compose.production.yml up -d
```

---

## 📊 **Capturas de Pantalla**

### Dashboard Administrativo
- Métricas financieras en tiempo real
- Gráficos interactivos de proyectos
- Reportes profesionales exportables

### Gestión de Clientes
- Lista completa de clientes
- Formularios de edición profesionales
- Historial de proyectos por cliente

### Sistema de Reportes
- Exportación a PDF, Excel y CSV
- Filtros avanzados por cliente
- Diseño corporativo personalizable

---

## 🎯 **Casos de Uso Reales**

### **Para Emprendedores:**
- Gestiona tus primeros clientes
- Controla costos y ganancias
- Genera reportes profesionales para inversores

### **Para Comercios:**
- Administra tu base de clientes
- Controla inventarios como proyectos
- Seguimiento de ventas y servicios

### **Para Agencias:**
- Múltiples clientes y proyectos
- Reportes por cliente
- Control de rentabilidad por proyecto

### **Para Freelancers:**
- Gestión de clientes y proyectos
- Control de tiempo y costos
- Reportes profesionales para clientes

---

## 🔧 **Personalización**

Portal Sandoval incluye un **sistema de personalización completo**:

1. **Cambiar nombre de la aplicación** desde Django Admin
2. **Subir tu favicon/logo** personalizado
3. **Branding automático** en toda la aplicación
4. **Reportes con tu marca** en PDF, Excel y CSV

Ver documentación completa en: [`PERSONALIZACION_README.md`](PERSONALIZACION_README.md)

---

## 🌐 **Deployment en Producción**

### **Imágenes Docker Listas:**
- `carlonchosando/portal-sandoval-backend:latest`
- `carlonchosando/portal-sandoval-frontend:latest`

### **Compatible con:**
- ✅ **OpenMediaVault + Portainer**
- ✅ **Docker Swarm**
- ✅ **Kubernetes**
- ✅ **VPS tradicionales**
- ✅ **Cloud providers** (AWS, GCP, Azure)

### **Configuración NGINX:**
Incluye configuración completa para NGINX reverse proxy con SSL/HTTPS.

---

## 🤝 **Contribuciones**

Portal Sandoval es un proyecto de **código abierto** que acepta contribuciones de la comunidad:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

---

## 🤖 **Desarrollo Asistido por IA**

Este proyecto ha sido desarrollado con la asistencia de tecnologías de **Inteligencia Artificial avanzadas**:

- **🧠 Cascade AI (Windsurf)** - Asistente principal de desarrollo y arquitectura
- **🤖 Claude AI (Anthropic)** - Análisis de código y optimización
- **⚡ ChatGPT (OpenAI)** - Resolución de problemas específicos
- **🔍 GitHub Copilot** - Asistencia en codificación

*La combinación de experiencia humana y asistencia de IA ha permitido crear una solución robusta y profesional en tiempo récord.*

---

## 📄 **Licencia**

```
MIT License

Copyright (c) 2025 Carlos Daniel Sandoval

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 **Contacto y Soporte**

**Carlos Daniel Sandoval**
- 🌐 **GitHub:** [@carlonchosando](https://github.com/carlonchosando)
- 📧 **Email:** [Contacto disponible en GitHub]
- 💼 **LinkedIn:** [Perfil profesional]

### **Soporte del Proyecto:**
- 🐛 **Issues:** [GitHub Issues](https://github.com/carlonchosando/Portal-Sandoval/issues)
- 📖 **Wiki:** [Documentación completa](https://github.com/carlonchosando/Portal-Sandoval/wiki)
- 💬 **Discusiones:** [GitHub Discussions](https://github.com/carlonchosando/Portal-Sandoval/discussions)

---

## 🏆 **Reconocimientos**

### **Creador Principal:**
**Carlos Daniel Sandoval** - Visionario, arquitecto y desarrollador principal que invirtió tiempo, recursos y experiencia para crear esta solución empresarial completa.

### **Tecnologías y Herramientas:**
- Django & React communities
- Docker & PostgreSQL teams
- Open source contributors worldwide

### **Asistencia de IA:**
Agradecimiento especial a las tecnologías de IA que aceleraron el desarrollo y mejoraron la calidad del código.

---

<div align="center">

### ⭐ **Si Portal Sandoval te ayuda en tu negocio, ¡dale una estrella!** ⭐

**Hecho con ❤️ por Carlos Daniel Sandoval**

*Transformando la gestión empresarial, un negocio a la vez*

---

![GitHub stars](https://img.shields.io/github/stars/carlonchosando/Portal-Sandoval?style=social)
![GitHub forks](https://img.shields.io/github/forks/carlonchosando/Portal-Sandoval?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/carlonchosando/Portal-Sandoval?style=social)

</div>
