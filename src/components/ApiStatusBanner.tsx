import React from 'react';

export const API_DOWN_MESSAGE = 'The AnchorKit API was taken down in August 2026. Testing is complete, and development is continuing privately.';

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
      className="relative z-40 w-full px-8 sm:px-16 py-3 text-center font-['DM_Sans',sans-serif] text-sm font-medium"
      style={{ background: 'rgba(250,204,21,0.5)', color: '#030028' }}
    >
      {API_DOWN_MESSAGE}
    </div>
  );
}
