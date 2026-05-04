import React from 'react';
import dashboardBg from '../../assets/dashboard.png';

const stats = ['Submissions this period', 'Verifications run', 'Plan limit'];

export default function UsagePage() {
  return (
    <div>
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Usage</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Submission volume and plan limits</p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 border-b border-white/[0.08]">
        {stats.map((label, i) => (
          <div key={label} className={`px-6 py-5 ${i < stats.length - 1 ? 'border-r border-white/[0.08]' : ''}`}>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">{label}</p>
            <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white/20 leading-none">—</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center border-b border-white/[0.08]">
        <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">Usage analytics coming soon.</p>
        <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
          Daily submission volume chart and period totals will appear here.
        </p>
      </div>
    </div>
  );
}
