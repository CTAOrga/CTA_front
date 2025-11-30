import { useEffect, useState } from "react";
import { getInventory } from "../infra/inventoryService";
import { Link } from "react-router-dom";

export default function AgencyInventory() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getInventory();
    setCars(data);
  };

  return (
    <div>
      <h2>Inventario</h2>
      <Link to='/agencies/inventory/new'>Agregar auto</Link>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Usado</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.brand}</td>
              <td>{c.model}</td>
              <td>{c.year}</td>
              <td>{c.is_used ? "Usado" : "Nuevo"}</td>
              <td>{c.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
