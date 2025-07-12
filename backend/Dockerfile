# Usa una imagen base oficial de Python. 'slim' es una versión más ligera.
FROM python:3.11-slim

# Evita que Python escriba archivos .pyc, que no son necesarios en contenedores.
ENV PYTHONDONTWRITEBYTECODE 1
# Asegura que la salida de Python se muestre inmediatamente en la consola de Docker.
ENV PYTHONUNBUFFERED 1

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Instala dependencias del sistema operativo necesarias para compilar 'psycopg2' (el conector de PostgreSQL).
# También instalamos 'netcat' (nc), que usamos en nuestro entrypoint.sh para esperar a la base de datos.
RUN apt-get update && apt-get install -y build-essential libpq-dev netcat-traditional

# Copia el archivo de requerimientos de Python al contenedor.
COPY requirements.txt .

# Instala las dependencias de Python.
RUN pip install --no-cache-dir -r requirements.txt

# Copia el script de entrada y le da permisos de ejecución.
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Copia el resto del código de la aplicación al directorio de trabajo.
COPY . .