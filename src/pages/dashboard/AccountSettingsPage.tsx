import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_BASE, mapApiError, getCsrfToken, clearAuthAndRedirect } from './utils';
import { useToast } from './Toast';
import dashboardBg from '../../assets/dashboard.png';
import { ConfirmModal } from './ConfirmModal';

const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-2.5 py-1.5
                  font-['DM_Sans',sans-serif] text-xs text-white/80 placeholder-white/20
                  focus:outline-none focus:border-white/20`;

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = React.useState<null | 'email' | 'password' | 'delete'>(null);
  const [emailNew, setEmailNew] = React.useState('');
  const [emailPassword, setEmailPassword] = React.useState('');
  const [pwCurrent, setPwCurrent] = React.useState('');
  const [pwNew, setPwNew] = React.useState('');
  const [pwConfirm, setPwConfirm] = React.useState('');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  const toggleForm = (form: 'email' | 'delete') => {
    setActiveForm(prev => prev === form ? null : form);
    setError('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (pwNew !== pwConfirm) { setError('New passwords do not match'); return; }
    if (pwNew.length < 12) { setError('Password must be at least 12 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account/password`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      const data = await res.json();
      if (!res.ok) { setError(mapApiError(res.status, data.detail)); return; }
      setPwCurrent(''); setPwNew(''); setPwConfirm(''); setActiveForm(null);
      showToast(t('settings.toast.passwordUpdated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally { setLoading(false); }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account/email`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: emailNew, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(mapApiError(res.status, data.detail)); return; }
      setEmailNew(''); setEmailPassword(''); setActiveForm(null);
      showToast(t('settings.toast.emailVerification'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally { setLoading(false); }
  };

  const doDeleteAccount = async () => {
    setShowDeleteModal(false);
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
        className="dash-page-header border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="dash-header-bg absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">{t('settings.title')}</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-xs text-white/40 uppercase tracking-wide">{t('settings.account')}</p>
      </div>

      {/* Update email */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => toggleForm('email')}
          className="w-full text-left px-6 py-4 font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          {t('settings.updateEmail')}
        </button>
        {activeForm === 'email' && (
          <form onSubmit={handleEmailChange} className="px-6 pb-5 space-y-2 max-w-xs">
            {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
            <input type="email" required placeholder={t('settings.emailPlaceholderNew')}
              value={emailNew} onChange={e => setEmailNew(e.target.value)} className={inputCls} />
            <input type="password" required placeholder={t('settings.emailPlaceholderPassword')}
              value={emailPassword} onChange={e => setEmailPassword(e.target.value)} className={inputCls} />
            <button type="submit" disabled={loading}
              className="w-full py-1.5 bg-white/[0.06] border border-white/[0.08] font-['DM_Sans',sans-serif] text-xs text-white/60 hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? t('settings.sending') : t('settings.sendVerification')}
            </button>
          </form>
        )}
      </div>

      {/* Change password */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => toggleForm('password')}
          className="w-full text-left px-6 py-4 font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          {t('settings.changePassword')}
        </button>
        {activeForm === 'password' && (
          <form onSubmit={handlePasswordChange} className="px-6 pb-5 space-y-2 max-w-xs">
            {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
            <input type="password" required placeholder={t('settings.passwordCurrent')}
              value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} className={inputCls} />
            <input type="password" required placeholder={t('settings.passwordNew')}
              value={pwNew} onChange={e => setPwNew(e.target.value)} className={inputCls} />
            <input type="password" required placeholder={t('settings.passwordConfirm')}
              value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} className={inputCls} />
            <button type="submit" disabled={loading}
              className="w-full py-1.5 bg-white/[0.06] border border-white/[0.08] font-['DM_Sans',sans-serif] text-xs text-white/60 hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? t('settings.updating') : t('settings.updatePassword')}
            </button>
          </form>
        )}
      </div>

      {/* Delete account */}
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => toggleForm('delete')}
          className="w-full text-left px-6 py-4 font-['DM_Sans',sans-serif] text-sm text-red-400/50 hover:text-red-400/80 hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          {t('settings.deleteAccount')}
        </button>
        {activeForm === 'delete' && (
          <form onSubmit={e => { e.preventDefault(); setShowDeleteModal(true); }} className="px-6 pb-5 space-y-2 max-w-xs">
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30">
              {t('settings.deleteWarning')}
            </p>
            {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>}
            <input type="password" required placeholder={t('settings.deletePasswordPlaceholder')}
              value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className={inputCls} />
            <button type="submit" disabled={loading}
              className="w-full py-1.5 bg-white/[0.04] border border-red-500/20 font-['DM_Sans',sans-serif] text-xs text-red-400/60 hover:text-red-400/90 hover:bg-red-500/[0.08] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? t('settings.deleting') : t('settings.deleteSubmit')}
            </button>
          </form>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title={t('settings.modal.deleteTitle')}
          body={t('settings.modal.deleteBody')}
          confirmLabel={t('settings.modal.deleteConfirm')}
          danger
          onConfirm={doDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
