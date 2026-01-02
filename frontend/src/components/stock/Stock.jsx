import { useState } from "react";
import { useAuth } from "../../AuthContext";
import OrderedStock from "./OrderedStock";
import ReceivedStock from "./ReceivedStock";
import AvailableStock from "./AvailableStock";

/* ===== REUSABLE HELPERS ===== */

export const Modal = ({ title, children, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h3>{title}</h3>
      {children}
    </div>
  </div>
);

export const ModalActions = ({ onSave, onCancel }) => (
  <div className="modal-actions">
    <button className="secondary" onClick={onCancel}>Cancel</button>
    <button onClick={onSave}>Save</button>
  </div>
);

export const Input = ({ label, type = "text", v, s }) => (
  <input
    type={type}
    placeholder={label}
    value={v ?? ""}
    onChange={(e) => s(e.target.value)}
  />
);

/* ===== MAIN STOCK PAGE ===== */

export default function Stock() {
  const { user } = useAuth();
  const [tab, setTab] = useState("AVAILABLE");

  return (
    <div className="section">
      <h2>📦 Stock Management</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <button onClick={() => setTab("ORDERED")}>Ordered</button>
        )}
        {(user.role === "WAREHOUSE" || user.role === "SUPER_ADMIN") && (
          <button onClick={() => setTab("RECEIVED")}>Received</button>
        )}
        <button onClick={() => setTab("AVAILABLE")}>Available</button>
      </div>

      {tab === "ORDERED" && <OrderedStock />}
      {tab === "RECEIVED" && <ReceivedStock />}
      {tab === "AVAILABLE" && <AvailableStock />}
    </div>
  );
}
