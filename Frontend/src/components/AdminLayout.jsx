import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/admin-hub', label: '📊 Overview', match: '/admin-hub' },
    { path: '/admin-hub/rooms', label: '🏠 Room Manager' },
    { path: '/admin-hub/students', label: '👥 Student Center' },
    { path: '/admin-hub/helpdesk', label: '🛠️ Service Desk' },
    { path: '/admin-hub/approvals', label: '⏳ Pending Approvals' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0715] text-white overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r shadow-2xl z-20"
        style={{ background: 'rgba(15,10,30,0.95)', borderColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center space-x-3">
             <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
               style={{ background: 'linear-gradient(135deg, #ff8a00, #ff5f6d)' }}>
               <span className="font-bold text-white text-lg">N</span>
             </div>
             <span className="text-xl font-bold tracking-wide"
               style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
               Nestify Admin
             </span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-8 py-6 mb-2">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border"
               style={{ background: 'rgba(255,183,3,0.1)', borderColor: 'rgba(255,183,3,0.3)', color: '#ffb703' }}>
               👑
             </div>
             <div>
               <p className="font-bold text-sm">Control Center</p>
               <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
             </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
          {navItems.map((item) => {
            const isActive = item.match ? location.pathname === item.match : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive ? 'shadow-lg hover:scale-[1.02]' : 'hover:bg-white/5'}`}
                style={{
                  background: isActive ? 'linear-gradient(90deg, rgba(255,138,0,0.15), rgba(255,95,109,0.15))' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(255,138,0,0.3)' : '1px solid transparent',
                  borderLeft: isActive ? '3px solid #ff8a00' : '1px solid transparent'
                }}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout Bottom */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-red-500/10 hover:text-red-500" style={{ color: 'var(--text-muted)' }}>
            🚪 Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black/40 relative">
        {/* Subtle Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" 
             style={{ background: 'radial-gradient(circle, rgba(255,138,0,0.05) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}></div>
        
        {/* Scrollable container for child content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative z-10 w-full">
           {children}
        </div>
      </main>

    </div>
  );
}
