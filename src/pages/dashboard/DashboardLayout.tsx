import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, FileText, BarChart2, Code2, Bell, Settings,
  LucideIcon, ChevronRight, ChevronLeft, LogOut, Command, Search, Sun, Moon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE, getCsrfToken, clearAuthAndRedirect } from './utils';
import { ToastProvider } from './Toast';
import { NavVisCtx } from '../../app/NavContext';
import { CommandBar } from './CommandBar';

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

type TC = {
  bg: string; sidebarGrad: string; sidebarBorder: string; sidebarShadow: string;
  strip: string; stripHover: string; stripBorder: string; caret: string;
  textDim: string; textFaint: string; textLabel: string;
  border: string; borderMain: string; surface: string; surfaceHover: string; overlay: string;
  navInactive: string; navInactiveText: string; navActiveText: string;
  navHoverCls: string;
  mobileTitleColor: string; mobileBorder: string;
  searchBg: string; searchBgHover: string; searchBorder: string;
  searchText: string; searchIcon: string; searchKbdBg: string;
  searchKbdBorder: string; searchKbdText: string;
  sectionDiv: string; sectionLabel: string;
  collapseBtn: string; collapseBtnHover: string;
  logoutColor: string; themeIcon: string;
};

const DARK: TC = {
  bg: '#030028',
  sidebarGrad: 'linear-gradient(180deg, #020019 0%, #010010 100%)',
  sidebarBorder: '1px solid rgba(255,255,255,0.07)',
  sidebarShadow: '1px 0 0 rgba(255,255,255,0.025)',
  strip: '#030020', stripHover: '#05002d', stripBorder: 'rgba(255,255,255,0.055)',
  caret: 'rgba(255,255,255,0.22)',
  textDim: 'rgba(255,255,255,0.30)', textFaint: 'rgba(255,255,255,0.22)',
  textLabel: 'rgba(255,255,255,0.20)',
  border: 'rgba(255,255,255,0.06)', borderMain: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.03)', surfaceHover: 'rgba(255,255,255,0.055)',
  overlay: 'rgba(0,0,0,0.70)',
  navInactive: 'rgba(255,255,255,0.35)', navInactiveText: 'rgba(255,255,255,0.40)',
  navActiveText: 'rgba(255,255,255,0.90)', navHoverCls: 'hover:bg-white/[0.045]',
  mobileTitleColor: 'rgba(255,255,255,0.50)', mobileBorder: 'rgba(255,255,255,0.07)',
  searchBg: 'rgba(255,255,255,0.03)', searchBgHover: 'rgba(255,255,255,0.055)',
  searchBorder: 'rgba(255,255,255,0.07)', searchText: 'rgba(255,255,255,0.25)',
  searchIcon: 'rgba(255,255,255,0.28)', searchKbdBg: 'rgba(255,255,255,0.05)',
  searchKbdBorder: 'rgba(255,255,255,0.07)', searchKbdText: 'rgba(255,255,255,0.16)',
  sectionDiv: 'rgba(255,255,255,0.06)', sectionLabel: 'rgba(255,255,255,0.20)',
  collapseBtn: 'rgba(255,255,255,0.22)', collapseBtnHover: 'rgba(255,255,255,0.50)',
  logoutColor: 'rgba(255,255,255,0.40)', themeIcon: 'rgba(255,255,255,0.35)',
};

const LIGHT: TC = {
  bg: '#f5f5f5',
  sidebarGrad: 'linear-gradient(180deg, #3c3c3c 0%, #383838 100%)',
  sidebarBorder: '1px solid rgba(255,255,255,0.07)',
  sidebarShadow: '1px 0 0 rgba(255,255,255,0.025)',
  strip: '#cccccc', stripHover: '#d4d4d4', stripBorder: 'rgba(0,0,0,0.08)',
  caret: 'rgba(0,0,0,0.55)',
  textDim: 'rgba(255,255,255,0.35)', textFaint: 'rgba(255,255,255,0.22)',
  textLabel: 'rgba(255,255,255,0.20)',
  border: 'rgba(255,255,255,0.06)', borderMain: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.03)', surfaceHover: 'rgba(255,255,255,0.055)',
  overlay: 'rgba(0,0,0,0.28)',
  navInactive: 'rgba(255,255,255,0.35)', navInactiveText: 'rgba(255,255,255,0.40)',
  navActiveText: 'rgba(255,255,255,0.90)', navHoverCls: 'hover:bg-white/[0.045]',
  mobileTitleColor: 'rgba(0,0,0,0.50)', mobileBorder: 'rgba(0,0,0,0.10)',
  searchBg: 'rgba(255,255,255,0.03)', searchBgHover: 'rgba(255,255,255,0.055)',
  searchBorder: 'rgba(255,255,255,0.07)', searchText: 'rgba(255,255,255,0.25)',
  searchIcon: 'rgba(255,255,255,0.28)', searchKbdBg: 'rgba(255,255,255,0.05)',
  searchKbdBorder: 'rgba(255,255,255,0.07)', searchKbdText: 'rgba(255,255,255,0.16)',
  sectionDiv: 'rgba(255,255,255,0.06)', sectionLabel: 'rgba(255,255,255,0.20)',
  collapseBtn: 'rgba(255,255,255,0.22)', collapseBtnHover: 'rgba(255,255,255,0.50)',
  logoutColor: 'rgba(255,255,255,0.40)', themeIcon: 'rgba(255,255,255,0.35)',
};

