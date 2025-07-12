# Usa una imagen base oficial de Node.js. 'alpine' es una versión muy ligera.
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos de definición de dependencias.
COPY package.json .

# Instala las dependencias del proyecto.
RUN npm install

# Copia el resto del código de la aplicación.
COPY . .

# El comando por defecto para iniciar la aplicación (servidor de desarrollo de React).
CMD ["npm", "start"]