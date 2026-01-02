import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h3>BMS</h3>

      {/* USER INFO */}
      <div
        style={{
          background: "#1e293b",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "12px",
          color: "#fff",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        👤 {user.name}
        <br />
        <small>{user.role}</small>
      </div>

      {/* ================= COMMON ================= */}
      {user.role !== "IGC" && (
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
      )}

      {/* ================= ADMIN / SUPER ADMIN ================= */}
      {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
        <>
          <button onClick={() => navigate("/stock")}>Stock</button>
          <button onClick={() => navigate("/challans")}>Challans</button>
          <button onClick={() => navigate("/reports")}>Reports</button>
          <button onClick={() => navigate("/users")}>Users</button>
        </>
      )}

      {/* ================= WAREHOUSE ================= */}
      {user.role === "WAREHOUSE" && (
        <>
          <button onClick={() => navigate("/challans")}>Challans</button>
          <button onClick={() => navigate("/stock")}>Stock</button>
        </>
      )}

      {/* ================= DISPATCH ================= */}
      {user.role === "DISPATCH" && (
        <>
          <button onClick={() => navigate("/challans")}>Challans</button>
        </>
      )}

      {/* ================= IGC ================= */}
      {user.role === "IGC" && (
        <>
          <button onClick={() => navigate("/igc/challans")}>
            📦 My Deliveries
          </button>
        </>
      )}

      {/* ================= LOGOUT ================= */}
      <button
        style={{ marginTop: "auto", background: "#dc2626", color: "#fff" }}
        onClick={logout}
      >
        Logout
      </button>
    </aside>
  );
}
