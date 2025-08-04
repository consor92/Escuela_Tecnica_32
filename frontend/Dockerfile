# Usa una imagen oficial de Node.js como base
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias (ignorando conflictos de peerDependencies)
RUN npm install --legacy-peer-deps

# Copia el resto del proyecto
COPY . .

COPY .env .env

RUN npm run build

# Expone el puerto que usa Next.js en dev
EXPOSE 3000

# Comando para correr la app en modo desarrollo
CMD ["npm", "start"]
