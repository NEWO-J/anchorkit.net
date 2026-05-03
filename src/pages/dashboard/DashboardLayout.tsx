import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { API_BASE, getCsrfToken, clearAuthAndRedirect } from './utils';

const NAV: ({ label: string; path: string; end?: boolean } | null)[] = [
  { label: 'Overview',      path: '/dashboard', end: true },
  { label: 'Submissions',   path: '/dashboard/submissions' },
  { label: 'Usage',         path: '/dashboard/usage' },
  null,
  { label: 'Developers',    path: '/dashboard/developers' },
  { label: 'Notifications', path: '/dashboard/notifications' },
  null,
  { label: 'Settings',      path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const email = localStorage.getItem('ak_email') ?? '';

  const handleLogout = () => {
    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': getCsrfToken() },
    }).catch(() => {});
    clearAuthAndRedirect();
    navigate('/login');
  };

  return (
    <div className="flex border-t border-white/[0.08] bg-[#030028]" style={{ minHeight: 'calc(100vh - 88px)' }}>
      {/* Sidebar */}
      <aside
        className="w-[200px] shrink-0 border-r border-white/[0.08] flex flex-col"
        style={{ position: 'sticky', top: 88, height: 'calc(100vh - 88px)', overflowY: 'auto' }}
      >
        {email && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 truncate">{email}</p>
          </div>
        )}

        <nav className="flex-1 pb-2">
          {NAV.map((item, i) => {
            if (!item) return <div key={i} className="my-1 border-t border-white/[0.06]" />;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-sm font-['DM_Sans',sans-serif] font-medium transition-colors border-l-2
                   ${isActive
                     ? 'text-white bg-white/[0.06] border-[#ff7608]'
                     : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03] border-transparent'
                   }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-colors font-['DM_Sans',sans-serif] cursor-pointer"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
