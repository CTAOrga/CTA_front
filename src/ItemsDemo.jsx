import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

console.log("API:", API);

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
      if (!r.ok) throw new Error(`GET /items -> ${r.status}`);
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
        throw new Error(`POST /items -> ${r.status} ${t}`);
      }
      setName("");
      await loadItems();
    } catch (e) {
      setErr(String(e));
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div
      style={{ maxWidth: 520, margin: "2rem auto", fontFamily: "system-ui" }}
    >
      <h1>Items (FastAPI + MySQL)</h1>

      <form
        onSubmit={addItem}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          placeholder='Nombre del item'
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button disabled={!name.trim()}>Agregar</button>
      </form>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li key={it.id}>{it.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
