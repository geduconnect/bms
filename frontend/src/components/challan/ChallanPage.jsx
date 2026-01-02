import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import ChallanList from "./ChallanList";

export default function ChallanPage() {
  const [challans, setChallans] = useState([]);
  const [igcs, setIgcs] = useState([]);
  const [igcId, setIgcId] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 Fetch Challans */
  const fetchChallans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/challans", {
        params: igcId ? { igc_id: igcId } : {},
      });
      setChallans(res.data);
    } catch (err) {
      alert("Failed to load challans");
    } finally {
      setLoading(false);
    }
  }, [igcId]);

  /* 👥 Fetch IGCs */
  useEffect(() => {
    api.get("/users?role=IGC").then(res => setIgcs(res.data));
  }, []);

  /* 🔁 Re-fetch on filter change */
  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  return (
    <>
      <select value={igcId} onChange={e => setIgcId(e.target.value)}>
        <option value="">All IGCs</option>
        {igcs.map(i => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading challans...</p>
      ) : (
        <ChallanList challans={challans} reload={fetchChallans} />
      )}
    </>
  );
}
