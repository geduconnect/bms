import { useEffect, useState } from "react";
import api from "../api";
import { Modal, ModalActions, Input } from "../components/stock/Stock";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("ADMIN");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    mobile: "",
    address: "",
  });

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async () => {
    await api.post("/users", form);
    setShow(false);
    fetchUsers();
  };

  return (
    <div className="section">
      <h2>👥 Users Management</h2>

      <button onClick={() => setShow(true)}>➕ Add User</button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.email}</td>
              <td>{u.mobile || "-"}</td>
              <td>{u.role === "IGC" ? u.status : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {show && (
        <Modal title="Create User" onClose={() => setShow(false)}>
          <Input label="Name" s={v => setForm({ ...form, name: v })} />
          <Input label="Email" s={v => setForm({ ...form, email: v })} />
          <Input label="Password" type="password" s={v => setForm({ ...form, password: v })} />

          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option>ADMIN</option>
            <option>WAREHOUSE</option>
            <option>DISPATCH</option>
            <option>IGC</option>
          </select>

          {form.role === "IGC" && (
            <>
              <Input label="Mobile" s={v => setForm({ ...form, mobile: v })} />
              <Input label="Address" s={v => setForm({ ...form, address: v })} />
            </>
          )}

          <ModalActions onSave={createUser} onCancel={() => setShow(false)} />
        </Modal>
      )}
    </div>
  );
}
