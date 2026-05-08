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

export function CommandBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const [cursor, setCursor] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
          background: 'rgba(3,0,38,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          boxShadow: '0 32px 64px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Search input row */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: 52, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={15} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.28)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              color: 'rgba(255,255,255,0.85)',
            }}
            className="placeholder-white/20"
          />
          <kbd style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: 'rgba(255,255,255,0.20)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 4, padding: '2px 6px', flexShrink: 0,
          }}>ESC</kbd>
        </div>

        {/* Result list */}
        <div className="py-1.5" style={{ maxHeight: 340, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: 'rgba(255,255,255,0.25)', padding: '12px 16px',
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
                  background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  cursor: 'pointer', border: 'none', textAlign: 'left',
                  transition: 'background 100ms ease',
                }}
              >
                <div style={{
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, flexShrink: 0,
                  background: active ? 'rgba(255,118,8,0.13)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? 'rgba(255,118,8,0.22)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 120ms ease',
                }}>
                  <ItemIcon
                    size={13} strokeWidth={2}
                    color={active ? 'rgba(255,118,8,0.82)' : 'rgba(255,255,255,0.30)'}
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: 'rgba(255,255,255,0.84)', lineHeight: '1.2', marginBottom: 2,
                  }}>{item.label}</p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                    color: 'rgba(255,255,255,0.30)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.sub}</p>
                </div>
                {active && (
                  <kbd style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: 'rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
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
          style={{ height: 36, borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-1">
            <Command size={10} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.18)' }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>K</span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.20)' }}>toggle</span>
          <span style={{ color: 'rgba(255,255,255,0.10)', fontSize: 12 }}>·</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.20)' }}>↑↓ navigate</span>
          <span style={{ color: 'rgba(255,255,255,0.10)', fontSize: 12 }}>·</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.20)' }}>↵ select</span>
        </div>
      </div>
    </div>
  );
}
