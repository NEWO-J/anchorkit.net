import React from 'react';

export default function SubmissionsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white">Submissions</h1>
        <p className="font-['DM_Sans',sans-serif] text-sm text-white/30 mt-1">All hashes submitted through your API key.</p>
      </div>

      <div className="border border-white/[0.08] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-[minmax(0,2fr)_6rem_minmax(0,1fr)_8rem] gap-x-6 px-5 py-3 border-b border-white/[0.08] bg-white/[0.02]">
          <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Hash</span>
          <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Type</span>
          <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Submitted</span>
          <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Status</span>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">Submission history coming soon.</p>
          <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
            Submitted hashes, anchor status, and Merkle proof links will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
