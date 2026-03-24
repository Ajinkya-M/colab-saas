'use client';

import { useEffect, useState } from 'react';
import { Deal } from '@/data/mockDeals';

interface CampaignDetailModalProps {
  deal: Deal;
  onClose: () => void;
}

export default function CampaignDetailModal({ deal, onClose }: CampaignDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // match transition duration
  };

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
    
    // Fallback escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Slide-over Backdrop Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-on-surface/10 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      />
      
      {/* Right Slide-over Panel */}
      <div className={`fixed inset-y-0 right-0 z-[60] w-full max-w-xl bg-surface-container-lowest shadow-[0_-12px_32px_0_rgba(25,28,30,0.06)] flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-6 py-4 bg-[#f7f9fb] border-b border-[#eceef0]">
          <div className="flex items-center gap-4">
            <button onClick={handleClose} className="material-symbols-outlined text-on-surface-variant hover:bg-black/5 p-2 rounded-full transition-colors active:scale-95">arrow_back</button>
            <h1 className="font-headline font-semibold text-lg text-[#191c1e]">Inquiry Details</h1>
            <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-sm tracking-wider uppercase ml-1">{deal.status.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="material-symbols-outlined text-outline hover:bg-black/5 p-2 rounded-full transition-colors active:scale-95">share</button>
            <button onClick={handleClose} className="material-symbols-outlined text-primary font-bold hover:bg-black/5 p-2 rounded-full transition-colors active:scale-95" data-icon="close">close</button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          
          {/* Inquiry Identity Section */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden border border-outline-variant/20 flex items-center justify-center text-primary bg-primary/10">
                {deal.contactAvatar ? (
                  <img src={deal.contactAvatar} alt={deal.brandName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl">{deal.icon || 'work'}</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Campaign</p>
                <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight leading-tight">{deal.projectName}</h2>
              </div>
            </div>
          </div>

          {/* Summary Bento Section */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-1 border border-outline-variant/10">
              <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider">Brand / Partner</p>
              <p className="font-headline text-lg font-semibold text-on-surface">{deal.brandName}</p>
            </div>
            <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-1 border border-outline-variant/10">
              <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider">Budget</p>
              <p className="font-headline text-lg font-semibold text-primary">${deal.budget.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-1 border border-outline-variant/10 col-span-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">calendar_today</span>
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider">Priority / Timeline</p>
                  <p className="font-headline text-lg font-semibold text-on-surface capitalize">{deal.priority} Priority</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Message Block */}
          <section className="space-y-4">
            <h3 className="font-headline text-xl font-semibold text-on-surface">Description</h3>
            <div className="relative p-8 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm">
              <span className="material-symbols-outlined absolute top-4 left-4 text-surface-variant text-4xl opacity-50 select-none">format_quote</span>
              <div className="relative z-10 space-y-4 text-on-surface-variant leading-relaxed">
                <p>{deal.description || "No detailed description provided for this campaign yet."}</p>
              </div>
            </div>
          </section>

          {/* Attachments / Additional Details */}
          <section className="mt-10">
            <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-[0.15em] mb-4">Requirements</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">Standard Usage</span>
              <span className="px-4 py-2 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">Creator Content</span>
            </div>
          </section>
        </main>

        {/* BottomNavBar (Action Footer) */}
        <footer className="w-full flex justify-center gap-4 p-6 bg-white/70 backdrop-blur-xl border-t border-[#eceef0] shadow-[0_-12px_32px_0_rgba(25,28,30,0.06)]">
          <button onClick={handleClose} className="flex-1 flex flex-col items-center justify-center text-[#191c1e] border border-outline-variant/40 rounded-full px-8 py-3 mx-2 hover:bg-surface-container-low transition-all active:scale-95 duration-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">close</span>
              <span className="font-body font-medium text-sm tracking-wide">Close View</span>
            </div>
          </button>
          <button className="flex-1 flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-8 py-3 mx-2 hover:opacity-90 transition-all active:scale-95 duration-200 shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">edit</span>
              <span className="font-body font-medium text-sm tracking-wide">Edit Details</span>
            </div>
          </button>
        </footer>
      </div>
    </>
  );
}
