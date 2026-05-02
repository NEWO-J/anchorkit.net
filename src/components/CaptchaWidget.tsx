import React from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function CaptchaWidget({ onVerify, onExpire }: CaptchaWidgetProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!document.getElementById('cf-turnstile-script')) {
      const s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      document.head.appendChild(s);
    }

    // Poll every 50ms until window.turnstile is ready, then render once.
    const timer = setInterval(() => {
      if (!window.turnstile || !ref.current || widgetId.current !== null) return;
      clearInterval(timer);
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: onVerify,
        'expired-callback': onExpire ?? (() => {}),
      });
    }, 50);

    return () => {
      clearInterval(timer);
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="mt-1" />;
}
