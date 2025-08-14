#!/bin/bash

# ===== PORTAL SANDOVAL - BUILD Y PUSH A DOCKERHUB =====
# Script para generar imágenes optimizadas y subirlas a DockerHub
# Configurado para NGINX externo (reverse proxy)

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
DOCKERHUB_USERNAME="carlonchosando"
PROJECT_NAME="portal-sandoval"
VERSION="2.0.0"
LATEST_TAG="latest"

echo -e "${BLUE}🐳 PORTAL SANDOVAL - BUILD Y PUSH A DOCKERHUB${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}📋 Configuración:${NC}"
echo -e "   • DockerHub User: ${DOCKERHUB_USERNAME}"
echo -e "   • Proyecto: ${PROJECT_NAME}"
echo -e "   • Versión: ${VERSION}"
echo -e "   • Configurado para: NGINX externo (reverse proxy)"
echo ""

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    exit 1
fi

# Verificar login en DockerHub
echo -e "${YELLOW}🔐 Verificando login en DockerHub...${NC}"
if ! docker info | grep -q "Username: ${DOCKERHUB_USERNAME}"; then
    echo -e "${YELLOW}⚠️  No estás logueado en DockerHub. Ejecutando login...${NC}"
    docker login
fi

# Función para build y push
build_and_push() {
    local service=$1
    local dockerfile_path=$2
    local context_path=$3
    
    echo -e "${BLUE}🔨 Building ${service}...${NC}"
    
    # Tags para la imagen
    local image_name="${DOCKERHUB_USERNAME}/${PROJECT_NAME}-${service}"
    local version_tag="${image_name}:${VERSION}"
    local latest_tag="${image_name}:${LATEST_TAG}"
    
    # Build de la imagen
    echo -e "${YELLOW}   📦 Construyendo imagen: ${version_tag}${NC}"
    docker build \
        -f "${dockerfile_path}" \
        -t "${version_tag}" \
        -t "${latest_tag}" \
        "${context_path}"
    
    # Push a DockerHub
    echo -e "${YELLOW}   ⬆️  Subiendo a DockerHub...${NC}"
    docker push "${version_tag}"
    docker push "${latest_tag}"
    
    echo -e "${GREEN}   ✅ ${service} completado${NC}"
    echo ""
}

# 1. BUILD Y PUSH BACKEND
echo -e "${BLUE}🚀 PASO 1: BACKEND (Django)${NC}"
build_and_push "backend" "./backend/Dockerfile" "./backend"

# 2. BUILD Y PUSH FRONTEND
echo -e "${BLUE}🚀 PASO 2: FRONTEND (React - para NGINX externo)${NC}"
build_and_push "frontend" "./frontend/Dockerfile" "./frontend"

# 3. MOSTRAR RESUMEN
echo -e "${GREEN}🎉 ¡BUILD Y PUSH COMPLETADO!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${YELLOW}📋 Imágenes generadas:${NC}"
echo -e "   🔹 Backend:  ${DOCKERHUB_USERNAME}/${PROJECT_NAME}-backend:${VERSION}"
echo -e "   🔹 Backend:  ${DOCKERHUB_USERNAME}/${PROJECT_NAME}-backend:${LATEST_TAG}"
echo -e "   🔹 Frontend: ${DOCKERHUB_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}"
echo -e "   🔹 Frontend: ${DOCKERHUB_USERNAME}/${PROJECT_NAME}-frontend:${LATEST_TAG}"
echo ""
echo -e "${YELLOW}🌐 Configuración NGINX requerida:${NC}"
echo -e "   • Frontend: Proxy a puerto interno del contenedor (3000)"
echo -e "   • Backend:  Proxy a puerto interno del contenedor (8000)"
echo -e "   • El docker-compose.production.yml está configurado para NGINX externo"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo -e "   1. Configurar NGINX reverse proxy en tu servidor"
echo -e "   2. Usar docker-compose.production.yml para deployment"
echo -e "   3. Configurar dominios y certificados SSL en NGINX"
echo ""
echo -e "${GREEN}✨ ¡Listo para producción con NGINX externo!${NC}"
