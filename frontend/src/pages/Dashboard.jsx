import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="section">
      <h2>📊 Dashboard</h2>

      <p>
        Welcome <b>{user.name}</b>
      </p>

      <p>
        <b>Role:</b> {user.role}
      </p>

      <p>
        <b>Status:</b> Logged In
      </p>
    </div>
  );
}
