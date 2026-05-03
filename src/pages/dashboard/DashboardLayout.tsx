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
    <div className="flex bg-[#030028]">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto border-r border-white/[0.08] flex flex-col">
        {email && (
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 truncate">{email}</p>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item, i) => {
            if (!item) return <div key={i} className="my-2 border-t border-white/[0.06]" />;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-[6px] text-sm font-['DM_Sans',sans-serif] font-medium transition-colors
                   ${isActive
                     ? 'text-white bg-white/[0.06] border-l-[2px] border-[#ff7608] pl-[10px]'
                     : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border-l-[2px] border-transparent pl-[10px]'
                   }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-white/30 hover:text-white/60 transition-colors font-['DM_Sans',sans-serif] cursor-pointer"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 min-h-[calc(100vh-88px)] p-8">
        <Outlet />
      </main>
    </div>
  );
}
