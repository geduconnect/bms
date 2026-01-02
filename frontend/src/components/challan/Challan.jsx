import { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../AuthContext";
import { Modal, ModalActions } from "../stock/Stock";

export default function Challan() {
  const { user } = useAuth();

  const [challans, setChallans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(null);

  /* STOCK */
  const [stockList, setStockList] = useState([]);
  const [available, setAvailable] = useState(null);

  /* IGC */
  const [igcs, setIgcs] = useState([]);
  const [selectedIGC, setSelectedIGC] = useState(null);

  /* DELIVERY */
  const [delivery, setDelivery] = useState({
    delivery_mode: "",
    docket_no: "",
    transport_slip: "",
    delivery_charges: "",
  });

  const initialForm = {
    university: "",
    subject: "",
    specialization: "",
    semester: "",
    igc_user_id: "",
    quantity: "",
  };

  const [form, setForm] = useState(initialForm);

  /* ROLE FLAGS */
  const canApprove = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);
  const isWarehouse = user?.role === "WAREHOUSE";
  const isDispatch = user?.role === "DISPATCH";
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

  /* ================= FETCH CHALLANS (ROLE-BASED) ================= */
  const fetchChallans = async () => {
    const res = await api.get("/challans"); // ❌ NO STATUS FILTER
    setChallans(res.data);
  };

  useEffect(() => {
    if (user) fetchChallans();
  }, [user]);

  /* ================= OPEN CREATE MODAL ================= */
  const openCreateModal = async () => {
    setShowForm(true);
    setForm(initialForm);
    setAvailable(null);
    setSelectedIGC(null);

    const requests = [api.get("/stock/for-challan"), api.get("/igcs")];
    const [stockRes, igcRes] = await Promise.all(requests);

    setStockList(stockRes.data);
    setIgcs(igcRes.data);
  };

  /* ================= STOCK DROPDOWNS ================= */
  const universities = [...new Set(stockList.map(s => s.university))];

  const subjects = stockList
    .filter(s => s.university === form.university)
    .map(s => s.subject);

  const specializations = stockList
    .filter(
      s =>
        s.university === form.university &&
        s.subject === form.subject
    )
    .map(s => s.specialization || "General");

  const semesters = stockList
    .filter(
      s =>
        s.university === form.university &&
        s.subject === form.subject &&
        (s.specialization || "General") === form.specialization
    )
    .map(s => s.semester);

  /* ================= AVAILABLE STOCK ================= */
  useEffect(() => {
    const stock = stockList.find(
      s =>
        s.university === form.university &&
        s.subject === form.subject &&
        (s.specialization || "General") === form.specialization &&
        s.semester === form.semester
    );
    setAvailable(stock ? stock.available_qty : null);
  }, [form, stockList]);

  /* ================= CREATE CHALLAN ================= */
  const createChallan = async () => {
    if (!form.university || !form.subject || !form.quantity || !selectedIGC) {
      alert("All required fields must be filled");
      return;
    }

    await api.post("/challans", {
      university: form.university,
      subject: form.subject,
      specialization: form.specialization || null,
      semester: form.semester || null,
      quantity: Number(form.quantity),
      igc_user_id: selectedIGC.id,
    });

    setShowForm(false);
    fetchChallans();
  };

  /* ================= APPROVE / REJECT ================= */
  const updateStatus = async (id, status) => {
    const remarks = prompt("Remarks (optional)");
    if (remarks === null) return;

    await api.put(`/challans/${id}/status`, { status, remarks });
    fetchChallans();
  };
  const packChallan = async id => {
    if (!confirm("Mark challan as packed?")) return;
    await api.put(`/challans/${id}/pack`);
    fetchChallans();
  };

  /* ================= DISPATCH ================= */
  const dispatchChallan = async () => {
    await api.put(`/challans/${dispatchModal.id}/dispatch`, {
      ...delivery,
      delivery_charges: Number(delivery.delivery_charges || 0),
    });

    setDispatchModal(null);
    setDelivery({
      delivery_mode: "",
      docket_no: "",
      transport_slip: "",
      delivery_charges: "",
    });

    fetchChallans();
  };
  const markDelivered = async id => {
    if (!confirm("Mark this challan as delivered?")) return;

    await api.put(`/challans/${id}/delivered`);
    fetchChallans();
  };
  /* ================= UI ================= */
  return (
    <div className="section">
      <h2>📦 Challan Management</h2>

      {canApprove && (
        <button onClick={openCreateModal}>➕ Create Challan</button>
      )}

      <table style={{ marginTop: 15 }}>
        <thead>
          <tr>
            <th>Challan No</th>
            <th>University</th>
            <th>IGC</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {challans.map(c => (
            <tr key={c.id}>
              <td>{c.challan_no}</td>
              <td>{c.university}</td>
              <td>{c.igc_name}</td>
              <td>{c.quantity}</td>
              <td>{c.status}</td>

              <td>
                {isWarehouse && c.status === "INITIATED" && (
                  <button onClick={() => packChallan(c.id)}>📦 Pack</button>
                )}

                {isDispatch && c.status === "PACKED" && (
                  <button onClick={() => setDispatchModal(c)}>🚚 Dispatch</button>
                )}

                {isAdmin && c.status === "DISPATCHED" && (
                  <button onClick={() => markDelivered(c.id)}>✅ Delivered</button>
                )}

                <button onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_URL}/challans/${c.id}/pdf`,
                    "_blank"
                  )
                }>
                  📄 PDF
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DISPATCH MODAL ================= */}
      {dispatchModal && (
        <Modal
          title={`🚚 Dispatch – ${dispatchModal.challan_no}`}
          onClose={() => setDispatchModal(null)}
        >
          <select
            value={delivery.delivery_mode}
            onChange={e =>
              setDelivery({ ...delivery, delivery_mode: e.target.value })
            }
          >
            <option value="">Select Delivery Mode</option>
            <option value="HAND">By Hand</option>
            <option value="COURIER">Courier</option>
            <option value="TRANSPORT">Transport</option>
          </select>

          {delivery.delivery_mode === "COURIER" && (
            <>
              <input
                placeholder="Docket Number"
                value={delivery.docket_no}
                onChange={e =>
                  setDelivery({ ...delivery, docket_no: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Charges"
                value={delivery.delivery_charges}
                onChange={e =>
                  setDelivery({ ...delivery, delivery_charges: e.target.value })
                }
              />
            </>
          )}

          {delivery.delivery_mode === "TRANSPORT" && (
            <>
              <input
                placeholder="Transport Slip"
                value={delivery.transport_slip}
                onChange={e =>
                  setDelivery({ ...delivery, transport_slip: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Charges"
                value={delivery.delivery_charges}
                onChange={e =>
                  setDelivery({ ...delivery, delivery_charges: e.target.value })
                }
              />
            </>
          )}

          <ModalActions
            onSave={dispatchChallan}
            onCancel={() => setDispatchModal(null)}
          />
        </Modal>
      )}


      {/* ================= CREATE MODAL ================= */}
      {showForm && (
        <Modal title="➕ Create Challan" onClose={() => setShowForm(false)}>
          <select
            value={form.university}
            onChange={e =>
              setForm({
                ...form,
                university: e.target.value,
                subject: "",
                specialization: "",
                semester: "",
              })
            }
          >
            <option value="">Select University</option>
            {universities.map((u, i) => (
              <option key={i}>{u}</option>
            ))}
          </select>

          <select
            value={form.subject}
            onChange={e =>
              setForm({
                ...form,
                subject: e.target.value,
                specialization: "",
                semester: "",
              })
            }
          >
            <option value="">Select Subject</option>
            {[...new Set(subjects)].map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>

          <select
            value={form.specialization}
            onChange={e =>
              setForm({ ...form, specialization: e.target.value, semester: "" })
            }
          >
            <option value="">Select Specialization</option>
            {[...new Set(specializations)].map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>

          <select
            value={form.semester}
            onChange={e => setForm({ ...form, semester: e.target.value })}
          >
            <option value="">Select Semester</option>
            {[...new Set(semesters)].map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>

          <select
            value={form.igc_user_id}
            onChange={e => {
              const igc = igcs.find(i => i.id == e.target.value);
              setSelectedIGC(igc);
              setForm({ ...form, igc_user_id: e.target.value });
            }}
          >
            <option value="">Select IGC</option>
            {igcs.map(i => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
          />

          {available !== null && (
            <p>
              Available Stock:{" "}
              <b style={{ color: available < form.quantity ? "red" : "green" }}>
                {available}
              </b>
            </p>
          )}

          <ModalActions
            onSave={createChallan}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