function NavList({ onNavigate, collapsed, C }: { onNavigate?: () => void; collapsed: boolean; C: TC }) {
  const { t } = useTranslation();
  return (
    <div style={{ paddingTop: 8 }}>
      {NAV_DEFS.map((item, i) => {
        if ('section' in item) {
          return collapsed ? (
            <div key={i} style={{ margin: '10px auto', width: 20, height: 1, background: C.sectionDiv }} />
          ) : (
            <p key={i} style={{
              padding: `${i === 0 ? 10 : 20}px 16px 6px`,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 9, fontWeight: 600,
              color: C.sectionLabel,
              textTransform: 'uppercase', letterSpacing: '0.14em',
            }}>{item.section}</p>
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
              `flex items-center transition-all duration-150 cursor-pointer
               ${collapsed
                 ? 'justify-center w-10 h-10 my-0.5 mx-auto'
                 : 'gap-2.5 mx-2 px-3 py-[9px] mb-0.5'
               }
               font-['DM_Sans',sans-serif] text-sm font-medium
               ${!isActive ? C.navHoverCls : ''}`
            }
            style={({ isActive }) => isActive ? {
              background: collapsed ? 'rgba(255,118,8,0.11)' : 'rgba(255,118,8,0.09)',
              boxShadow: collapsed ? 'none' : 'inset 0 0 0 1px rgba(255,118,8,0.14)',
            } : {}}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={collapsed ? 15 : 14}
                  strokeWidth={isActive ? 2 : 1.75}
                  style={{
                    flexShrink: 0,
                    color: isActive ? 'rgba(255,118,8,0.80)' : C.navInactive,
                    transition: 'color 140ms ease',
                  }}
                />
                {!collapsed && (
                  <span style={{
                    color: isActive ? C.navActiveText : C.navInactiveText,
                    transition: 'color 140ms ease',
                  }}>
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </div>
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
  const [isDark, setIsDark] = React.useState(() =>
    localStorage.getItem('ak_dash_theme') !== 'light'
  );
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const email = localStorage.getItem('ak_email') ?? '';
  const { topNavOpen, toggleTopNav } = React.useContext(NavVisCtx);
  const headerH = topNavOpen ? 88 : 0;

  const C = isDark ? DARK : LIGHT;

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ak_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('ak_dash_theme', next ? 'dark' : 'light');
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

  React.useEffect(() => {
    document.documentElement.setAttribute('data-dash-theme', isDark ? 'dark' : 'light');
    return () => document.documentElement.removeAttribute('data-dash-theme');
  }, [isDark]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const currentPageKey = NAV_DEFS
    .filter((item): item is NavItem => 'key' in item)
    .find(item => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))
    ?.key;
  const currentPage = currentPageKey ? t(currentPageKey) : 'Dashboard';
  const sidebarW = collapsed ? 56 : 220;

  const renderSidebarContent = (mobile: boolean) => {
    const isCollapsed = collapsed && !mobile;
    return (
      <>
        {/* Header: email + toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', flexShrink: 0,
          gap: isCollapsed ? 0 : 10,
          padding: isCollapsed ? '12px 0' : '11px 12px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderBottom: `1px solid ${C.border}`,
        }}>
          {!isCollapsed && (
            <>
              {email && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  color: C.textDim,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, minWidth: 0,
                }}>{email}</p>
              )}
              <button
                onClick={mobile ? () => setMobileMenuOpen(false) : toggleCollapsed}
                title={mobile ? t('navbar.closeMenu') : t('navbar.collapseSidebar')}
                style={{
                  flexShrink: 0, padding: 4, borderRadius: 6, lineHeight: 0,
                  color: C.collapseBtn, cursor: 'pointer',
                  background: 'transparent', border: 'none',
                  transition: 'color 140ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.collapseBtnHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.collapseBtn; }}
              >
                {mobile
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <ChevronLeft size={12} strokeWidth={2} />
                }
              </button>
            </>
          )}

          {isCollapsed && (
            <button
              onClick={toggleCollapsed}
              title={t('navbar.expandSidebar')}
              style={{
                padding: 4, borderRadius: 6, lineHeight: 0,
                color: C.collapseBtn, cursor: 'pointer',
                background: 'transparent', border: 'none',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.collapseBtnHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.collapseBtn; }}
            >
              <ChevronRight size={12} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* CMD+K search trigger */}
        {!isCollapsed && (
          <div style={{ padding: '10px 10px 2px' }}>
            <button
              onClick={() => { setCmdOpen(true); if (mobile) setMobileMenuOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 0, cursor: 'pointer',
                background: C.searchBg,
                border: `1px solid ${C.searchBorder}`,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.searchBgHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.searchBg; }}
            >
              <Command size={11} strokeWidth={2} style={{ color: C.searchIcon, flexShrink: 0 }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: C.searchText, flex: 1, textAlign: 'left',
              }}>Search…</span>
              <kbd style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                color: C.searchKbdText,
                background: C.searchKbdBg,
                border: `1px solid ${C.searchKbdBorder}`,
                borderRadius: 4, padding: '1px 5px', flexShrink: 0,
              }}>⌘K</kbd>
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 8 }} className="hc-scroll">
          <NavList
            collapsed={isCollapsed}
            C={C}
            onNavigate={mobile ? () => setMobileMenuOpen(false) : undefined}
          />
        </nav>

        {/* Footer: theme toggle + logout */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: 8, flexShrink: 0 }}>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: isCollapsed ? 0 : 8,
              padding: isCollapsed ? '8px 0' : '8px 10px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: 0, cursor: 'pointer',
              background: 'transparent', border: 'none',
              color: C.themeIcon,
              transition: 'all 150ms ease',
              marginBottom: 2,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = C.surface;
              el.style.color = C.navInactiveText;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'transparent';
              el.style.color = C.themeIcon;
            }}
          >
            {isDark
              ? <Sun size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              : <Moon size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            }
            {!isCollapsed && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500 }}>
                {isDark ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: isCollapsed ? 0 : 8,
              padding: isCollapsed ? '8px 0' : '8px 10px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: 0, cursor: 'pointer',
              background: 'transparent', border: 'none',
              color: C.logoutColor,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'rgba(251,113,133,0.07)';
              el.style.color = 'rgba(251,113,133,0.62)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'transparent';
              el.style.color = C.logoutColor;
            }}
          >
            <LogOut size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500 }}>
                Logout
              </span>
            )}
          </button>
        </div>
      </>
    );
  };

  return (
    <ToastProvider>
      <div data-dash-theme={isDark ? 'dark' : 'light'}>
        <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} isDark={isDark} />

        {/* Thin nav toggle strip */}
        <div
          onClick={toggleTopNav}
          title={topNavOpen ? t('navbar.collapseNav') : t('navbar.expandNav')}
          style={{
            position: 'sticky', top: headerH, height: 24, zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: C.strip,
            borderBottom: `1px solid ${C.stripBorder}`,
            cursor: 'pointer',
            transition: 'top 220ms ease, background 120ms ease, opacity 180ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = C.stripHover; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = C.strip; }}
        >
          {topNavOpen
            ? <svg width="13" height="6" viewBox="0 0 13 6" fill="none" stroke={C.caret} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,5 6.5,1 12,5"/></svg>
            : <svg width="13" height="6" viewBox="0 0 13 6" fill="none" stroke={C.caret} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,1 6.5,5 12,1"/></svg>
          }
        </div>

        <div style={{ display: 'flex', background: C.bg, minHeight: `calc(100vh - ${headerH + 24}px)`, transition: 'min-height 220ms ease, background-color 250ms ease' }}>

          {/* Desktop sidebar */}
          <aside
            className="hidden md:flex flex-col hc-scroll"
            style={{
              position: 'sticky',
              top: headerH + 24,
              height: `calc(100vh - ${headerH + 24}px)`,
              width: sidebarW,
              overflowY: 'auto', overflowX: 'hidden',
              flexShrink: 0,
              background: C.sidebarGrad,
              borderRight: C.sidebarBorder,
              boxShadow: C.sidebarShadow,
              transition: `top 220ms ease, height 220ms ease, width 200ms var(--ak-ease-layout, cubic-bezier(0.4,0,0.2,1)), background-color 250ms ease`,
            }}
          >
            {renderSidebarContent(false)}
          </aside>

          {/* Mobile drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-40" style={{ top: headerH + 24 }}>
              <div
                className="absolute inset-0"
                style={{ background: C.overlay, backdropFilter: 'blur(5px)' }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside
                className="absolute left-0 top-0 bottom-0 flex flex-col"
                style={{
                  width: 240,
                  background: C.sidebarGrad,
                  borderRight: C.sidebarBorder,
                  boxShadow: '4px 0 32px rgba(0,0,0,0.50)',
                }}
              >
                {renderSidebarContent(true)}
              </aside>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0 dashboard-scroll">
            {/* Mobile top bar */}
            <div
              className="md:hidden sticky z-20 flex items-center justify-between px-4"
              style={{
                top: headerH + 24, height: 48,
                background: C.bg,
                borderBottom: `1px solid ${C.mobileBorder}`,
                transition: 'top 220ms ease, background-color 250ms ease, border-color 250ms ease',
              }}
            >
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                color: C.mobileTitleColor,
              }}>{currentPage}</span>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: -8 }}>
                <button
                  onClick={() => setCmdOpen(true)}
                  style={{ padding: 8, color: C.searchIcon, cursor: 'pointer', background: 'none', border: 'none', lineHeight: 0 }}
                  title="Search (⌘K)"
                >
                  <Search size={15} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ padding: 8, color: C.navInactiveText, cursor: 'pointer', background: 'none', border: 'none', lineHeight: 0 }}
                  aria-label={t('navbar.openMenu')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
