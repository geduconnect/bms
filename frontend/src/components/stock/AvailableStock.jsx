import { useEffect, useState } from "react";
import api from "../../api";
import { Modal } from "./Stock";

export default function AvailableStock() {
  const [stock, setStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [show, setShow] = useState(null);

  const fetchStock = async () => {
    const res = await api.get("/stock");
    setStock(res.data);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>University</th>
            <th>Subject</th>
            <th>Available</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id}>
              <td>{s.university}</td>
              <td>{s.subject}</td>
              <td>{s.available_qty}</td>
              <td>
                <button
                  onClick={async () => {
                    const res = await api.get(`/stock/${s.id}/history`);
                    setHistory(res.data);
                    setShow(s);
                  }}
                >
                  📜 History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <Modal title="📦 Stock History" onClose={() => setShow(null)}>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Qty</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.type}</td>
                  <td>{h.quantity}</td>
                  <td>{h.action_by || "-"}</td>
                  <td>{new Date(h.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </>
  );
}
