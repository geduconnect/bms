import { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../AuthContext";
import { Input, Modal, ModalActions } from "./Stock";

export default function OrderedStock() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    university: "",
    subject: "",
    specialization: "",
    semester: "",
    quantity: "",
    vendor: "",
    order_date: "",
  });

  const fetchOrders = async () => {
    const res = await api.get("/stock/ordered");
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const createOrder = async () => {
    await api.post("/stock/ordered", form);
    setShowModal(false);
    setForm({
      university: "",
      subject: "",
      specialization: "",
      semester: "",
      quantity: "",
      vendor: "",
      order_date: "",
    });
    fetchOrders();
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>➕ Add Order</button>

      <table>
        <thead>
          <tr>
            <th>University</th>
            <th>Subject</th>
            <th>Qty</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.university}</td>
              <td>{o.subject}</td>
              <td>{o.quantity}</td>
              <td>{o.vendor || "-"}</td>
              <td>{o.status}</td>
              <td>{o.created_by_name || o.created_by}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <Modal title="➕ Create Order" onClose={() => setShowModal(false)}>
          <Input label="University" v={form.university} s={v => setForm({ ...form, university: v })} />
          <Input label="Subject" v={form.subject} s={v => setForm({ ...form, subject: v })} />
          <Input label="Specialization" v={form.specialization} s={v => setForm({ ...form, specialization: v })} />
          <Input label="Semester" v={form.semester} s={v => setForm({ ...form, semester: v })} />
          <Input label="Quantity" type="number" v={form.quantity} s={v => setForm({ ...form, quantity: v })} />
          <Input label="Vendor" v={form.vendor} s={v => setForm({ ...form, vendor: v })} />
          <Input label="Order Date" type="date" v={form.order_date} s={v => setForm({ ...form, order_date: v })} />
          <ModalActions onSave={createOrder} onCancel={() => setShowModal(false)} />
        </Modal>
      )}
    </>
  );
}
