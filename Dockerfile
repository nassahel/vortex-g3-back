# Usa una imagen oficial de Node.js
FROM node:20

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Compila TypeScript (si aplica)
RUN npm run build

# Expone el puerto en el que corre la app
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "dist/index.js"]
