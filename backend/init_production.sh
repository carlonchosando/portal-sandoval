#!/bin/bash

# Script de inicialización para producción
# Este script se ejecuta automáticamente cuando se inicia el contenedor Docker

echo "🚀 Iniciando configuración de producción..."

# Esperar a que la base de datos esté disponible
echo "⏳ Esperando conexión a la base de datos..."
python3 manage.py migrate --check
while [ $? -ne 0 ]; do
    echo "Base de datos no disponible, esperando..."
    sleep 2
    python3 manage.py migrate --check
done

echo "✅ Base de datos disponible"

# Ejecutar migraciones
echo "📦 Aplicando migraciones..."
python3 manage.py migrate

# Inicializar configuración de la aplicación
echo "⚙️ Inicializando configuración de la aplicación..."
python3 manage.py init_app_config

# Recopilar archivos estáticos
echo "📁 Recopilando archivos estáticos..."
python3 manage.py collectstatic --noinput

# Crear superusuario si no existe (solo en desarrollo)
if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ] && [ "$DJANGO_SUPERUSER_EMAIL" ]; then
    echo "👤 Creando superusuario..."
    python3 manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print('Superusuario creado exitosamente')
else:
    print('Superusuario ya existe')
"
fi

echo "🎉 Configuración de producción completada"

# Iniciar el servidor
echo "🌐 Iniciando servidor Django..."
exec "$@"
