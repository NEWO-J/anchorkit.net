import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FileText, BarChart2, Code2, Bell, Settings, Search, Command } from 'lucide-react';

type CmdAction = {
  id: string;
  label: string;
  sub: string;
  Icon: React.ElementType;
  path: string;
};

export function CommandBar({ open, onClose, isDark }: { open: boolean; onClose: () => void; isDark: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const [cursor, setCursor] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ct = isDark ? {
    panelBg: 'rgba(3,0,38,0.97)',
    panelBorder: 'rgba(255,255,255,0.12)',
    shadow: '0 32px 64px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)',
    divider: 'rgba(255,255,255,0.08)',
    dividerFaint: 'rgba(255,255,255,0.06)',
    searchIcon: 'rgba(255,255,255,0.28)',
    inputColor: 'rgba(255,255,255,0.85)',
    kbdBg: 'rgba(255,255,255,0.06)',
    kbdBorder: 'rgba(255,255,255,0.09)',
    kbdColor: 'rgba(255,255,255,0.20)',
    noResults: 'rgba(255,255,255,0.25)',
    activeItemBg: 'rgba(255,255,255,0.07)',
    iconBg: 'rgba(255,255,255,0.05)',
    iconBorder: 'rgba(255,255,255,0.07)',
    iconColor: 'rgba(255,255,255,0.30)',
    labelColor: 'rgba(255,255,255,0.84)',
    subColor: 'rgba(255,255,255,0.30)',
    footerIcon: 'rgba(255,255,255,0.18)',
    footerText: 'rgba(255,255,255,0.20)',
    footerDot: 'rgba(255,255,255,0.10)',
  } : {
    panelBg: 'rgba(248,248,248,0.98)',
    panelBorder: 'rgba(0,0,0,0.12)',
    shadow: '0 32px 64px rgba(0,0,0,0.12), inset 0 1px 0 rgba(0,0,0,0.04)',
    divider: 'rgba(0,0,0,0.09)',
    dividerFaint: 'rgba(0,0,0,0.08)',
    searchIcon: 'rgba(0,0,0,0.35)',
    inputColor: '#1a1a1a',
    kbdBg: 'rgba(0,0,0,0.05)',
    kbdBorder: 'rgba(0,0,0,0.09)',
    kbdColor: 'rgba(0,0,0,0.30)',
    noResults: 'rgba(0,0,0,0.35)',
    activeItemBg: 'rgba(0,0,0,0.05)',
    iconBg: 'rgba(0,0,0,0.05)',
    iconBorder: 'rgba(0,0,0,0.08)',
    iconColor: 'rgba(0,0,0,0.35)',
    labelColor: '#1a1a1a',
    subColor: 'rgba(0,0,0,0.35)',
    footerIcon: 'rgba(0,0,0,0.25)',
    footerText: 'rgba(0,0,0,0.30)',
    footerDot: 'rgba(0,0,0,0.15)',
  };

  const actions: CmdAction[] = React.useMemo(() => [
    { id: 'overview',      label: t('nav.overview'),      sub: 'Dashboard home & metrics',         Icon: LayoutDashboard, path: '/dashboard'                  },
    { id: 'submissions',   label: t('nav.submissions'),   sub: 'Browse hash submissions',          Icon: FileText,        path: '/dashboard/submissions'      },
    { id: 'usage',         label: t('nav.usage'),         sub: 'API quota and usage limits',       Icon: BarChart2,       path: '/dashboard/usage'            },
    { id: 'developers',    label: t('nav.developers'),    sub: 'API keys and webhook endpoints',   Icon: Code2,           path: '/dashboard/developers'       },
    { id: 'notifications', label: t('nav.notifications'), sub: 'Email notification preferences',  Icon: Bell,            path: '/dashboard/notifications'    },
    { id: 'settings',      label: t('nav.settings'),      sub: 'Email, password and security',    Icon: Settings,        path: '/dashboard/account/settings' },
  ], [t]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(a =>
      a.label.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)
    );
  }, [query, actions]);

  React.useEffect(() => { setCursor(0); }, [results.length]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const go = React.useCallback((item: CmdAction) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')    { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && results[cursor]) { go(results[cursor]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, cursor, go, onClose]);

  if (!open) return null;

  return (
    <div
      className="cmd-backdrop fixed inset-0 z-50 flex items-start justify-center px-4"
      style={{ paddingTop: 'clamp(72px, 14vh, 180px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="cmd-panel w-full overflow-hidden"
        style={{
          maxWidth: 560,
          background: ct.panelBg,
          border: `1px solid ${ct.panelBorder}`,
          borderRadius: 12,
          boxShadow: ct.shadow,
        }}
      >
        {/* Search input row */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: 52, borderBottom: `1px solid ${ct.divider}` }}
        >
          <Search size={15} strokeWidth={2} style={{ color: ct.searchIcon, flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'Geist', sans-serif", fontSize: 14,
              color: ct.inputColor,
            }}
            className="placeholder-white/20"
          />
          <kbd style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: ct.kbdColor,
            background: ct.kbdBg,
            border: `1px solid ${ct.kbdBorder}`,
            borderRadius: 4, padding: '2px 6px', flexShrink: 0,
          }}>ESC</kbd>
        </div>

        {/* Result list */}
        <div className="py-1.5" style={{ maxHeight: 340, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <p style={{
              fontFamily: "'Geist', sans-serif", fontSize: 13,
              color: ct.noResults, padding: '12px 16px',
            }}>
              No results for "{query}"
            </p>
          ) : results.map((item, i) => {
            const active = i === cursor;
            const ItemIcon = item.Icon;
            return (
              <button
                key={item.id}
                onMouseEnter={() => setCursor(i)}
                onMouseDown={() => go(item)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 16px',
                  background: active ? ct.activeItemBg : 'transparent',
                  cursor: 'pointer', border: 'none', textAlign: 'left',
                  transition: 'background 100ms ease',
                }}
              >
                <div style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, flexShrink: 0,
                  background: active ? 'rgba(255,118,8,0.13)' : ct.iconBg,
                  border: `1px solid ${active ? 'rgba(255,118,8,0.22)' : ct.iconBorder}`,
                  transition: 'all 120ms ease',
                }}>
                  <ItemIcon
                    size={13} strokeWidth={2}
                    color={active ? 'rgba(255,118,8,0.82)' : ct.iconColor}
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontFamily: "'Geist', sans-serif", fontSize: 13,
                    color: ct.labelColor, lineHeight: '1.2', marginBottom: 2,
                  }}>{item.label}</p>
                  <p style={{
                    fontFamily: "'Geist', sans-serif", fontSize: 11,
                    color: ct.subColor,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.sub}</p>
                </div>
                {active && (
                  <kbd style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: ct.kbdColor,
                    background: ct.kbdBg,
                    border: `1px solid ${ct.kbdBorder}`,
                    borderRadius: 4, padding: '2px 6px', flexShrink: 0,
                  }}>↵</kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center gap-2.5 px-4"
          style={{ height: 36, borderTop: `1px solid ${ct.dividerFaint}` }}
        >
          <div className="flex items-center gap-1">
            <Command size={10} strokeWidth={2} style={{ color: ct.footerIcon }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: ct.footerIcon }}>K</span>
          </div>
          <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 10, color: ct.footerText }}>toggle</span>
          <span style={{ color: ct.footerDot, fontSize: 12 }}>·</span>
          <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 10, color: ct.footerText }}>↑↓ navigate</span>
          <span style={{ color: ct.footerDot, fontSize: 12 }}>·</span>
          <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 10, color: ct.footerText }}>↵ select</span>
        </div>
      </div>
    </div>
  );
}
