export default function Delivery() {
  return (
    <div className="section">
      <h2>Dispatch</h2>

      <input placeholder="Challan ID" />

      <select>
        <option>By Hand</option>
        <option>Courier</option>
        <option>Transport</option>
      </select>

      <input placeholder="Docket / Slip" />
      <input type="number" placeholder="Charges" />

      <button>Dispatch</button>
      <button>Mark Delivered</button>
    </div>
  );
}
