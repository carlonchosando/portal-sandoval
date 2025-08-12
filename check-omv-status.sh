#!/bin/bash

# 🔍 Script de Verificación Rápida - Portal Sandoval en OMV
# Verifica el estado del RAID, servicios Docker y Portal Sandoval

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Portal Sandoval - Verificación de Estado en OMV"
echo "=================================================="

# Función para imprimir mensajes
print_ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "🛡️ VERIFICACIÓN DEL RAID 1"
echo "=========================="

# Verificar estado del RAID
if [[ -f /proc/mdstat ]]; then
    RAID_STATUS=$(cat /proc/mdstat | grep md0 | grep -o '\[.*\]' | head -1)
    if [[ $RAID_STATUS == *"UU"* ]]; then
        print_ok "RAID 1 funcionando correctamente: $RAID_STATUS"
    else
        print_error "PROBLEMA en RAID 1: $RAID_STATUS"
    fi
    
    # Mostrar información detallada
    echo "Estado detallado del RAID:"
    cat /proc/mdstat | grep -A 3 md0
else
    print_error "No se puede acceder a /proc/mdstat"
fi

echo ""
echo "💾 VERIFICACIÓN DEL ALMACENAMIENTO"
echo "================================="

# Verificar espacio en disco
DISK_USAGE=$(df -h /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/ 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//')

if [[ -n $DISK_USAGE ]]; then
    if [[ $DISK_USAGE -lt 80 ]]; then
        print_ok "Espacio en disco: ${DISK_USAGE}% usado"
    elif [[ $DISK_USAGE -lt 90 ]]; then
        print_warning "Espacio en disco: ${DISK_USAGE}% usado (considerar limpieza)"
    else
        print_error "Espacio en disco: ${DISK_USAGE}% usado (CRÍTICO)"
    fi
    
    echo "Detalles del disco:"
    df -h /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/
else
    print_error "No se puede acceder al disco principal"
fi

echo ""
echo "🐳 VERIFICACIÓN DE DOCKER"
echo "========================"

# Verificar si Docker está corriendo
if systemctl is-active --quiet docker; then
    print_ok "Docker está corriendo"
else
    print_error "Docker no está corriendo"
fi

# Verificar servicios de Portal Sandoval
if [[ -f docker-compose.production.yml ]]; then
    echo ""
    echo "📊 ESTADO DE PORTAL SANDOVAL"
    echo "============================"
    
    # Verificar contenedores
    CONTAINERS=$(docker-compose -f docker-compose.production.yml ps --services 2>/dev/null || echo "")
    
    if [[ -n $CONTAINERS ]]; then
        for service in $CONTAINERS; do
            STATUS=$(docker-compose -f docker-compose.production.yml ps $service 2>/dev/null | tail -1 | awk '{print $4}' || echo "Down")
            if [[ $STATUS == *"Up"* ]]; then
                print_ok "Servicio $service: Funcionando"
            else
                print_error "Servicio $service: $STATUS"
            fi
        done
        
        echo ""
        echo "Puertos en uso:"
        docker-compose -f docker-compose.production.yml ps 2>/dev/null | grep -E "(8080|3001|5433)" || echo "No se encontraron puertos activos"
    else
        print_warning "Portal Sandoval no está desplegado o no se encuentra docker-compose.production.yml"
    fi
else
    print_warning "No se encuentra docker-compose.production.yml en el directorio actual"
fi

echo ""
echo "🌐 VERIFICACIÓN DE SERVICIOS OMV"
echo "==============================="

# Verificar puertos ocupados
PORTS_CHECK=(80 443 8080 3001 5433)
for port in "${PORTS_CHECK[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        SERVICE=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f2 | head -1)
        if [[ $port == 8080 || $port == 3001 || $port == 5433 ]]; then
            print_ok "Puerto $port en uso por: $SERVICE (Portal Sandoval)"
        else
            print_info "Puerto $port en uso por: $SERVICE"
        fi
    else
        if [[ $port == 8080 || $port == 3001 || $port == 5433 ]]; then
            print_warning "Puerto $port libre (Portal Sandoval no activo)"
        else
            print_info "Puerto $port libre"
        fi
    fi
done

echo ""
echo "📈 RESUMEN DEL SISTEMA"
echo "===================="

# Mostrar carga del sistema
echo "Carga del sistema: $(uptime | awk -F'load average:' '{print $2}')"

# Mostrar memoria
echo "Memoria:"
free -h | grep -E "(Mem|Swap)"

# Mostrar temperatura (si está disponible)
if command -v sensors &> /dev/null; then
    echo ""
    echo "Temperatura:"
    sensors | grep -E "(Core|temp)" | head -3
fi

echo ""
echo "🎯 ACCESOS RÁPIDOS"
echo "=================="
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Frontend: http://$SERVER_IP:3001"
echo "Admin: http://$SERVER_IP:8080/admin/"
echo "API: http://$SERVER_IP:8080/api/v1/"

echo ""
print_info "Verificación completada. Revisa cualquier advertencia o error arriba."
