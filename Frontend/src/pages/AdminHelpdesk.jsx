import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AdminHelpdesk() {
  const { token } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/maintenance", cfg);
      setIssues(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const resolveIssue = async (studentId, issueId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/maintenance/${studentId}/${issueId}/resolve`, {}, cfg);
      setIssues(issues.map(i => i._id === issueId ? { ...i, status: 'resolved' } : i));
    } catch (e) {
      alert("Failed to resolve issue");
    }
  };

  if (loading) return (
    <div className="app-bg min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
    </div>
  );

  const pendingIssues = issues.filter(i => i.status === 'pending');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  return (
    <div className="app-bg p-6 min-h-screen">
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-extrabold" style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🛠️ Maintenance Helpdesk
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage student complaints and requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Issues */}
        <div className="glass-panel rounded-2xl p-6 fade-in">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
            🚨 Pending Requests
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {pendingIssues.length}
            </span>
          </h2>
          
          {pendingIssues.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              <div className="text-5xl mb-3">🧊</div>
              <p>Everything is working perfectly!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingIssues.map(issue => (
                <div key={issue._id} className="p-4 rounded-xl transition hover:scale-[1.01]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                        Room {issue.roomNumber}
                      </span>
                      <h3 className="font-semibold text-lg">{issue.issue}</h3>
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(issue.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>From: <span className="text-white font-medium">{issue.studentName}</span></p>
                    <button 
                      onClick={() => resolveIssue(issue.studentId, issue._id)}
                      className="px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}>
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolved Issues */}
        <div className="glass-panel rounded-2xl p-6 fade-in" style={{ opacity: 0.8 }}>
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
            ✅ Resolved History
          </h2>
          
          {resolvedIssues.length === 0 ? (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No history yet.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {resolvedIssues.map(issue => (
                <div key={issue._id} className="p-3 rounded-xl flex justify-between items-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid border-white/5' }}>
                  <div>
                    <h3 className="font-medium text-sm text-gray-300 line-through">{issue.issue}</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Room {issue.roomNumber} • {issue.studentName}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 border border-green-500/30">
                    Resolved
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
