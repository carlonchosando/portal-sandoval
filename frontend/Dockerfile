# Usa una imagen base oficial de Node.js. 'alpine' es una versión muy ligera.
FROM node:18-alpine

# Instala wget para healthchecks
RUN apk add --no-cache wget

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos de definición de dependencias.
COPY package.json .

# Instala las dependencias del proyecto y serve para producción
RUN npm install && npm install -g serve

# Copia el resto del código de la aplicación.
COPY . .

# El comando por defecto se define en docker-compose para flexibilidad
CMD ["npm", "start"]