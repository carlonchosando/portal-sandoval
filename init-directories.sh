#!/bin/bash
# 🚀 Script de inicialización para Portal Sandoval en OpenMediaVault
# Este script crea todos los directorios necesarios antes del despliegue

echo "🔧 Inicializando directorios para Portal Sandoval..."

# Leer la variable OMV_DATA_PATH del archivo .env si existe
if [ -f .env.tu-omv ]; then
    export $(grep -v '^#' .env.tu-omv | xargs)
fi

# Usar la ruta por defecto si no está definida
OMV_DATA_PATH=${OMV_DATA_PATH:-/srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval}

echo "📁 Creando directorios en: $OMV_DATA_PATH"

# Crear directorio base
sudo mkdir -p "$OMV_DATA_PATH"

# Crear subdirectorios para volúmenes
sudo mkdir -p "$OMV_DATA_PATH/postgres_data"
sudo mkdir -p "$OMV_DATA_PATH/postgres_backups"
sudo mkdir -p "$OMV_DATA_PATH/static"
sudo mkdir -p "$OMV_DATA_PATH/media"
sudo mkdir -p "$OMV_DATA_PATH/logs"

# Establecer permisos apropiados
echo "🔐 Configurando permisos..."
sudo chown -R $USER:$USER "$OMV_DATA_PATH"
sudo chmod -R 755 "$OMV_DATA_PATH"

# Permisos especiales para PostgreSQL
sudo chmod 700 "$OMV_DATA_PATH/postgres_data"

echo "✅ Directorios inicializados correctamente:"
echo "   📂 Base de datos: $OMV_DATA_PATH/postgres_data"
echo "   📂 Backups: $OMV_DATA_PATH/postgres_backups"
echo "   📂 Archivos estáticos: $OMV_DATA_PATH/static"
echo "   📂 Archivos multimedia: $OMV_DATA_PATH/media"
echo "   📂 Logs: $OMV_DATA_PATH/logs"
echo ""
echo "🚀 ¡Listo para ejecutar docker-compose up!"
