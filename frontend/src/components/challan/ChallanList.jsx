import api from "../../api";
import { useAuth } from "../../AuthContext";

export default function ChallanList({ challans, reload }) {
  const { user } = useAuth();

  const canApprove =
    user && ["SUPER_ADMIN", "ADMIN"].includes(user.role);

  const updateStatus = async (id, status) => {
    const remarks = prompt("Remarks (optional)");
    if (remarks === null) return; // cancel pressed

    try {
      await api.put(`/challans/${id}/status`, { status, remarks });
      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>No</th>
          <th>University</th>
          <th>IGC</th>
          <th>Qty</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {challans.length === 0 && (
          <tr>
            <td colSpan="6" align="center">
              No challans found
            </td>
          </tr>
        )}

        {challans.map(c => (
          <tr key={c.id}>
            <td>{c.challan_no}</td>
            <td>{c.university}</td>
            <td>{c.igc_name}</td>
            <td>{c.quantity}</td>
            <td>
              <span className={`status ${c.status.toLowerCase()}`}>
                {c.status}
              </span>
            </td>

            <td>
              {canApprove && c.status === "INITIATED" && (
                <>
                  <button onClick={() => updateStatus(c.id, "APPROVED")}>
                    Approve
                  </button>
                  <button onClick={() => updateStatus(c.id, "CANCELLED")}>
                    Reject
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_URL}/challans/${c.id}/pdf`,
                    "_blank"
                  )
                }
              >
                Print
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
