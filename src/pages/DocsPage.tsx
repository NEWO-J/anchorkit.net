import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── Raw markdown imports ─────────────────────────────────────────────────────
// @ts-ignore
import introMd from '../docs/introduction.md?raw';
// @ts-ignore
import gettingStartedMd from '../docs/getting-started.md?raw';
// @ts-ignore
import sdkRefMd from '../docs/sdk-reference.md?raw';
// @ts-ignore
import verificationMd from '../docs/verification.md?raw';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocSection {
  id: string;
  title: string;
  content: string;
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
  sectionId: string;
}

// ─── Sections ────────────────────────────────────────────────────────────────

const SECTIONS: DocSection[] = [
  { id: 'introduction',    title: 'Introduction',    content: introMd },
  { id: 'getting-started', title: 'Getting Started', content: gettingStartedMd },
  { id: 'sdk-reference',   title: 'SDK Reference',   content: sdkRefMd },
  { id: 'verification',    title: 'Verification',    content: verificationMd },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseToc(sections: DocSection[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const section of sections) {
    const lines = section.content.split('\n');
    for (const line of lines) {
      const h2 = line.match(/^## (.+)/);
      const h3 = line.match(/^### (.+)/);
      if (h2) {
        entries.push({ level: 2, text: h2[1], id: slugify(h2[1]), sectionId: section.id });
      } else if (h3) {
        entries.push({ level: 3, text: h3[1], id: slugify(h3[1]), sectionId: section.id });
      }
    }
  }
  return entries;
}

const TOC = parseToc(SECTIONS);

// ─── Custom markdown renderers ────────────────────────────────────────────────

function headingRenderer(level: number) {
  return function Heading({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = typeof children === 'string' ? children : '';
    const id = slugify(text);
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const styles: Record<number, string> = {
      1: 'text-3xl font-bold text-white mt-12 mb-6 first:mt-0',
      2: 'text-xl font-semibold text-white mt-10 mb-4 scroll-mt-24',
      3: 'text-base font-semibold text-white/90 mt-6 mb-3 scroll-mt-24',
    };
    return <Tag id={id} className={styles[level] ?? ''} {...props}>{children}</Tag>;
  };
}

const mdComponents = {
  h1: headingRenderer(1),
  h2: headingRenderer(2),
  h3: headingRenderer(3),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-white/60 leading-relaxed mb-4 text-sm" {...props}>{children}</p>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} className="text-[#a89fff] hover:text-white underline underline-offset-2 transition-colors" {...props}>{children}</a>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={`block text-xs text-[#c8c4ff]/80 ${className ?? ''}`} {...props}>{children}</code>
      );
    }
    return (
      <code className="bg-white/[0.08] text-[#c8c4ff] text-xs px-1.5 py-0.5 rounded font-mono" {...props}>{children}</code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 overflow-x-auto mb-4 font-mono text-xs" {...props}>{children}</pre>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside pl-5 mb-4 space-y-1.5 text-white/60 text-sm" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside pl-5 mb-4 space-y-1.5 text-white/60 text-sm" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props}>{children}</li>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-white/[0.08] my-8" {...props} />
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-white font-semibold" {...props}>{children}</strong>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-white/[0.08]" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="text-left text-white/40 text-xs uppercase tracking-wide font-medium py-2 pr-6" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="text-white/60 py-2.5 pr-6 border-b border-white/[0.04] align-top" {...props}>{children}</td>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-[#a89fff]/40 pl-4 text-white/50 italic my-4" {...props}>{children}</blockquote>
  ),
};

// ─── TOC Sidebar ─────────────────────────────────────────────────────────────

function TocSidebar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <nav aria-label="Table of contents" className="w-56 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-always">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4 px-2">On this page</p>
        <ul className="space-y-0.5">
          {SECTIONS.map(section => {
            const sectionEntries = TOC.filter(t => t.sectionId === section.id);
            const sectionHeadingId = slugify(section.content.match(/^# (.+)/m)?.[1] ?? section.title);
            const isSectionActive = activeId === sectionHeadingId || sectionEntries.some(e => e.id === activeId);

            return (
              <li key={section.id}>
                {/* Section title (H1 level) */}
                <button
                  onClick={() => onSelect(sectionHeadingId)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                    activeId === sectionHeadingId
                      ? 'text-[#a89fff] bg-[#a89fff]/10'
                      : isSectionActive
                      ? 'text-white/80'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {section.title}
                </button>

                {/* Sub-headings */}
                {sectionEntries.length > 0 && (
                  <ul className="ml-2 mt-0.5 space-y-0.5">
                    {sectionEntries.map(entry => (
                      <li key={entry.id}>
                        <button
                          onClick={() => onSelect(entry.id)}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                            entry.level === 3 ? 'pl-4' : ''
                          } ${
                            activeId === entry.id
                              ? 'text-[#a89fff] bg-[#a89fff]/10'
                              : 'text-white/30 hover:text-white/60'
                          }`}
                        >
                          {entry.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

// ─── Mobile TOC toggle ────────────────────────────────────────────────────────

function MobileToc({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const activeEntry = TOC.find(t => t.id === activeId);
  const activeSection = SECTIONS.find(s =>
    s.id === activeEntry?.sectionId ||
    slugify(s.content.match(/^# (.+)/m)?.[1] ?? s.title) === activeId
  );
  const label = activeEntry?.text ?? activeSection?.title ?? 'On this page';

  return (
    <div className="lg:hidden sticky top-[4.5rem] z-30 bg-[#030028]/95 backdrop-blur-md border-b border-white/[0.08]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm text-white/60"
      >
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </svg>
          <span className="text-[#a89fff] truncate max-w-[200px]">{label}</span>
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-4 max-h-64 overflow-y-auto">
          {SECTIONS.map(section => {
            const sectionEntries = TOC.filter(t => t.sectionId === section.id);
            const sectionHeadingId = slugify(section.content.match(/^# (.+)/m)?.[1] ?? section.title);
            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => { onSelect(sectionHeadingId); setOpen(false); }}
                  className={`w-full text-left text-sm py-1.5 transition-colors ${
                    activeId === sectionHeadingId ? 'text-[#a89fff]' : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {section.title}
                </button>
                {sectionEntries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => { onSelect(entry.id); setOpen(false); }}
                    className={`w-full text-left text-xs py-1.5 transition-colors ${entry.level === 3 ? 'pl-4' : 'pl-2'} ${
                      activeId === entry.id ? 'text-[#a89fff]' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {entry.text}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = React.useState<string>('');

  // Collect all heading IDs we want to observe
  const allHeadingIds = React.useMemo(() => {
    const ids: string[] = [];
    for (const section of SECTIONS) {
      const h1Match = section.content.match(/^# (.+)/m);
      if (h1Match) ids.push(slugify(h1Match[1]));
    }
    for (const entry of TOC) {
      ids.push(entry.id);
    }
    return ids;
  }, []);

  // Scroll-spy via IntersectionObserver
  React.useEffect(() => {
    window.scrollTo(0, 0);

    const observers: IntersectionObserver[] = [];
    // Track which headings are currently visible
    const visibleSet = new Set<string>();

    const pick = () => {
      // Pick the topmost visible heading
      for (const id of allHeadingIds) {
        if (visibleSet.has(id)) {
          setActiveId(id);
          return;
        }
      }
    };

    for (const id of allHeadingIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSet.add(id);
          } else {
            visibleSet.delete(id);
          }
          pick();
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach(o => o.disconnect());
  }, [allHeadingIds]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile TOC */}
      <MobileToc activeId={activeId} onSelect={scrollTo} />

      <div className="max-w-[72rem] mx-auto px-6 lg:px-12 py-12 lg:py-16 flex gap-12">
        {/* Desktop TOC sidebar */}
        <div className="hidden lg:block">
          <TocSidebar activeId={activeId} onSelect={scrollTo} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {SECTIONS.map((section, i) => (
            <article
              key={section.id}
              className={i < SECTIONS.length - 1 ? 'pb-16 mb-16 border-b border-white/[0.08]' : 'pb-16'}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={mdComponents as never}
              >
                {section.content}
              </ReactMarkdown>
            </article>
          ))}
        </main>
      </div>
    </>
  );
}
