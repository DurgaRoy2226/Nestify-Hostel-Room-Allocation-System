import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
          <span className="font-bold text-dark-900">N</span>
        </div>
        <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
          Nestify
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link>
        <Link to="/students" className="hover:text-primary-400 transition-colors">Students</Link>
        <Link to="/rooms" className="hover:text-primary-400 transition-colors">Rooms</Link>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user?.role === 'admin' ? 'Admin' : 'Student'}
          </span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;