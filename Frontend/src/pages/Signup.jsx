import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setSuccess('Account created! ✅ Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #ff8a00, #ff5f6d)' }}>
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Join Nestify — Admin will approve your account</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
              className="w-full px-4 py-3 rounded-xl outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
              placeholder="••••••••" />
          </div>

          {/* ✅ NO role dropdown — always student */}
          <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', color: '#ffb703' }}>
            🎓 You will be registered as a <strong>Student</strong>. Admin approval required.
          </div>

          <button type="submit" disabled={loading} className="neon-btn w-full py-3 text-white font-semibold">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ffb703' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;