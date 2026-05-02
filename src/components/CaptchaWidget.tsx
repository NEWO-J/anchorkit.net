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

// Module-level promise so the script is only injected once across all instances.
let scriptReady: Promise<void> | null = null;

function ensureScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptReady) return scriptReady;
  scriptReady = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return scriptReady;
}

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export default function CaptchaWidget({ onVerify, onExpire }: CaptchaWidgetProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    ensureScript().then(() => {
      if (!mounted || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: onVerify,
        'expired-callback': onExpire ?? (() => {}),
      });
    });

    return () => {
      mounted = false;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // min-h ensures the container has space before the iframe is injected.
  // overflow-visible overrides any ancestor overflow:hidden that would clip the widget.
  return <div ref={ref} className="mt-1 min-h-[65px] overflow-visible" />;
}
