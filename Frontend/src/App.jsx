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
import { AuthProvider, useAuth } from "./context/AuthContext";

const AppLayout = () => {
  const { user } = useAuth();
  return (
    <div className="app-bg min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className={`flex-1 ${user ? "pt-20" : ""}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* ✅ Admin only */}
          <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
          <Route path="/rooms" element={<AdminRoute><Rooms /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

          {/* ✅ Student only */}
          <Route path="/my-room" element={<ProtectedRoute><MyRoom /></ProtectedRoute>} />

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