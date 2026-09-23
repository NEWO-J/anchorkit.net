import React from 'react';

const API_HEALTH_URL = 'https://api.anchorkit.net/api/v1/anchors';

export default function ApiStatusBanner() {
  const [apiDown, setApiDown] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    fetch(API_HEALTH_URL, { signal: controller.signal })
      .then((r) => { if (!cancelled && r.status >= 500) setApiDown(true); })
      .catch(() => { if (!cancelled) setApiDown(true); })
      .finally(() => clearTimeout(timeout));
    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  }, []);

  if (!apiDown) return null;

  return (
    <div
      role="status"
      className="w-full border-b border-white/[0.08] px-8 sm:px-16 py-3 text-center font-['DM_Sans',sans-serif] text-sm text-white/80"
      style={{ background: 'rgba(174,167,255,0.12)' }}
    >
      The AnchorKit API was taken down in August 2026. Testing is complete, and I'm currently figuring out what to do with the project.
    </div>
  );
}
