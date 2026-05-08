import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, FileText, BarChart2, Code2, Bell, Settings, LucideIcon, ChevronRight, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE, getCsrfToken, clearAuthAndRedirect } from './utils';
import { ToastProvider } from './Toast';
import { NavVisCtx } from '../../app/NavContext';

type NavItem = { key: string; path: string; end?: boolean; icon: LucideIcon };
type NavSection = { section: string };
type NavDef = NavItem | NavSection;

const NAV_DEFS: NavDef[] = [
  { section: 'ANALYTICS' },
  { key: 'nav.overview',      path: '/dashboard',              end: true, icon: LayoutDashboard },
  { key: 'nav.submissions',   path: '/dashboard/submissions',             icon: FileText },
  { key: 'nav.usage',         path: '/dashboard/usage',                   icon: BarChart2 },
  { section: 'DEVELOPER' },
  { key: 'nav.developers',    path: '/dashboard/developers',              icon: Code2 },
  { key: 'nav.notifications', path: '/dashboard/notifications',           icon: Bell },
  { section: 'ACCOUNT' },
  { key: 'nav.settings',      path: '/dashboard/account/settings',        icon: Settings },
];

function NavList({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      {NAV_DEFS.map((item, i) => {
        if ('section' in item) {
          return collapsed ? null : (
            <p key={i} className={`px-4 ${i === 0 ? 'pt-3' : 'pt-4'} pb-1 font-['DM_Sans',sans-serif] text-[9px] font-semibold text-white/25 uppercase tracking-[0.12em]`}>
              {item.section}
            </p>
          );
        }
        const Icon = item.icon;
        const label = t(item.key);
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center transition-colors border-l-2
               ${collapsed ? 'justify-center py-3 px-0' : 'gap-2.5 px-4 py-2.5'}
               text-sm font-['DM_Sans',sans-serif] font-medium
               ${isActive
                 ? 'text-white bg-white/[0.06] border-[#ff7608] [box-shadow:inset_3px_0_12px_rgba(255,118,8,0.12)]'
                 : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03] border-transparent'
               }`
            }
          >
            <Icon size={collapsed ? 16 : 14} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && label}
          </NavLink>
        );
      })}
    </>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() =>
    localStorage.getItem('ak_sidebar_collapsed') === 'true'
  );
  const email = localStorage.getItem('ak_email') ?? '';
  const { topNavOpen, toggleTopNav } = React.useContext(NavVisCtx);
  const headerH = topNavOpen ? 88 : 0;

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ak_sidebar_collapsed', String(next));
      return next;
    });
  };

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

  const currentPageKey = NAV_DEFS.filter((item): item is NavItem => 'key' in item).find(item =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  )?.key;
  const currentPage = currentPageKey ? t(currentPageKey) : 'Dashboard';

  return (
    <ToastProvider>
      {/* Thin nav toggle strip */}
      <div
        className="flex items-center justify-center cursor-pointer bg-[#03001f] border-b border-white/[0.06] hover:bg-[#040026] transition-colors"
        style={{ position: 'sticky', top: headerH, height: 20, zIndex: 30 }}
        onClick={toggleTopNav}
        title={topNavOpen ? t('navbar.collapseNav') : t('navbar.expandNav')}
      >
        {topNavOpen
          ? <ChevronUp size={11} strokeWidth={2.5} className="text-white/20" />
          : <ChevronDown size={11} strokeWidth={2.5} className="text-white/20" />
        }
      </div>
      <div className="flex bg-[#030028]" style={{ minHeight: `calc(100vh - ${headerH + 20}px)` }}>

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex shrink-0 border-r border-white/[0.08] flex-col transition-all duration-200 overflow-hidden bg-[#020018]"
          style={{ position: 'sticky', top: headerH + 20, height: `calc(100vh - ${headerH + 20}px)`, overflowY: 'auto', width: collapsed ? '48px' : '200px' }}
        >
          {/* Toggle + email row */}
          <div className={`border-b border-white/[0.06] flex items-center ${collapsed ? 'justify-center py-3' : 'px-4 py-3 gap-2'}`}>
            {!collapsed && email && (
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 truncate flex-1">{email}</p>
            )}
            <button
              onClick={toggleCollapsed}
              title={collapsed ? t('navbar.expandSidebar') : t('navbar.collapseSidebar')}
              className="shrink-0 text-white/25 hover:text-white/55 transition-colors cursor-pointer p-0.5"
            >
              {collapsed
                ? <ChevronRight size={13} strokeWidth={2} />
                : <ChevronLeft size={13} strokeWidth={2} />
              }
            </button>
          </div>

          <nav className="flex-1 pb-2">
            <NavList collapsed={collapsed} />
          </nav>
        </aside>

        {/* Mobile drawer overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40" style={{ top: headerH + 20 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[220px] bg-[#020018] border-r border-white/[0.08] flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                {email && (
                  <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 truncate mr-2">{email}</p>
                )}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="shrink-0 text-white/30 hover:text-white/60 transition-colors cursor-pointer p-0.5"
                  aria-label={t('navbar.closeMenu')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 pb-2">
                <NavList collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile top nav bar */}
          <div className="md:hidden sticky z-20 border-b border-white/[0.08] px-4 bg-[#030028] flex items-center justify-between h-11" style={{ top: headerH + 20 }}>
            <span className="font-['DM_Sans',sans-serif] text-sm font-medium text-white/55">{currentPage}</span>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-white/35 hover:text-white/60 transition-colors cursor-pointer p-1"
              aria-label={t('navbar.openMenu')}
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
