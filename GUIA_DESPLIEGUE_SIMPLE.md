# 🚀 Guía de Despliegue Simple - Portal Sandoval

## ¿Qué problemas se solucionaron?

Como desarrollador frontend junior, es importante que entiendas qué problemas tenía el docker-compose original y cómo los solucioné:

### 🔧 Problemas Solucionados:

1. **❌ Healthchecks fallaban**: Los contenedores usaban `curl` pero no estaba instalado
   - **✅ Solución**: Cambié a usar `python requests` para backend y `wget` para frontend

2. **❌ Frontend en modo desarrollo**: Usaba `npm start` que no es para producción
   - **✅ Solución**: Ahora usa `npm run build` + `serve` para servir archivos optimizados

3. **❌ Variables de entorno inconsistentes**: Algunos valores estaban hardcodeados
   - **✅ Solución**: Hice las URLs dinámicas usando variables de entorno

4. **❌ Directorios no existían**: Los volúmenes podían fallar si no existían las carpetas
   - **✅ Solución**: Creé un script `init-directories.sh` que prepara todo

## 🎯 Pasos para Desplegar (¡Súper Simple!)

### 1. Preparar el entorno
```bash
# Ejecuta el script de inicialización (crea todas las carpetas necesarias)
./init-directories.sh
```

### 2. Configurar variables de entorno
```bash
# Copia tu archivo de configuración
cp .env.tu-omv .env
```

### 3. ¡Desplegar!
```bash
# Construir e iniciar todos los servicios
docker-compose -f docker-compose.production.yml up -d --build
```

### 4. Verificar que todo funciona
```bash
# Ver el estado de los contenedores
docker-compose -f docker-compose.production.yml ps

# Ver los logs si algo falla
docker-compose -f docker-compose.production.yml logs
```

## 🌐 URLs de Acceso

Una vez desplegado, podrás acceder a:

- **Frontend (React)**: http://tu-servidor:3001
- **Backend API (Django)**: http://tu-servidor:8080
- **Admin Django**: http://tu-servidor:8080/admin

## 🔍 ¿Qué hace cada servicio?

### Backend (Django)
- **Puerto**: 8080 (configurable con `BACKEND_PORT`)
- **Función**: API REST, administración, base de datos
- **Healthcheck**: Verifica que Django responda correctamente

### Frontend (React)
- **Puerto**: 3001 (configurable con `FRONTEND_PORT`)
- **Función**: Interfaz de usuario optimizada para producción
- **Healthcheck**: Verifica que el servidor web responda

### Base de Datos (PostgreSQL)
- **Puerto**: 5433 (configurable con `DB_PORT`)
- **Función**: Almacena todos los datos de la aplicación
- **Healthcheck**: Verifica conexión a la base de datos

## 🚨 Comandos Útiles para Debugging

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Reiniciar un servicio específico
docker-compose -f docker-compose.production.yml restart backend

# Entrar a un contenedor para debugging
docker-compose -f docker-compose.production.yml exec backend bash

# Parar todo
docker-compose -f docker-compose.production.yml down

# Parar y eliminar volúmenes (¡CUIDADO! Borra datos)
docker-compose -f docker-compose.production.yml down -v
```

## 🎓 Lo que Aprendiste

1. **Healthchecks**: Son verificaciones automáticas que Docker hace para saber si un contenedor está funcionando bien
2. **Modo Producción**: React necesita ser "compilado" (`npm run build`) para ser más rápido en producción
3. **Variables de Entorno**: Permiten configurar la aplicación sin cambiar código
4. **Volúmenes**: Guardan datos importantes fuera de los contenedores para que no se pierdan
5. **Dependencias**: Los servicios pueden esperar a que otros estén listos antes de iniciarse

## 🔧 Personalización

Si quieres cambiar puertos o configuraciones, edita el archivo `.env`:

```bash
# Cambiar puertos
BACKEND_PORT=8090
FRONTEND_PORT=3005
DB_PORT=5435

# Cambiar rutas de datos
OMV_DATA_PATH=/tu/ruta/personalizada
```

¡Ahora tienes una configuración robusta y lista para producción! 🎉
