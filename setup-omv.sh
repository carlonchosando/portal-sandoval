#!/bin/bash

# 🚀 Script de Configuración Automática para OpenMediaVault - Portal Sandoval
# Este script automatiza la preparación del entorno para desplegar Portal Sandoval en OMV

set -e  # Salir si hay algún error

echo "🚀 Portal Sandoval - Setup para OpenMediaVault"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar si se ejecuta como root
if [[ $EUID -eq 0 ]]; then
   print_error "Este script no debe ejecutarse como root. Usa tu usuario normal."
   exit 1
fi

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_warning "Docker no está instalado. Instalando..."
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo usermod -aG docker $USER
    print_message "Docker instalado. Necesitarás reiniciar sesión o ejecutar 'newgrp docker'"
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose no está instalado. Instalando..."
    sudo apt install docker-compose -y
fi

print_step "1. Detectando configuración del sistema..."

# Detectar discos disponibles
print_message "Discos disponibles:"
sudo blkid | grep -E "(ext4|xfs|btrfs)" | head -5

echo ""
print_warning "Necesitas identificar el UUID de tu disco principal de OMV"
print_warning "Busca una línea similar a: /dev/sda1: UUID=\"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\""

read -p "Introduce el UUID de tu disco principal (sin comillas): " DISK_UUID

if [[ -z "$DISK_UUID" ]]; then
    print_error "UUID no puede estar vacío"
    exit 1
fi

# Validar formato UUID básico
if [[ ! $DISK_UUID =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
    print_warning "El formato del UUID parece incorrecto. ¿Continuar de todos modos? (y/N)"
    read -p "" confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

DATA_PATH="/srv/dev-disk-by-uuid-$DISK_UUID/portal-sandoval"

print_step "2. Creando directorios de datos..."

# Crear directorios necesarios
sudo mkdir -p "$DATA_PATH"/{postgres_data,postgres_backups,static,media,logs}

# Establecer permisos
sudo chown -R 1000:1000 "$DATA_PATH"
sudo chmod -R 755 "$DATA_PATH"

print_message "Directorios creados en: $DATA_PATH"

print_step "3. Configurando variables de entorno..."

# Verificar si existe .env
if [[ -f ".env" ]]; then
    print_warning "El archivo .env ya existe. ¿Sobrescribir? (y/N)"
    read -p "" overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        print_message "Manteniendo archivo .env existente"
    else
        rm .env
    fi
fi

if [[ ! -f ".env" ]]; then
    # Generar SECRET_KEY
    print_message "Generando SECRET_KEY..."
    if command -v python3 &> /dev/null; then
        SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || echo "your-secret-key-$(date +%s)")
    else
        SECRET_KEY="your-secret-key-$(date +%s)-change-this"
    fi

    # Obtener IP del servidor
    SERVER_IP=$(hostname -I | awk '{print $1}')

    # Crear archivo .env
    cat > .env << EOF
# Variables de Entorno para OpenMediaVault - Portal Sandoval
# Generado automáticamente el $(date)

# CONFIGURACIÓN DE DJANGO
SECRET_KEY=$SECRET_KEY
DEBUG=False
DJANGO_ALLOWED_HOSTS=*,localhost,127.0.0.1,$SERVER_IP

# CONFIGURACIÓN DE BASE DE DATOS
POSTGRES_DB=portal_sandoval_omv
POSTGRES_USER=portal_admin
POSTGRES_PASSWORD=SecurePassword$(date +%s)

# USUARIO ADMINISTRADOR AUTOMÁTICO
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@portalsandoval.local
DJANGO_SUPERUSER_PASSWORD=ChangeMe123!

# CONFIGURACIÓN DE PUERTOS
BACKEND_PORT=8080
FRONTEND_PORT=3001
DB_PORT=5433

# CONFIGURACIÓN ESPECÍFICA PARA OMV
TZ=America/Argentina/Buenos_Aires
OMV_DATA_PATH=$DATA_PATH

# CONFIGURACIÓN DEL FRONTEND
REACT_APP_API_URL=http://$SERVER_IP:8080
EOF

    print_message "Archivo .env creado con configuración automática"
    print_warning "IMPORTANTE: Revisa y ajusta las contraseñas en el archivo .env"
fi

print_step "4. Verificando configuración..."

# Verificar que los directorios existen y tienen permisos correctos
if [[ -d "$DATA_PATH" ]]; then
    print_message "✓ Directorios de datos configurados correctamente"
else
    print_error "✗ Error en la configuración de directorios"
    exit 1
fi

# Verificar Docker
if docker ps &> /dev/null; then
    print_message "✓ Docker funcionando correctamente"
else
    print_warning "Docker no está accesible. Puede que necesites reiniciar sesión o ejecutar 'newgrp docker'"
fi

print_step "5. Resumen de la configuración"

echo ""
echo "📋 CONFIGURACIÓN COMPLETADA"
echo "=========================="
echo "• Ruta de datos: $DATA_PATH"
echo "• IP del servidor: $SERVER_IP"
echo "• Backend: http://$SERVER_IP:8080"
echo "• Frontend: http://$SERVER_IP:3001"
echo "• Admin: http://$SERVER_IP:8080/admin/"
echo ""

print_step "6. Próximos pasos"

echo "Para desplegar la aplicación:"
echo "1. Revisa el archivo .env y ajusta las contraseñas"
echo "2. Ejecuta: docker-compose -f docker-compose.production.yml up -d"
echo "3. Monitorea los logs: docker-compose -f docker-compose.production.yml logs -f"
echo ""

print_warning "IMPORTANTE:"
print_warning "• Cambia las contraseñas por defecto en el archivo .env"
print_warning "• Cambia las credenciales del admin después del primer acceso"
print_warning "• Considera configurar un firewall para mayor seguridad"

echo ""
print_message "🎉 ¡Configuración completada! Revisa OPENMEDIAVAULT_DEPLOYMENT.md para más detalles."
