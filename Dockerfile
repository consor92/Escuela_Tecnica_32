FROM node:20

WORKDIR /app

# Copiamos package.json y lock (si existe)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto del dev server de Vite
EXPOSE 4000

# Levantamos el server de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4000"]
