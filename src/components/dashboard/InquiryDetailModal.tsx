'use client';

import { useCallback, useEffect, useState } from 'react';

type InquiryStatus = string | null;

export interface InquiryDetail {
  id: string;
  message: string;
  campaign_title: string | null;
  budget: number | string | null;
  status: InquiryStatus;
  created_at: string;
}

interface InquiryDetailModalProps {
  inquiry: InquiryDetail;
  isActionLoading: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onRemoveRejected: () => void;
}

export default function InquiryDetailModal({
  inquiry,
  isActionLoading,
  onClose,
  onAccept,
  onDecline,
  onRemoveRejected,
}: InquiryDetailModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 180);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  const status = inquiry.status ?? 'new';
  const isNew = status === 'new';
  const isRejected = status === 'rejected';
  const isAccepted = status === 'accepted';
  const parsedBudget = Number(inquiry.budget);
  const showBudget =
    inquiry.budget !== null &&
    inquiry.budget !== '' &&
    Number.isFinite(parsedBudget);

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[60] flex w-full max-w-lg flex-col bg-surface-container-lowest shadow-2xl transition-transform duration-200 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-secondary">Inquiry Details</p>
            <h3 className="font-headline text-xl font-bold text-on-surface">
              {inquiry.campaign_title?.trim() || 'Untitled Campaign'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="material-symbols-outlined rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
          >
            close
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="space-y-2 rounded-xl border border-outline-variant/25 bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
              <span className="rounded-full bg-surface-container-low px-2 py-0.5 uppercase tracking-wider">
                {status}
              </span>
              <span>{new Date(inquiry.created_at).toLocaleString()}</span>
            </div>
            {showBudget && (
              <p className="text-sm text-secondary">Budget: ${parsedBudget.toLocaleString()}</p>
            )}
          </div>

          <section className="rounded-xl border border-outline-variant/25 bg-surface p-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-secondary">Brand Message</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
              {inquiry.message}
            </p>
          </section>
        </div>

        <footer className="border-t border-outline-variant/20 bg-surface p-4">
          {isNew && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAccept}
                disabled={isActionLoading}
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:opacity-50"
              >
                {isActionLoading ? 'Processing...' : 'Accept'}
              </button>
              <button
                type="button"
                onClick={onDecline}
                disabled={isActionLoading}
                className="flex-1 rounded-full border border-outline-variant/40 px-4 py-2.5 text-sm font-semibold text-on-surface disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
          {isAccepted && <p className="text-sm text-secondary">This inquiry has already been accepted.</p>}
          {isRejected && (
            <button
              type="button"
              onClick={onRemoveRejected}
              disabled={isActionLoading}
              className="w-full rounded-full border border-error/30 bg-error-container px-4 py-2.5 text-sm font-semibold text-on-error-container disabled:opacity-50"
            >
              {isActionLoading ? 'Removing...' : 'Remove From List'}
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}
