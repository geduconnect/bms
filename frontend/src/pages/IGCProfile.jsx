import { useEffect, useState } from "react";
import api from "../api";

export default function IGCProfile({ igcId }) {
  const [form, setForm] = useState({
    address: "",
    gst_no: "",
    contact_person: "",
    mobile: "",
  });

  useEffect(() => {
    api.get(`/users/${igcId}`).then(res => {
      setForm({
        address: res.data.address || "",
        gst_no: res.data.gst_no || "",
        contact_person: res.data.contact_person || "",
        mobile: res.data.mobile || "",
      });
    });
  }, [igcId]);

  const updateProfile = async () => {
    await api.put(`/users/igc/${igcId}/profile`, form);
    alert("IGC profile updated");
  };

  return (
    <div className="card">
      <h3>IGC Profile</h3>

      <input placeholder="Address"
        value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
      />

      <input placeholder="GST Number"
        value={form.gst_no}
        onChange={e => setForm({ ...form, gst_no: e.target.value })}
      />

      <input placeholder="Contact Person"
        value={form.contact_person}
        onChange={e => setForm({ ...form, contact_person: e.target.value })}
      />

      <input placeholder="Mobile"
        value={form.mobile}
        onChange={e => setForm({ ...form, mobile: e.target.value })}
      />

      <button onClick={updateProfile}>Save</button>
    </div>
  );
}
