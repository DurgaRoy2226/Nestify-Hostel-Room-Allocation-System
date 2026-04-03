import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: "", course: "" });
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      if (user?.role === 'admin') {
        setProfileData({ ...user });
        setLoading(false);
        return;
      }
      const res = await axios.get("http://localhost:5000/api/students/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
      setFormData({ 
        phone: res.data.phone || "", 
        course: res.data.course || "" 
      });
    } catch (e) {
      console.error("Profile error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put("http://localhost:5000/api/students/me", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
      setIsEditing(false);
      alert("Profile updated successfully! ✅");
    } catch (e) {
      alert("Failed to update profile. " + (e.response?.data?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="app-bg min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#ff8a00', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="app-bg p-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold"
            style={{ background: 'linear-gradient(135deg, #ffb703, #ff5f6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            👤 My Profile
          </h1>
          {user?.role === 'student' && !isEditing && (
            <button onClick={() => setIsEditing(true)} 
              className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/10" 
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-8 fade-in relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" 
               style={{ background: 'radial-gradient(circle, rgba(255,138,0,0.15) 0%, transparent 70%)' }}></div>
               
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl flex-shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,183,3,0.2), rgba(255,95,109,0.2))',
                border: '2px solid rgba(255,183,3,0.5)',
                boxShadow: '0 0 20px rgba(255,138,0,0.2)'
              }}>
              {profileData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Basic Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{profileData?.name}</h2>
                <span className="px-3 py-1 text-xs font-semibold rounded-full"
                  style={{
                    background: user?.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    color: user?.role === 'admin' ? '#ef4444' : '#22c55e',
                    border: `1px solid ${user?.role === 'admin' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`
                  }}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>{profileData?.email}</p>
              
              {user?.role !== 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  
                  {/* Phone Field */}
                  <div className="sm:col-span-2 md:col-span-1">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Phone Number</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg outline-none text-white text-lg bg-black/20 focus:bg-black/40 border transition"
                        style={{ borderColor: 'rgba(255,138,0,0.4)', boxShadow: '0 0 10px rgba(255,138,0,0.1)' }}
                        placeholder="Enter phone number" 
                      />
                    ) : (
                      <p className="font-semibold text-lg">{profileData?.phone || 'Not Specified'}</p>
                    )}
                  </div>

                  {/* Course Field */}
                  <div className="sm:col-span-2 md:col-span-1">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Course</p>
                    {isEditing ? (
                       <input 
                        type="text"
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg outline-none text-white text-lg bg-black/20 focus:bg-black/40 border transition"
                        style={{ borderColor: 'rgba(255,138,0,0.4)', boxShadow: '0 0 10px rgba(255,138,0,0.1)' }}
                        placeholder="Enter your course" 
                      />
                    ) : (
                      <p className="font-semibold text-lg">{profileData?.course || 'Not Specified'}</p>
                    )}
                  </div>

                  {/* Static Fields */}
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Join Date</p>
                    <p className="font-semibold text-lg">
                      {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Assigned Room</p>
                    <p className="font-semibold text-lg">
                      {profileData?.room ? `${profileData.room.roomNumber} (${profileData.room.type})` : 'Not Assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Fees Status</p>
                    <p className="font-semibold text-lg flex items-center gap-2">
                       {profileData?.feesStatus === 'paid' ? '✅ Paid' : '⚠️ Pending'}
                    </p>
                  </div>

                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="neon-btn px-6 py-2 text-white font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ phone: profileData?.phone || "", course: profileData?.course || "" });
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-semibold transition hover:bg-white/10" 
                    style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
