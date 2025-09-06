

# Levanta los servicios de Docker en segundo plano (-d)
run port='80' imagename='cta_front':
    docker run --name cta-frontend-p 80:{{port}}  {{imagename}}

# Buildea la imagen 
build backend_url='http://cta_backend:8000' :
    docker build -t cta_front --build-arg VITE_API_URL={{backend_url}} .


