import React from 'react';
import GradientCirclesBackground from '../components/GradientCirclesBackground';
import CaptchaWidget from '../components/CaptchaWidget';

const API_BASE = 'https://api.anchorkit.net';

const SUBJECTS = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'Media Inquiry',
  'Partnership',
  'Feedback',
];

export default function ContactPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [captchaToken, setCaptchaToken] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, cf_token: captchaToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `Error ${res.status}`);
      }
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                    font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                    focus:outline-none focus:border-white/20 transition-colors`;

  if (status === 'sent') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-6">
        <GradientCirclesBackground />
        <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="border border-white/[0.08] bg-[#030028]">
            <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Message sent</h1>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">We'll get back to you soon</p>
            </div>
            <div className="p-6">
              <p className="font-['DM_Sans',sans-serif] text-sm text-white/50 leading-relaxed">
                Thanks for reaching out. We'll respond to{' '}
                <span className="text-white/70">{email}</span>{' '}
                within 2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-6 pb-24">
      <GradientCirclesBackground />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="border border-white/[0.08] bg-[#030028]">

          {/* Header */}
          <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
            <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Contact &amp; Feedback</h1>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Get in touch with the AnchorKit team</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Subject</label>
                <select
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className={`${inputCls} appearance-none bg-black/30`}
                >
                  <option value="" disabled>Select a subject…</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s} className="bg-[#030028]">{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your question, issue, or feedback…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <CaptchaWidget
                onVerify={token => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
              />

              {status === 'error' && (
                <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !captchaToken}
                className="mt-1 w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                           font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                           hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>
            </form>

            <p className="mt-5 font-['DM_Sans',sans-serif] text-xs text-white/30">
              You can also reach us at{' '}
              <a
                href="mailto:support@anchorkit.net"
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                support@anchorkit.net
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
