import React from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
    __turnstileOnload?: () => void;
  }
}

const SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  appearance?: 'always' | 'execute';
}

export default function CaptchaWidget({ onVerify, onExpire, appearance = 'execute' }: CaptchaWidgetProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const renderWidget = () => {
      if (!mounted || !ref.current || !window.turnstile || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        appearance,
        callback: onVerify,
        'expired-callback': onExpire ?? (() => {}),
      });
    };

    // Register the onload callback before injecting the script
    window.__turnstileOnload = renderWidget;

    if (window.turnstile) {
      // Already loaded (cached on a previous page visit)
      renderWidget();
    } else if (!document.getElementById('cf-turnstile-script')) {
      const s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileOnload&render=explicit';
      s.async = true;
      document.head.appendChild(s);
    }

    // Polling fallback in case the onload callback is missed
    const timer = setInterval(() => {
      if (widgetId.current !== null) { clearInterval(timer); return; }
      renderWidget();
    }, 100);

    return () => {
      mounted = false;
      clearInterval(timer);
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="cf-turnstile-container mt-1 min-h-[65px]" />;
}
