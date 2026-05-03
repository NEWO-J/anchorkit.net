import React from 'react';

export default function UsagePage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white">Usage</h1>
        <p className="font-['DM_Sans',sans-serif] text-sm text-white/30 mt-1">Submission volume and plan limits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {['Submissions this period', 'Verifications run', 'Plan limit'].map(label => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.08] rounded-[8px] px-5 py-5">
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-2">{label}</p>
            <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white/20">—</p>
          </div>
        ))}
      </div>

      <div className="border border-white/[0.08] rounded-[8px] flex flex-col items-center justify-center py-20 text-center">
        <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">Usage analytics coming soon.</p>
        <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
          Daily submission volume chart and period totals will appear here.
        </p>
      </div>
    </div>
  );
}
