import React from 'react';
import { useNavigate } from 'react-router';

const API_BASE = 'https://api.anchorkit.net';

export default function OAuthSuccessPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/keys`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) throw new Error('auth failed');
        const data = await res.json() as { email?: string };
        sessionStorage.setItem('ak_token', data.email ?? '1');
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/login?oauth_error=1', { replace: true });
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#030028] flex items-center justify-center">
      <p className="font-['DM_Sans',sans-serif] text-white/40 text-sm">Signing in…</p>
    </div>
  );
}
