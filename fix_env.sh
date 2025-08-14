#!/bin/bash
# Script para corregir el archivo .env eliminando comillas dobles

echo "🔧 Corrigiendo el archivo .env y reiniciando contenedores..."

# Ubicación del archivo .env (ajustar si es diferente)
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: El archivo $ENV_FILE no existe"
    exit 1
fi

# Crear respaldo del archivo original
cp "$ENV_FILE" "${ENV_FILE}.bak"
echo "✅ Respaldo creado en ${ENV_FILE}.bak"

# Corregir el archivo .env - eliminar comillas dobles alrededor de valores
sed -i 's/^\(POSTGRES_DB\)="\(.*\)"$/\1=\2/g' "$ENV_FILE"
sed -i 's/^\(POSTGRES_USER\)="\(.*\)"$/\1=\2/g' "$ENV_FILE"
sed -i 's/^\(POSTGRES_PASSWORD\)="\(.*\)"$/\1=\2/g' "$ENV_FILE"
sed -i 's/^\(EMAIL_PORT\)="\(.*\)"$/\1=\2/g' "$ENV_FILE"
sed -i 's/^\(EMAIL_USE_TLS\)="\(.*\)"$/\1=\2/g' "$ENV_FILE"
sed -i 's/^\(DEBUG\)="\(.*\)"$/\1=\2/g' "$ENV_FILE"

echo "✅ Variables corregidas en $ENV_FILE"
echo "🔄 Reiniciando contenedores..."

# Reiniciar contenedores
docker-compose down
docker-compose up -d

echo "✅ ¡Proceso completado!"
echo "👉 Verifica los logs para confirmar que todo funciona correctamente:"
echo "   docker-compose logs"
