# ===== PORTAL SANDOVAL BACKEND - PRODUCCIÓN =====
# Imagen optimizada para producción con sistema de personalización
FROM python:3.11-slim

# Metadatos de la imagen
LABEL maintainer="Portal Sandoval Team"
LABEL version="2.0.0"
LABEL description="Portal Sandoval Backend - Sistema de gestión con personalización completa"

# Variables de entorno para producción
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=portal_sandoval_project.settings
ENV PYTHONPATH=/app

# Crear usuario no-root para seguridad
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-traditional \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Establecer directorio de trabajo
WORKDIR /app

# Copiar y instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar scripts de inicialización
COPY entrypoint.sh init_production.sh ./
RUN chmod +x entrypoint.sh init_production.sh

# Copiar código de la aplicación
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/staticfiles /app/media/config/favicons \
    && chown -R appuser:appuser /app

# Cambiar a usuario no-root
USER appuser

# Healthcheck para monitoreo
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/app-config/ || exit 1

# Exponer puerto
EXPOSE 8000

# Punto de entrada con inicialización automática
ENTRYPOINT ["/app/init_production.sh"]
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]