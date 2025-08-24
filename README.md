# CTA Front

Frontend en **React + Vite + MUI** (JavaScript, no TypeScript).

## Requisitos

- **Node.js**: **v20.19+** _o_ **v22.12+**
  > Vite 6+ requiere estas versiones. Con Node 20.11 falla con `crypto.hash is not a function`.
- **npm**: 10+ (incluido con Node)
- (Opcional pero recomendado) **nvm** para cambiar de versión de Node según el entorno.

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

## Build y Preview (producción)

```bash
# Generar build en /dist
npm run build

# Probar el build localmente
npm run preview
```

---

## Variables de entorno (opcional)

Creá un archivo **.env** (o **.env.local**) en la raíz si necesitás configurar endpoints u otras variables:

```
VITE_API_URL=http://localhost:3000
# Agregá aquí otras VITE_*
```

En el código, usá `import.meta.env.VITE_API_URL`.

---

## Scripts disponibles

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
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

- **Puerto 5173 ocupado**

  ```bash
  npm run dev -- --port 5174
  ```

- **Cambios de versión de Node no se reflejan**  
  Cerrá y reabrí tu editor/terminal para refrescar el PATH. En Windows, confirmá con:
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

## Notas

- Este repo **no usa TypeScript**.
- Si cambiás de mayor de Node (p. ej. 20 → 22), se recomienda borrar `node_modules` y `package-lock.json` antes de volver a instalar.
- Si migrás desde Vite 5 a 6, verificá compatibilidades de plugins.
