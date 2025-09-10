# Construir imagen "cta_front" para Docker Compose (apunta al backend en la red interna)
build backend_url='http://cta_backend:8000': docker build -t cta_front --build-arg VITE_API_URL={{backend_url}} .

# Construir imagen "cta_front_dev" para desarrollo local (apunta a backend en localhost)
build_dev backend_url='http://localhost:8000/api/v1': docker build -t cta_front_dev --build-arg VITE_API_URL={{backend_url}} .

# Ejecutar el contenedor localmente (default: usa la imagen de desarrollo en puerto 3000)
run port='3000' imagename='cta_front_dev': docker run --rm -d --name cta-frontend -p {{port}}:80 {{imagename}}
