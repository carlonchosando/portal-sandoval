# ===== PORTAL SANDOVAL FRONTEND - PRODUCCIÓN =====
# Optimizado para usar con NGINX externo (reverse proxy)
FROM node:18-alpine

# Metadatos de la imagen
LABEL maintainer="Portal Sandoval Team"
LABEL version="2.0.0"
LABEL description="Portal Sandoval Frontend - React con personalización dinámica para NGINX externo"

# Instalar dependencias del sistema
RUN apk add --no-cache curl wget

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S reactjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias optimizadas para producción
RUN npm ci --only=production --silent && \
    npm install -g serve && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Build optimizado para producción
RUN npm run build

# Cambiar ownership a usuario no-root
RUN chown -R reactjs:nodejs /app

# Cambiar a usuario no-root
USER reactjs

# Healthcheck para monitoreo (compatible con NGINX externo)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Exponer puerto interno (NGINX externo hará el proxy)
EXPOSE 3000

# Comando optimizado para servir archivos estáticos
CMD ["serve", "-s", "build", "-l", "3000", "--no-clipboard"]