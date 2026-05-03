# Usa una imagen oficial de Node.js LTS como base
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias (ignorando conflictos de peerDependencies)
RUN npm install --legacy-peer-deps

# Copia el resto del proyecto
COPY . .

# Genera el build de producción
RUN npm run build

# Expone el puerto que usa Next.js (3000 por defecto)
EXPOSE 3000

# Comando para correr la app en modo producción
CMD ["npm", "start"]
