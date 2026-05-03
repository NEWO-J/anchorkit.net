import React from 'react';

export default function SubmissionsPage() {
  return (
    <div>
      <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Submissions</h1>
        <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">All hashes submitted through your API key</p>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[minmax(0,2fr)_6rem_minmax(0,1fr)_8rem] gap-x-6 px-6 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Hash</span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Type</span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Submitted</span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Status</span>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center border-b border-white/[0.08]">
        <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">Submission history coming soon.</p>
        <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
          Submitted hashes, anchor status, and Merkle proof links will appear here.
        </p>
      </div>
    </div>
  );
}
