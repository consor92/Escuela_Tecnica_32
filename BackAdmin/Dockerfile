FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Instalar servidor estático para producción
RUN npm install -g serve

# Servir el build en producción
CMD ["serve", "-s", "dist", "-l", "5173", "--single"]
