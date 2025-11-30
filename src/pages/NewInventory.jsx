import { useState } from "react";
import { createInventory } from "../infra/inventoryService";
import { useNavigate } from "react-router-dom";

export default function NewInventory() {
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [isUsed, setIsUsed] = useState(false);

  const handleSave = async () => {
    await createInventory({
      brand,
      model,
      year: year ? Number(year) : null,
      quantity: Number(quantity),
      is_used: isUsed,
    });
    navigate("/agencies/inventory");
  };

  return (
    <div>
      <h2>Nuevo Auto</h2>

      <input
        placeholder='Marca'
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />
      <input
        placeholder='Modelo'
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />
      <input
        placeholder='Año'
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <input
        placeholder='Cantidad'
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <label>
        <input
          type='checkbox'
          checked={isUsed}
          onChange={(e) => setIsUsed(e.target.checked)}
        />
        Es usado
      </label>

      <button onClick={handleSave}>Guardar</button>
    </div>
  );
}
