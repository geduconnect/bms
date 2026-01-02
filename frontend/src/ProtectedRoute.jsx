import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/" replace />;

  if (allow && !allow.includes(user.role)) {
    // Role not allowed → redirect safely
    return <Navigate to={user.role === "IGC" ? "/igc" : "/dashboard"} replace />;
  }

  return children;
};
