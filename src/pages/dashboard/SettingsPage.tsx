import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, mapApiError, getCsrfToken, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                  font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                  focus:outline-none focus:border-white/20`;

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = React.useState<null | 'email' | 'delete'>(null);
  const [emailNew, setEmailNew] = React.useState('');
  const [emailPassword, setEmailPassword] = React.useState('');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  const toggleForm = (form: 'email' | 'delete') => {
    setActiveForm(prev => prev === form ? null : form);
    setError(''); setSuccess('');
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account/email`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: emailNew, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(mapApiError(res.status, data.detail)); return; }
      setSuccess('Check your new inbox — click the verification link to confirm the change.');
      setEmailNew(''); setEmailPassword(''); setActiveForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!confirm('This is permanent. Your account and API key will be deleted immediately. Continue?')) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account`, {
        method: 'DELETE', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(mapApiError(res.status, data.detail)); setLoading(false); return; }
      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Settings</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Manage your account details</p>
        </div>
      </div>

      {success && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="text-green-400/80 font-['DM_Sans',sans-serif] text-sm">{success}</p>
        </div>
      )}

      <div className="border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-xs text-white/40 uppercase tracking-wide">Account</p>
      </div>

      {/* Update email */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => toggleForm('email')}
          className="w-full text-left px-6 py-4 font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          Update email address
        </button>
        {activeForm === 'email' && (
          <form onSubmit={handleEmailChange} className="px-6 pb-5 space-y-2">
            {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
            <input type="email" required placeholder="New email address"
              value={emailNew} onChange={e => setEmailNew(e.target.value)} className={inputCls} />
            <input type="password" required placeholder="Current password to confirm"
              value={emailPassword} onChange={e => setEmailPassword(e.target.value)} className={inputCls} />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-white/[0.06] border border-white/[0.08] font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Sending…' : 'Send verification email'}
            </button>
          </form>
        )}
      </div>

      {/* Change password */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => navigate('/forgot-password')}
          className="w-full text-left px-6 py-4 font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          Change password
        </button>
      </div>

      {/* Delete account */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => toggleForm('delete')}
          className="w-full text-left px-6 py-4 font-['DM_Sans',sans-serif] text-sm text-red-400/50 hover:text-red-400/80 hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          Delete account
        </button>
        {activeForm === 'delete' && (
          <form onSubmit={handleDeleteAccount} className="px-6 pb-5 space-y-2">
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30">
              This permanently deletes your account and revokes your API key. This cannot be undone.
            </p>
            {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
            <input type="password" required placeholder="Enter your password to confirm"
              value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className={inputCls} />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-white/[0.04] border border-red-500/20 font-['DM_Sans',sans-serif] text-sm text-red-400/60 hover:text-red-400/90 hover:bg-red-500/[0.08] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Deleting…' : 'Permanently delete my account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
