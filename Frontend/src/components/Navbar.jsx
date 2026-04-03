import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path
    ? 'text-[#ffb703] border-b-2 border-[#ffb703] pb-0.5'
    : 'hover:text-[#ffb703] transition-colors';

  // ✅ Fetch real notifications
  useEffect(() => {
    if (!user || !token) return;
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(res.data);
      } catch (e) { console.error("Notification error:", e); }
    };
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, token, location.pathname]);

  const markAllRead = async () => {
    try {
      await axios.put("http://localhost:5000/api/notifications/mark-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (e) { console.error("Error marking read:", e); }
  };

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50 py-3 px-6 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ff8a00, #ff5f6d)' }}>
          <span className="font-bold text-white text-lg">N</span>
        </div>
        <Link to="/" className="text-xl font-bold"
          style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nestify
        </Link>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center space-x-6 text-sm">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>

        {/* Admin Links */}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className={isActive('/admin')}>
              <span className="flex items-center gap-1">👑 Admin Panel</span>
            </Link>
            <Link to="/students" className={isActive('/students')}>Students</Link>
            <Link to="/rooms" className={isActive('/rooms')}>Rooms</Link>
          </>
        )}

        {/* Student Links */}
        {user?.role === 'student' && (
          <>
            <Link to="/my-room" className={isActive('/my-room')}>🏠 My Room</Link>
            <Link to="/profile" className={isActive('/profile')}>👤 Profile</Link>
          </>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-3">

        {/* ✅ Global Notification Bell */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowAlerts(!showAlerts);
                if (!showAlerts) markAllRead();
              }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              🔔
              {alerts.filter(a => !a.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#ef4444', color: 'white' }}>
                  {alerts.filter(a => !a.isRead).length}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
                style={{ background: 'rgba(15,10,30,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)' }}>
                <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="font-bold text-sm text-white flex items-center gap-2">🔔 Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-2 scrollbar-hide">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      ✅ No new alerts!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((a, i) => (
                        <div key={i} className={`p-3 rounded-xl text-sm transition-all ${!a.isRead ? 'bg-white/5 border border-white/10' : 'opacity-70'}`}
                          style={{
                            borderLeft: `3px solid ${a.type === 'danger' || a.type === 'warning' ? '#ef4444' : a.type === 'success' ? '#22c55e' : '#3b82f6'}`
                          }}>
                          <p className="text-white">{a.message}</p>
                          <span className="text-[10px] mt-1 block" style={{ color: 'var(--text-muted)' }}>
                            {new Date(a.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: user?.role === 'admin' ? '#ffb703' : '#22c55e' }} />
          <span>{user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}</span>
          <span style={{ color: 'var(--text-muted)' }}>• {user?.name || user?.email}</span>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="neon-btn px-4 py-2 text-sm text-white">
          Logout
        </button>
      </div>

      {/* Click outside to close alerts */}
      {showAlerts && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
      )}
    </nav>
  );
};

export default Navbar;