import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const fetchPending = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/pending-users", cfg);
      setPending(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (id) => {
    await axios.put(`http://localhost:5000/api/admin/approve/${id}`, {}, cfg);
    fetchPending();
  };

  const reject = async (id) => {
    if (!window.confirm("Reject and delete this user?")) return;
    await axios.delete(`http://localhost:5000/api/admin/reject/${id}`, cfg);
    fetchPending();
  };

  return (
    <div className="app-bg p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold" style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          👑 Admin Panel
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage student approvals and system settings</p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
          ⏳ Pending Approvals
          {pending.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,183,3,0.2)', color: '#ffb703' }}>
              {pending.length}
            </span>
          )}
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : pending.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">✅</div>
            <p>No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((u) => (
              <div key={u._id} className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Registered: {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => approve(u._id)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => reject(u._id)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}