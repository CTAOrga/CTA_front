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
VITE_API_URL=http://127.0.0.1:8000
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

## Test punta-a-punta (GET/POST Items)

1. Verificá que el backend está corriendo en `http://127.0.0.1:8000`.
2. En el front, creá `src/ItemsDemo.jsx`:

```jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function ItemsDemo() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadItems() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API}/api/v1/items/`);
      if (!r.ok) throw new Error(\`GET /items -> \${r.status}\`);
      setItems(await r.json());
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    setErr("");
    try {
      const r = await fetch(`${API}/api/v1/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(\`POST /items -> \${r.status} \${t}\`);
      }
      setName("");
      await loadItems();
    } catch (e) {
      setErr(String(e));
    }
  }

  useEffect(() => { loadItems(); }, []);

  return (
    <div style={{ maxWidth: 520, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Items (FastAPI + MySQL)</h1>

      <form onSubmit={addItem} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Nombre del item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button disabled={!name.trim()}>Agregar</button>
      </form>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      {loading ? <p>Cargando…</p> : (
        <ul>
          {items.map((it) => <li key={it.id}>{it.name}</li>)}
        </ul>
      )}
    </div>
  );
}
```

y montalo en `src/App.jsx`:

```jsx
import ItemsDemo from "./ItemsDemo";
export default function App() {
  return <ItemsDemo />;
}
```

3. Levantá el front: `npm run dev` y probá en `http://localhost:5173`.

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

## Notas

- Este repo **no usa TypeScript**.
- Si cambiás de mayor de Node (p. ej. 20 → 22), se recomienda borrar `node_modules` y `package-lock.json` antes de volver a instalar.
- Si migrás desde Vite 5 a 6, verificá compatibilidades de plugins.
