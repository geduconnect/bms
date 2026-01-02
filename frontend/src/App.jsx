import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import IGCDashboard from "./pages/IGCDashboard";
import Users from "./pages/Users";

// Modules
import Stock from "./components/stock/Stock";
import Challan from "./components/challan/Challan";
import IGChallans from "./components/challan/IGChallans";
import Reports from "./components/Reports";

// Layout
import MainLayout from "./MainLayout";
import "./App.css";

/* 🔒 PROTECTED ROUTE */
const ProtectedRoute = ({ children, allow }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/" replace />;

  if (allow && !allow.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "IGC" ? "/igc/challans" : "/dashboard"}
        replace
      />
    );
  }

  return children;
};

export default function App() {
  return (
    <Routes>

      {/* 🌐 PUBLIC */}
      <Route path="/" element={<Login />} />

      {/* 🧾 IGC ROOT → REDIRECT TO TRACKING */}
      <Route
        path="/igc"
        element={
          <ProtectedRoute allow={["IGC"]}>
            <Navigate to="/igc/challans" replace />
          </ProtectedRoute>
        }
      />

      {/* 📑 IGC DELIVERY TRACKING */}
      <Route
        path="/igc/challans"
        element={
          <ProtectedRoute allow={["IGC"]}>
            <MainLayout>
              <IGChallans />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 📊 ADMIN / STAFF DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allow={["SUPER_ADMIN", "ADMIN", "WAREHOUSE", "DISPATCH"]}
          >
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 📦 STOCK */}
      <Route
        path="/stock"
        element={
          <ProtectedRoute allow={["SUPER_ADMIN", "ADMIN", "WAREHOUSE"]}>
            <MainLayout>
              <Stock />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 📑 CHALLANS (ADMIN + WAREHOUSE + DISPATCH) */}
      <Route
        path="/challans"
        element={
          <ProtectedRoute
            allow={["SUPER_ADMIN", "ADMIN", "WAREHOUSE", "DISPATCH"]}
          >
            <MainLayout>
              <Challan />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 📊 REPORTS */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allow={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 👥 USERS */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allow={["SUPER_ADMIN", "ADMIN"]}>
            <MainLayout>
              <Users />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ❌ FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
