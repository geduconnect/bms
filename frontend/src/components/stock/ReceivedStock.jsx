import { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../AuthContext";
import { Input, Modal, ModalActions } from "./Stock";

export default function ReceivedStock() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);     // pending orders
  const [received, setReceived] = useState([]); // received history
  const [receive, setReceive] = useState(null); // receive modal
  const [history, setHistory] = useState([]);   // per-order history
  const [showHistory, setShowHistory] = useState(null);

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    try {
      const [ordersRes, receivedRes] = await Promise.all([
        api.get("/stock/ordered"),
        api.get("/stock/received"),
      ]);

      // pending orders only
      setOrders(
        ordersRes.data.filter((o) => Number(o.remaining_qty) > 0)
      );

      // full received history
      setReceived(receivedRes.data);
    } catch (err) {
      console.error("Failed to fetch received stock data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= RECEIVE STOCK ================= */

  const submitReceive = async () => {
    if (!receive.quantity || receive.quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      await api.post("/stock/received", {
        ordered_stock_id: receive.id,
        university: receive.university,
        subject: receive.subject,
        specialization: receive.specialization,
        semester: receive.semester,
        quantity: Number(receive.quantity),
      });

      setReceive(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to receive stock");
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {/* EXPORT */}
      <div style={{ marginBottom: 15 }}>
        <a href="http://localhost:8008/api/stock/received/export/csv">
          <button>⬇ Export Received Report</button>
        </a>
      </div>

      {/* ================= PENDING RECEIPTS ================= */}
      <h3>📦 Pending Receipts</h3>

      <table>
        <thead>
          <tr>
            <th>University</th>
            <th>Subject</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Remaining</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6">No pending receipts</td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.university}</td>
                <td>{o.subject}</td>
                <td>{o.quantity}</td>
                <td>{o.received_qty}</td>
                <td>
                  <b style={{ color: "red" }}>{o.remaining_qty}</b>
                </td>
                <td>
                  {user?.role === "WAREHOUSE" && (
                    <>
                      <button
                        onClick={() =>
                          setReceive({
                            ...o,
                            quantity: o.remaining_qty,
                          })
                        }
                      >
                        📥 Receive
                      </button>

                      <button
                        onClick={async () => {
                          const res = await api.get(
                            `/stock/received/order/${o.id}`
                          );
                          setHistory(res.data);
                          setShowHistory(o);
                        }}
                      >
                        📜 History
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= RECEIVED HISTORY ================= */}
      <h3 style={{ marginTop: 30 }}>📜 Received History</h3>

      <table>
        <thead>
          <tr>
            <th>University</th>
            <th>Subject</th>
            <th>Qty</th>
            <th>Received By</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {received.length === 0 ? (
            <tr>
              <td colSpan="5">No stock received yet</td>
            </tr>
          ) : (
            received.map((r) => (
              <tr key={r.id}>
                <td>{r.university}</td>
                <td>{r.subject}</td>
                <td>{r.quantity}</td>
                <td>{r.received_by || "-"}</td>
                <td>
                  {new Date(
                    r.received_at || r.created_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= RECEIVE MODAL ================= */}
      {receive && (
        <Modal title="📥 Receive Stock" onClose={() => setReceive(null)}>
          <p>
            <b>{receive.university}</b> – {receive.subject}
          </p>

          <Input
            label="Quantity Received"
            type="number"
            v={receive.quantity}
            s={(v) => setReceive({ ...receive, quantity: v })}
          />

          <ModalActions
            onSave={submitReceive}
            onCancel={() => setReceive(null)}
          />
        </Modal>
      )}

      {/* ================= ORDER RECEIVE HISTORY MODAL ================= */}
      {showHistory && (
        <Modal
          title="📜 Receive History"
          onClose={() => setShowHistory(null)}
        >
          <table>
            <thead>
              <tr>
                <th>Qty</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="3">No history found</td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.quantity}</td>
                    <td>{h.received_by}</td>
                    <td>
                      {new Date(h.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Modal>
      )}
    </>
  );
}
