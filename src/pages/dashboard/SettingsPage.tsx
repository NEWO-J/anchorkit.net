import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, mapApiError, getCsrfToken, clearAuthAndRedirect } from './utils';

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
    setError('');
    setSuccess('');
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account/email`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: emailNew, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(mapApiError(res.status, data.detail)); return; }
      setSuccess('Check your new inbox — click the verification link to confirm the change.');
      setEmailNew('');
      setEmailPassword('');
      setActiveForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!confirm('This is permanent. Your account and API key will be deleted immediately. Continue?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account`, {
        method: 'DELETE',
        credentials: 'include',
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
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white">Settings</h1>
        <p className="font-['DM_Sans',sans-serif] text-sm text-white/30 mt-1">Manage your account details.</p>
      </div>

      {success && <p className="text-green-400/80 font-['DM_Sans',sans-serif] text-sm mb-5">{success}</p>}

      <div className="border border-white/[0.08] rounded-[8px] overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/70">Account</p>
        </div>

        {/* Update email */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <button onClick={() => toggleForm('email')}
            className="font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 transition-colors cursor-pointer">
            Update email address
          </button>
          {activeForm === 'email' && (
            <form onSubmit={handleEmailChange} className="mt-3 space-y-2">
              {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
              <input type="email" required placeholder="New email address"
                value={emailNew} onChange={e => setEmailNew(e.target.value)} className={inputCls} />
              <input type="password" required placeholder="Current password to confirm"
                value={emailPassword} onChange={e => setEmailPassword(e.target.value)} className={inputCls} />
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08] font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Sending…' : 'Send verification email'}
              </button>
            </form>
          )}
        </div>

        {/* Delete account */}
        <div className="px-5 py-4">
          <button onClick={() => toggleForm('delete')}
            className="font-['DM_Sans',sans-serif] text-sm text-red-400/50 hover:text-red-400/80 transition-colors cursor-pointer">
            Delete account
          </button>
          {activeForm === 'delete' && (
            <form onSubmit={handleDeleteAccount} className="mt-3 space-y-2">
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/30">
                This permanently deletes your account and revokes your API key. This cannot be undone.
              </p>
              {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
              <input type="password" required placeholder="Enter your password to confirm"
                value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className={inputCls} />
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-[6px] bg-white/[0.04] border border-red-500/20 font-['DM_Sans',sans-serif] text-sm text-red-400/60 hover:text-red-400/90 hover:bg-red-500/[0.08] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Deleting…' : 'Permanently delete my account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
