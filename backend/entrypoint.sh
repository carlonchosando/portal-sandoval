#!/bin/sh

# Este es un script de entrada que Docker ejecutará cuando el contenedor inicie.
# Su propósito es realizar tareas de inicialización antes de lanzar la aplicación principal.

echo "Entrypoint script is running..."

# Aquí podrías agregar un comando para esperar a que la base de datos esté lista.
# Por ahora, lo mantenemos simple.
echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Aplica las migraciones de la base de datos.
python manage.py migrate

# Inicia el servidor de desarrollo de Django.
echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000