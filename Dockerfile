# --- Etapa 1: Construcción (Build) ---
# Usamos una imagen de Node.js basada en Alpine para mantener el tamaño reducido.
# La nombramos "builder" para poder referenciarla luego.
FROM node:22-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json primero.
# Esto aprovecha el caché de Docker: si no cambian, no se volverá a ejecutar 'npm install'.
COPY package*.json ./

# Instalamos las dependencias del proyecto
RUN npm install

# Copiamos el resto del código fuente del proyecto
COPY . .

# Declaramos un argumento de construcción para la URL del backend.
# Este valor se debe pasar al momento de construir la imagen.
ARG VITE_API_URL
# Asignamos el argumento a una variable de entorno para que Vite la use durante el build.
ENV VITE_API_URL=${VITE_API_URL}

# Ejecutamos el script de build para generar los archivos estáticos de producción.
RUN npm run build


# --- Etapa 2: Producción (Production) ---
# Usamos una imagen de Nginx, un servidor web ligero y eficiente para servir archivos estáticos.
FROM nginx:stable-alpine

# Establecemos el directorio de trabajo donde Nginx sirve los archivos por defecto.
WORKDIR /usr/share/nginx/html

# Limpiamos el contenido por defecto de Nginx en esa carpeta.
RUN rm -rf ./*

# Copiamos ÚNICAMENTE los archivos construidos de la etapa "builder" a la carpeta de Nginx.
COPY --from=builder /app/dist .

# Copiamos la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto 80, que es el puerto por defecto de Nginx.
EXPOSE 80

# Comando para iniciar Nginx en primer plano (requerido por Docker).
CMD ["nginx", "-g", "daemon off;"]