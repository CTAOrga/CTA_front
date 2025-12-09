# CTA Front

<p align="center">
  <img src="src/assets/logo.png" alt="CTA – Compra Tu Auto" width="180" />
</p>
<h1 align="center">CTA – Compra Tu Auto</h1>

Frontend en **React + Vite + MUI** (JavaScript). Punta a punta con el backend **FastAPI** en `http://127.0.0.1:8000`.

---

## Requisitos

- **Node.js**: **v20.19+** _o_ **v22.12+**
  > Vite 6+ requiere estas versiones. Con Node 20.11 falla con `crypto.hash is not a function`.
- **npm**: 10+ (incluido con Node)
- (Opcional) **nvm** para cambiar de versión de Node.

### Instalar/usar Node con nvm

**Windows (nvm-windows + PowerShell):**

```powershell
nvm install 22.12.0
nvm use 22.12.0
node -v
```

**macOS / Linux (nvm):**

```bash
nvm install --lts
nvm use --lts
node -v
```

> Si estás obligado a usar Node 20, asegurate de que sea **20.19+**:
> `nvm install 20.19.0 && nvm use 20.19.0`

---

## Variables de entorno (backend FastAPI)

Creá **.env.local** en la raíz del front con la URL del back:

```
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

En el código, leé con: `import.meta.env.VITE_API_URL`.

> Asegurate de que el back tenga CORS para el host/puerto del front. En el back (`cta_back`) se incluyen por defecto `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:3000`. Si usás otro puerto, agregalo en `CORS_ORIGINS` del `.env` del backend y reinicialo.

### (Alternativa) Proxy en Vite (evita CORS)

Si preferís no usar CORS y consumir como `/api/...`, podés configurar proxy en `vite.config.js`:

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
```

Con esto, en el código llamás `fetch("/api/v1/items/")` y Vite lo redirige al backend.

---

## Puesta en marcha (desarrollo)

```bash
# 1) Instalar dependencias
npm install

# 2) Levantar servidor de desarrollo
npm run dev
```

- Por defecto se sirve en: **http://localhost:5173**
- Para elegir otro puerto:

```bash
npm run dev -- --port 5174
```

---

## 🧪 Tests E2E con Cypress

- **Este proyecto incluye pruebas end-to-end (E2E) con Cypress**

<h2>Requisitos</h2>

```bash
# 1) Instalar dependencias (de ser necesario)
npm install

# 2) Levantar la app (en http://localhost:5173)
npm run dev
# (o modo producción)
npm run build && npm run preview

```

> Nota (preview): las variables VITE\_\* se toman en tiempo de build.
> Si cambiás .env.production, ejecutá otra vez:

```bash
npm run build && npm run preview
```

<h2>Ejecutar Cypress</h2>

UI interactiva

```bash
npm run cy:open
```

Abre el runner de Cypress y elegí los specs desde la interfaz.

<h2>Headless (terminal)</h2>

```bash
# Todos los tests E2E
npm run test:e2e
# Equivalente
npm run cy:run
```

<h2>Correr un spec puntual</h2>

```bash
# Con npx
npx cypress run --e2e --spec "cypress/e2e/home.cy.js"
# Reutilizando el script (pasando args tras --)
npm run cy:run -- --e2e --spec "cypress/e2e/favorites.cy.js"
```

<h2>Solución de problemas</h2>

- **Instalación “limpia” si hay errores de deps:**
  - **Windows (PowerShell/CMD)**

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

- **macOS/Linux**

```bash

rm -rf node_modules package-lock.json
npm install

```

---

## 💥 Tests de carga - Grafana - K6

### Requisitos (instalación para correr local)

> Requiere k6 instalado (winget/choco) y tu backend corriendo.

#### Windows (Powershell):

```
#Recomendado con winget
winget install grafana.k6

#Con Chocolatey
choco install k6 -y

#Con Scoop
scoop install k6
```

#### Linux

#### Debian / Ubuntu

```
curl -fsSL https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list

sudo apt update && sudo apt install -y k6
```

#### macOS

```
#Homebrew (recomendado)
brew install k6
```

#### Verificar:

```
k6 version
```

## Correr

#### Windows (Powershell)

```
# 1) Setear la base de tu API (ajustá el puerto/host si hace falta). En los secrets de github debe ir contra la conf. que tenga la db que usamos normalmente
$env:API_BASE_URL = "http://127.0.0.1:8000/api/v1"

# 2) Tokens de usuarios (deben ser tokens validos)
$env:ADMIN_TOKEN = "JWT_DE_USER_ADMIN"

# 3) Ejecutar el test (con export de resumen en json)

k6 run --summary-export=summary.json .\k6\load-listings.js

k6 run --summary-export=summary-load-listings.json k6/load-listings.js

k6 run --summary-export=summary-spyke-listings.json k6/spyke-listings.js

k6 run --summary-export=summary-stress-listings.json .\k6\stress-listings.js

k6 run --summary-export=summary-admin-reports.json .\k6\stress-admin-reports.js

```

