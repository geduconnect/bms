import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function IGCDashboard() {
  const { user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "IGC") {
      api
        .get("/igcs/my-challans")
        .then(res => setChallans(res.data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user || user.role !== "IGC") {
    return <p>Unauthorized</p>;
  }

  return (
    <div className="section">
      <h2>📦 My Challans</h2>

      {loading ? (
        <p>Loading...</p>
      ) : challans.length === 0 ? (
        <p>No challans issued yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Challan No</th>
              <th>University</th>
              <th>Subject</th>
              <th>Semester</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((c, i) => (
              <tr key={i}>
                <td>{c.challan_no}</td>
                <td>{c.university}</td>
                <td>{c.subject}</td>
                <td>{c.semester || "-"}</td>
                <td>{c.quantity}</td>
                <td>
                  <span style={{
                    color:
                      c.status === "DELIVERED"
                        ? "green"
                        : c.status === "DISPATCHED"
                        ? "orange"
                        : "#555",
                    fontWeight: 600
                  }}>
                    {c.status}
                  </span>
                </td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
