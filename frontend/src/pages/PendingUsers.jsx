import React, { useState, useEffect, useCallback } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '../api/authApi';
import { Clock, CheckCircle, XCircle, User, Phone, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  CASHIER:          'bg-blue-900/30 text-blue-300 border-blue-500/30',
  STORE_MANAGER:    'bg-purple-900/30 text-purple-300 border-purple-500/30',
  INVENTORY_CLERK:  'bg-amber-900/30 text-amber-300 border-amber-500/30',
  BUSINESS_ANALYST: 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30',
  ADMIN:            'bg-red-900/30 text-red-300 border-red-500/30',
};

export default function PendingUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [processing, setProc]   = useState(null); // id being processed
  const [rejectModal, setRejectModal] = useState(null); // { id, username }
  const [reason, setReason]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingUsers();
      setUsers(res.data || []);
    } catch { toast.error('Failed to load pending users'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, username) => {
    setProc(id);
    try {
      await approveUser(id);
      toast.success(`✅ ${username} approved and can now login`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { toast.error('Failed to approve user'); }
    finally  { setProc(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProc(rejectModal.id);
    try {
      await rejectUser(rejectModal.id, reason || 'Rejected by admin');
      toast.success(`❌ ${rejectModal.username} rejected`);
      setUsers(prev => prev.filter(u => u.id !== rejectModal.id));
      setRejectModal(null);
      setReason('');
    } catch { toast.error('Failed to reject user'); }
    finally  { setProc(null); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Approvals</h1>
          <p className="page-subtitle">Review and approve new account registrations</p>
        </div>
        <button onClick={load} className="btn-secondary gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-16 h-16 text-emerald-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No Pending Requests</h3>
          <p className="text-gray-600 text-sm mt-1">All registration requests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="card hover:border-primary-500/30 transition-colors">
              <div className="card-body flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-300 font-bold text-lg">
                    {u.username?.[0]?.toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{u.username}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.CASHIER}`}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {u.mobileNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {u.mobileNumber}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(u.id, u.username)}
                    disabled={processing === u.id}
                    className="btn-success px-4 py-2 text-sm"
                  >
                    {processing === u.id
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => { setRejectModal({ id: u.id, username: u.username }); setReason(''); }}
                    disabled={processing === u.id}
                    className="btn-danger px-4 py-2 text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setRejectModal(null); }}>
          <div className="card w-full max-w-sm animate-fade-in" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-600/20"><XCircle className="w-5 h-5 text-red-400" /></div>
                <div>
                  <h3 className="font-bold text-white">Reject Registration</h3>
                  <p className="text-xs text-gray-500">User: {rejectModal.username}</p>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Reason (optional)</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Invalid information, duplicate account…"
                  rows={3} className="input resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={handleReject} disabled={processing === rejectModal.id}
                  className="btn-danger flex-1 justify-center">
                  {processing === rejectModal.id
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