```
# 2) Tokens de usuarios (deben ser validos en la db de pruebas => mirar el seed en seed/perf.py; ademas hacer un login desde swagger para obtener los tokens)
$env:AGENCY_TOKEN = "JWT_DE_agency_perf"
$env:BUYER_TOKEN  = "JWT_DE_buyer_perf"
# 3) Este test debe correr contra la db de pruebas (cta_perf), no correrlo contra la de demo. Mirar el README del back => "Levantar db pruebas". En los secrets de github debe ir contra la conf. que tenga la db de pruebas
$env:API_BASE_URL_PERF = "http://127.0.0.1:8000/api/v1"
k6 run --summary-export=summary-stress-purchases.json .\k6\stress-purchases.js

```

#### Linux / macOS (Bash)

```
# 1) Base de tu API
API_BASE_URL=http://127.0.0.1:8000/api/v1

# 2) Ejecutar el test (con export de resumen en json)
k6 run --summary-export=summary-load-listings.json k6/load-listings.js
```

---

## Build y Preview (producción)

```bash
# Generar build en /dist
npm run build

# Probar el build localmente
npm run preview
```

---

## Scripts disponibles

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test:e2e": "cypress run --e2e",
    "cy:open": "cypress open",
    "cy:run": "cypress run"
  }
}
```

---

## Solución de problemas

- **Error de versión de Node**  
  Mensaje: `Vite requires Node.js version 20.19+ or 22.12+` o `crypto.hash is not a function`  
  **Solución**: Actualizá Node (ver _Requisitos_), luego reinstalá dependencias:

  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm run dev
  ```

- **CORS o red**

  - Confirmá que el back esté en `127.0.0.1:8000` y que `VITE_API_URL` apunte ahí.
  - Si usás **proxy** en Vite, llamá a `/api/...` (sin host).
  - Si cambiás puerto/host del front, agregalo en `CORS_ORIGINS` del back y reinicialo.

- **Puerto 5173 ocupado**

  ```bash
  npm run dev -- --port 5174
  ```

- **Cambios de versión de Node no se reflejan**  
  Cerrá y reabrí tu editor/terminal. En Windows:
  ```powershell
  where node
  node -v
  ```

---

## Forzar versión de Node en el proyecto (recomendado)

Agregá en `package.json` para evitar que otros levanten el proyecto con Node incompatible:

```json
{
  "engines": {
    "node": ">=20.19 <21 || >=22.12"
  }
}
```

(En CI/CD podés activar `engine-strict=true` en `.npmrc` si querés hacer cumplir esto).

---

## Pila tecnológica

- **Vite 6+**
- **React 18+**
- **MUI (@mui/material, @mui/icons-material, @emotion/react, @emotion/styled)**
- **Router**: react-router-dom

> Si necesitás reinstalar MUI por separado:

```bash
npm i @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom
```

## Build y ejecucion de imagen con Just

- [Just](https://github.com/casey/just#installation) - Ejecutor de comandos similar a Make

### Comandos disponibles

#### 📦 Build de la imagen

Construye la imagen Docker del frontend con la URL del backend configurada.

```bash
just build [backend_url]
```

**Parámetros:**

- `backend_url` (opcional): URL del backend API
  - **Valor por defecto:** `http://cta_backend:8000`

**Ejemplos:**

````bash
# Usar el valor por defecto
just build

# Especificar una URL personalizada
just build "http://localhost:8000"



### 🚀 Ejecutar el contenedor

Ejecuta el contenedor del frontend en el puerto especificado.

```bash
just run [port] [imagename]
````

**Parámetros:**

- `port` (opcional): Puerto donde exponer la aplicación
  - **Valor por defecto:** `80`
- `imagename` (opcional): Nombre de la imagen a ejecutar
  - **Valor por defecto:** `cta_front`

**Ejemplos:**

```bash
# Usar valores por defecto (puerto 80, imagen cta_front)
just run

# Ejecutar en puerto personalizado
just run "3000"

# Puerto personalizado e imagen personalizada
just run "3000" "cta_front:latest"
```

### Flujo de trabajo típico

#### Desarrollo local

```bash
# 1. Construir la imagen apuntando al backend local
just build "http://localhost:8000"

# 2. Ejecutar en puerto 3000
just run "3000"

# La aplicación estará disponible en http://localhost:3000
```

#### Variables de entorno

La aplicación utiliza las siguientes variables de entorno durante el build:

- `VITE_API_URL`: URL del backend API (configurada via build argument)

## Notas

- Este repo **no usa TypeScript**.
- Si cambiás de mayor de Node (p. ej. 20 → 22), se recomienda borrar `node_modules` y `package-lock.json` antes de volver a instalar.
- Si migrás desde Vite 5 a 6, verificá compatibilidades de plugins.
