import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function MyRoom() {
  const { token } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStep, setPayStep] = useState(1);
  const [payLoading, setPayLoading] = useState(false);
  const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const cfg = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/students/me", cfg);
        setStudent(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStudent();
  }, [token]);

  const submitMaintenance = async () => {
    if (!issue.trim()) return;
    try {
      await axios.post("http://localhost:5000/api/students/maintenance", { issue }, cfg);
      setIssue("");
      alert("Maintenance request submitted! ✅");
    } catch (e) { alert("Failed to submit request"); }
  };

  const handlePayNow = () => {
    setShowPayModal(true);
    setPayStep(1);
    setCardData({ number: "", name: "", expiry: "", cvv: "" });
  };

  const handlePaySubmit = () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)
      return alert("Please fill all fields!");
    setPayLoading(true);
    setPayStep(2);
    setTimeout(() => {
      setPayStep(3);
      setPayLoading(false);
      setStudent(prev => ({
        ...prev,
        feesStatus: "paid",
        feesHistory: [
          ...(prev.feesHistory || []),
          {
            amount: student?.room?.price || 5000,
            date: new Date().toISOString(),
            status: "success"
          }
        ]
      }));
    }, 2500);
  };

  if (loading) return (
    <div className="app-bg min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="app-bg p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold"
          style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏠 My Room
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Your hostel details and services</p>
      </div>

      {!student || !student.room ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-bold mb-2">No Room Assigned Yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>Admin will assign you a room soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Room Info */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-bold text-xl mb-5">🛏️ Room Details</h2>
            <div className="space-y-3">
              {[
                ['Room Number', student.room.roomNumber],
                ['Type', student.room.type],
                ['Block', student.room.block || 'A'],
                ['Floor', student.room.floor || '1'],
                ['Monthly Fees', `₹${student.room.price?.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span className="font-semibold text-white">{v}</span>
                </div>
              ))}
            </div>

            {/* Fees Status */}
            <div className="mt-5 p-3 rounded-xl flex items-center justify-between"
              style={{
                background: student.feesStatus === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${student.feesStatus === 'paid' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}>
              <span style={{ color: student.feesStatus === 'paid' ? '#22c55e' : '#ef4444' }}>
                {student.feesStatus === 'paid' ? '✅ Fees Paid' : '⚠️ Fees Pending'}
              </span>
              {student.feesStatus !== 'paid' && (
                <button onClick={handlePayNow} className="neon-btn px-4 py-2 text-sm text-white">
                  💳 Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-bold text-xl mb-5">💳 Payment History</h2>
            {!student.feesHistory?.length ? (
              <p style={{ color: 'var(--text-muted)' }}>No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {student.feesHistory.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <p className="text-sm font-semibold text-white">₹{f.amount?.toLocaleString()}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(f.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                      ✅ {f.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance */}
          <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-bold text-xl mb-5">🔧 Maintenance Request</h2>
            <div className="flex gap-4">
              <input value={issue} onChange={(e) => setIssue(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                placeholder="Describe the issue (e.g. Fan not working, Water leakage...)" />
              <button onClick={submitMaintenance} className="neon-btn px-6 py-3 text-white font-semibold">
                Submit
              </button>
            </div>
            {student.maintenanceRequests?.length > 0 && (
              <div className="mt-4 space-y-2">
                {student.maintenanceRequests.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span>{r.issue}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: r.status === 'resolved' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                        color: r.status === 'resolved' ? '#22c55e' : '#f59e0b'
                      }}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💳 Dummy Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-4 fade-in">

            {/* Step 1 — Card Details */}
            {payStep === 1 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">💳 Pay Fees</h2>
                  <button onClick={() => setShowPayModal(false)}
                    className="text-2xl hover:text-white transition"
                    style={{ color: 'var(--text-muted)' }}>×</button>
                </div>

                {/* Amount Badge */}
                <div className="p-4 rounded-xl mb-5 text-center"
                  style={{ background: 'rgba(255,138,0,0.1)', border: '1px solid rgba(255,138,0,0.3)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Amount to Pay</p>
                  <p className="text-3xl font-extrabold" style={{ color: '#ffb703' }}>
                    ₹{(student?.room?.price || 5000).toLocaleString()}
                  </p>
                </div>

                {/* Visual Card */}
                <div className="p-5 rounded-2xl mb-5"
                  style={{ background: 'linear-gradient(135deg, #ff8a00, #ff5f6d)', minHeight: '110px' }}>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>NESTIFY HOSTEL CARD</p>
                  <p className="text-white font-mono text-lg tracking-widest mb-3">
                    {cardData.number || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {cardData.name || "CARD HOLDER"}
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {cardData.expiry || "MM/YY"}
                    </p>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <input
                    className="w-full px-4 py-3 rounded-xl outline-none text-white font-mono"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                    placeholder="Card Number (16 digits)"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setCardData({ ...cardData, number: formatted });
                    }}
                  />
                  <input
                    className="w-full px-4 py-3 rounded-xl outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                    placeholder="Cardholder Name"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="px-4 py-3 rounded-xl outline-none text-white"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        const formatted = val.length >= 2 ? val.slice(0, 2) + '/' + val.slice(2) : val;
                        setCardData({ ...cardData, expiry: formatted });
                      }}
                    />
                    <input
                      className="px-4 py-3 rounded-xl outline-none text-white"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                      placeholder="CVV"
                      maxLength={3}
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    />
                  </div>
                </div>

                <button onClick={handlePaySubmit}
                  className="neon-btn w-full py-3 mt-5 text-white font-bold text-lg">
                  Pay ₹{(student?.room?.price || 5000).toLocaleString()} →
                </button>

                <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  🔒 Secured by 256-bit SSL encryption
                </p>
              </>
            )}

            {/* Step 2 — Processing */}
            {payStep === 2 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6"
                  style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
                <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
                <p style={{ color: 'var(--text-muted)' }}>Please wait, do not close this window</p>
              </div>
            )}

            {/* Step 3 — Success */}
            {payStep === 3 && (
              <div className="text-center py-10">
                <div className="text-7xl mb-4 animate-bounce">✅</div>
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#22c55e' }}>
                  Payment Successful!
                </h2>
                <p className="mb-1" style={{ color: 'var(--text-muted)' }}>
                  ₹{(student?.room?.price || 5000).toLocaleString()} paid successfully
                </p>
                <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                  Transaction ID: TXN{Date.now()}
                </p>
                <button onClick={() => setShowPayModal(false)}
                  className="neon-btn px-8 py-3 text-white font-bold">
                  Done 🎉
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}