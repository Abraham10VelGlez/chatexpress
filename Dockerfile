FROM node:22-alpine
# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/serveravg
# Copia el archivo package.json y package-lock.json (si existe), si no se crea 
COPY package*.json ./
# Instala las dependencias
RUN yarn install
# Instala nodemon globalmente
RUN yarn global add nodemon
# Copia el resto del código de la aplicación al contenedor
COPY . .
# Expone el puerto en el que la aplicación escuchará
EXPOSE 3000
# Define el comando para ejecutar tu aplicación
#CMD ["nodemon", "server/app.js"]
CMD ["yarn", "dev"]