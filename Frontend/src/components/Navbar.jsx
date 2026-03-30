import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path
    ? 'text-[#ffb703] border-b-2 border-[#ffb703]'
    : 'hover:text-[#ffb703] transition-colors';

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50 py-3 px-6 flex justify-between items-center">
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

      <div className="hidden md:flex items-center space-x-6 text-sm">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>

        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className={isActive('/admin')}>
              <span className="flex items-center gap-1">👑 Admin Panel</span>
            </Link>
            <Link to="/students" className={isActive('/students')}>Students</Link>
            <Link to="/rooms" className={isActive('/rooms')}>Rooms</Link>
          </>
        )}

        {user?.role === 'student' && (
          <Link to="/my-room" className={isActive('/my-room')}>🏠 My Room</Link>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: user?.role === 'admin' ? '#ffb703' : '#22c55e' }} />
          <span>{user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}</span>
          <span style={{ color: 'var(--text-muted)' }}>• {user?.name || user?.email}</span>
        </div>
        <button onClick={handleLogout} className="neon-btn px-4 py-2 text-sm text-white">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;