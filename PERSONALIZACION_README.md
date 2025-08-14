# 🎨 Sistema de Personalización - Portal Sandoval

## 📋 Descripción

Sistema completo de personalización que permite cambiar el **nombre de la aplicación** y el **favicon** dinámicamente. Los cambios se reflejan en toda la aplicación: header, reportes PDF/Excel/CSV, templates Django y título del navegador.

## ✨ Características

- ✅ **Nombre personalizable** en tiempo real
- ✅ **Favicon personalizable** con carga dinámica
- ✅ **Persistencia en base de datos** (PostgreSQL)
- ✅ **Interfaz de administración** (Django Admin)
- ✅ **API REST** para integración frontend
- ✅ **Context global** en React
- ✅ **Compatible con producción** y Docker

## 🏗️ Arquitectura

### Backend (Django)
```
clients/
├── models.py              # Modelo AppConfiguration
├── serializers.py         # AppConfigurationSerializer
├── views.py              # AppConfigurationView (API)
├── admin.py              # Registro en Django Admin
├── context_processors.py # Context processor para templates
├── management/commands/   # Comando de inicialización
└── fixtures/             # Datos iniciales
```

### Frontend (React)
```
src/
├── contexts/
│   └── AppConfigContext.js    # Context y Provider global
├── components/
│   ├── AppConfigForm.js       # Formulario de configuración
│   └── AppConfigForm.css      # Estilos del formulario
└── App.js                     # Integración del Provider
```

## 🚀 Uso en Producción

### 1. Configuración Automática
El sistema se inicializa automáticamente en Docker:

```bash
# El script init_production.sh ejecuta:
python3 manage.py migrate
python3 manage.py init_app_config
python3 manage.py collectstatic --noinput
```

### 2. Administración desde Django Admin
1. Acceder a `http://localhost:8000/admin/`
2. Ir a **"Configuración de la Aplicación"**
3. Editar nombre y subir favicon
4. Los cambios se aplican inmediatamente

### 3. API REST
```javascript
// Obtener configuración
GET /api/v1/app-config/

// Actualizar configuración
PATCH /api/v1/app-config/
{
  "app_name": "Mi Empresa Pro",
  "favicon": <archivo>
}
```

## 📍 Lugares Actualizados

### Frontend (React)
- ✅ Header principal (`App.js`)
- ✅ Título del navegador (dinámico)
- ✅ Favicon (carga dinámica)
- ✅ Reportes PDF (AdminDashboard.js)
- ✅ Exportaciones Excel/CSV
- ✅ Pie de página de reportes

### Backend (Django)
- ✅ Templates de reset de contraseña
- ✅ Títulos de páginas
- ✅ Context processor global

## 🔧 Configuración Técnica

### Settings.py
```python
TEMPLATES = [
    {
        'OPTIONS': {
            'context_processors': [
                # ... otros processors
                'clients.context_processors.app_config',
            ],
        },
    },
]
```

### Modelo de Datos
```python
class AppConfiguration(models.Model):
    app_name = models.CharField(max_length=100, default="Portal Sandoval")
    favicon = models.ImageField(upload_to='config/favicons/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## 🎯 Ejemplo de Uso

### En React Components
```javascript
import { useAppConfig } from '../contexts/AppConfigContext';

function MyComponent() {
  const { appName, faviconUrl, updateConfig } = useAppConfig();
  
  return (
    <div>
      <h1>{appName}</h1>
      {faviconUrl && <img src={faviconUrl} alt="favicon" />}
    </div>
  );
}
```

### En Templates Django
```html
<title>{{ app_name }} - Mi Página</title>
<h1>{{ app_name }}</h1>
{% if app_favicon_url %}
  <link rel="icon" href="{{ app_favicon_url }}">
{% endif %}
```

## 🔄 Flujo de Actualización

1. **Usuario actualiza** configuración en Django Admin
2. **Base de datos** se actualiza automáticamente
3. **API endpoint** devuelve nueva configuración
4. **React Context** detecta cambios y actualiza
5. **Toda la aplicación** se actualiza en tiempo real
6. **Favicon y título** se cambian dinámicamente

## 🛡️ Seguridad y Validación

- ✅ **Singleton pattern** - Solo una configuración
- ✅ **Validación de archivos** - Solo imágenes para favicon
- ✅ **Permisos de admin** - Solo administradores pueden cambiar
- ✅ **Fallback values** - Valores por defecto si hay errores
- ✅ **Error handling** - Manejo robusto de errores

## 📦 Archivos de Producción

### Docker
- `init_production.sh` - Script de inicialización automática
- Migraciones automáticas
- Configuración inicial garantizada

### Archivos Media
- Favicon se guarda en `media/config/favicons/`
- URLs servidas correctamente en producción
- Backup automático con base de datos

## 🎉 Resultado Final

El usuario puede personalizar completamente el branding de la aplicación:
- **Cambiar "Portal Sandoval"** por cualquier nombre
- **Subir su propio favicon** 
- **Ver cambios inmediatamente** en toda la aplicación
- **Mantener personalización** en producción

¡Sistema 100% funcional y listo para producción! 🚀
