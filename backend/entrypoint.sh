#!/bin/sh

# Este es un script de entrada que Docker ejecutará cuando el contenedor inicie.
# Su propósito es realizar tareas de inicialización antes de lanzar la aplicación principal.

echo "Entrypoint script is running..."

# Espera a que la base de datos esté lista usando la variable de entorno
echo "Waiting for postgres at host: ${POSTGRES_HOST}..."
while ! nc -z ${POSTGRES_HOST} 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Aplica las migraciones de la base de datos.
python manage.py migrate

# Colecta archivos estáticos
python manage.py collectstatic --no-input

# Crea superusuario si las variables están definidas
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Creating superuser..."
  python manage.py createsuperuser --noinput || echo "Superuser may already exist."
fi

# Inicia Gunicorn para producción con configuración optimizada
echo "Starting Gunicorn production server..."
exec gunicorn portal_sandoval_project.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --worker-class gthread