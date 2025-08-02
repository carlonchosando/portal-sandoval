#!/bin/sh

# Entrypoint para PRODUCCIÓN - Portal Sandoval
# Este script se ejecuta cuando el contenedor de Django inicia en producción

echo "=== Portal Sandoval - Production Entrypoint ==="
echo "Starting production deployment..."

# Esperar a que PostgreSQL esté listo
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Aplicar migraciones de la base de datos
echo "Applying database migrations..."
python manage.py migrate --noinput

# Recopilar archivos estáticos para producción
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Crear superusuario automáticamente si no existe
echo "Checking for admin user..."
python manage.py shell -c "
from django.contrib.auth.models import User
import os

admin_username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
admin_email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@portalsandoval.com')
admin_password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not User.objects.filter(username=admin_username).exists():
    User.objects.create_superuser(admin_username, admin_email, admin_password)
    print(f'✅ Superuser {admin_username} created successfully!')
else:
    print(f'ℹ️  Superuser {admin_username} already exists.')
"

# Verificar la configuración de Django
echo "Running Django system checks..."
python manage.py check --deploy

echo "=== Starting Django Production Server ==="
echo "Backend will be available at: http://0.0.0.0:8000"
echo "Admin panel: http://0.0.0.0:8000/admin/"
echo "API: http://0.0.0.0:8000/api/v1/"

# Iniciar el servidor de Django
# En producción real, deberías usar gunicorn o uwsgi
# Para esta configuración usaremos el servidor de desarrollo con configuraciones más seguras
python manage.py runserver 0.0.0.0:8000
