import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Sidebar from "./components/Sidebar";

export default function MainLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/" />;

  return (
    <>
      <Sidebar />
      <div className="main">
        {children}
      </div>
    </>
  );
}
