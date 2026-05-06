import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, FileText, BarChart2, Code2, Bell, Settings, LucideIcon } from 'lucide-react';
import { API_BASE, getCsrfToken, clearAuthAndRedirect } from './utils';
import { ToastProvider } from './Toast';

const NAV: ({ label: string; path: string; end?: boolean; icon: LucideIcon } | null)[] = [
  { label: 'Overview',      path: '/dashboard',               end: true, icon: LayoutDashboard },
  { label: 'Submissions',   path: '/dashboard/submissions',              icon: FileText },
  { label: 'Usage',         path: '/dashboard/usage',                    icon: BarChart2 },
  null,
  { label: 'Developers',    path: '/dashboard/developers',               icon: Code2 },
  { label: 'Notifications', path: '/dashboard/notifications',            icon: Bell },
  null,
  { label: 'Settings',      path: '/dashboard/settings',                 icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item, i) => {
        if (!item) return <div key={i} className="my-1 border-t border-white/[0.06]" />;
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-2.5 text-sm font-['DM_Sans',sans-serif] font-medium transition-colors border-l-2
               ${isActive
                 ? 'text-white bg-white/[0.06] border-[#ff7608]'
                 : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03] border-transparent'
               }`
            }
          >
            <Icon size={14} strokeWidth={1.75} className="shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentPage = NAV.find(item =>
    item && (item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))
  )?.label ?? 'Dashboard';

  return (
    <ToastProvider>
      <div className="flex border-t border-white/[0.08] bg-[#030028]" style={{ minHeight: 'calc(100vh - 88px)' }}>

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex w-[200px] shrink-0 border-r border-white/[0.08] flex-col"
          style={{ position: 'sticky', top: 88, height: 'calc(100vh - 88px)', overflowY: 'auto' }}
        >
          {email && (
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 truncate">{email}</p>
            </div>
          )}
          <nav className="flex-1 pb-2">
            <NavList />
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

        {/* Mobile drawer overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40" style={{ top: 88 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[220px] bg-[#030028] border-r border-white/[0.08] flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                {email && (
                  <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 truncate mr-2">{email}</p>
                )}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="shrink-0 text-white/30 hover:text-white/60 transition-colors cursor-pointer p-0.5"
                  aria-label="Close menu"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 pb-2">
                <NavList onNavigate={() => setMobileMenuOpen(false)} />
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
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile top nav bar */}
          <div className="md:hidden sticky top-[88px] z-20 border-b border-white/[0.08] px-4 bg-[#030028] flex items-center justify-between h-11">
            <span className="font-['DM_Sans',sans-serif] text-sm font-medium text-white/55">{currentPage}</span>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white/35 hover:text-white/60 transition-colors cursor-pointer p-1"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
