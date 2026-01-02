import { useEffect, useState } from "react";
import api from "../../api";

export default function IGChallans() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallans = async () => {
    try {
      const res = await api.get("/challans"); 
      // backend should auto-filter by req.user (IGC)
      setChallans(res.data);
    } catch (err) {
      console.error("Failed to load challans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  if (loading) return <p>Loading your deliveries...</p>;

  return (
    <div className="section">
      <h2>📦 My Deliveries</h2>

      {challans.length === 0 ? (
        <p>No challans assigned yet.</p>
      ) : (
        <table style={{ marginTop: 15 }}>
          <thead>
            <tr>
              <th>Challan No</th>
              <th>University</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Delivery Mode</th>
              <th>Tracking</th>
              <th>Charges</th>
            </tr>
          </thead>

          <tbody>
            {challans.map(c => (
              <tr key={c.id}>
                <td>{c.challan_no}</td>
                <td>{c.university}</td>
                <td>{c.quantity}</td>

                <td>
                  <b>{c.status}</b>
                </td>

                <td>
                  {c.delivery_mode || "-"}
                </td>

                <td>
                  {c.delivery_mode === "COURIER" && c.docket_no && (
                    <>Docket: {c.docket_no}</>
                  )}

                  {c.delivery_mode === "TRANSPORT" && c.transport_slip && (
                    <>Slip: {c.transport_slip}</>
                  )}

                  {c.delivery_mode === "HAND" && "By Hand"}
                </td>

                <td>
                  {c.delivery_charges > 0
                    ? `₹${c.delivery_charges}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
