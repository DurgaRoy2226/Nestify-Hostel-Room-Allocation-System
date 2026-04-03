import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import AdminPanel from "./pages/AdminPanel";
import MyRoom from "./pages/MyRoom";
import Profile from "./pages/Profile";
import SelectRoom from "./pages/SelectRoom";
import AdminHelpdesk from "./pages/AdminHelpdesk";
import { AuthProvider, useAuth } from "./context/AuthContext";

const AppLayout = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin-hub" element={<AdminRoute><AdminLayout><Dashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin-hub/rooms" element={<AdminRoute><AdminLayout><Rooms /></AdminLayout></AdminRoute>} />
        <Route path="/admin-hub/students" element={<AdminRoute><AdminLayout><Students /></AdminLayout></AdminRoute>} />
        <Route path="/admin-hub/approvals" element={<AdminRoute><AdminLayout><AdminPanel /></AdminLayout></AdminRoute>} />
        <Route path="/admin-hub/helpdesk" element={<AdminRoute><AdminLayout><AdminHelpdesk /></AdminLayout></AdminRoute>} />
        <Route path="*" element={<Navigate to="/admin-hub" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-bg min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className={`flex-1 ${user ? "pt-20" : ""}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Common / Student */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-room" element={<ProtectedRoute><MyRoom /></ProtectedRoute>} />
          <Route path="/select-room" element={<ProtectedRoute><SelectRoom /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}