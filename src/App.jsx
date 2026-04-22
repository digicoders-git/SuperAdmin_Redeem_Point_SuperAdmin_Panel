import { Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import AdminDetail from "./pages/AdminDetail";
import AllUsers from "./pages/AllUsers";
import AllRewards from "./pages/AllRewards";
import CreateAdmin from "./pages/CreateAdmin";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";
import Subscriptions from "./pages/Subscriptions";
import SystemSettings from "./pages/SystemSettings";
import Notifications from "./pages/Notifications";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("saToken");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 font-sans">
      <Routes>
        <Route path="/" element={<SuperAdminLogin />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admins" element={<ProtectedRoute><Admins /></ProtectedRoute>} />
        <Route path="/admins/:id" element={<ProtectedRoute><AdminDetail /></ProtectedRoute>} />
        <Route path="/admins/create" element={<ProtectedRoute><CreateAdmin /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><AllUsers /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><AllRewards /></ProtectedRoute>} />
        <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
