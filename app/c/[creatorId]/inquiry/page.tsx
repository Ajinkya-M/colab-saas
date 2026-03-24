'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import BrandLogo from '@/components/BrandLogo';

type OAuthProvider = 'google' | 'facebook';

function getDisplayName(email: string | undefined, metadata: Record<string, unknown> | undefined) {
  const nameFromMetadata =
    (typeof metadata?.full_name === 'string' && metadata.full_name) ||
    (typeof metadata?.name === 'string' && metadata.name) ||
    (typeof metadata?.user_name === 'string' && metadata.user_name);

  if (nameFromMetadata) {
    return nameFromMetadata;
  }

  if (!email) {
    return 'Brand User';
  }

  return email.split('@')[0];
}

function getAvatar(metadata: Record<string, unknown> | undefined) {
  const avatarFromMetadata = metadata?.avatar_url;
  if (typeof avatarFromMetadata === 'string') {
    return avatarFromMetadata;
  }

  const pictureFromMetadata = metadata?.picture;
  if (typeof pictureFromMetadata === 'string') {
    return pictureFromMetadata;
  }

  return null;
}

async function ensureBrandProfile(user: User) {
  const { data: existingProfile, error: readError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existingProfile) {
    return;
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const { error: insertError } = await supabase.from('profiles').insert({
    user_id: user.id,
    type: 'brand',
    name: getDisplayName(user.email, metadata),
    avatar_url: getAvatar(metadata),
  });

  if (insertError) {
    throw insertError;
  }
}

export default function CreatorInquiryPage() {
  const params = useParams<{ creatorId: string }>();
  const creatorId = params.creatorId;

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [campaignTitle, setCampaignTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isAuthenticated = authUserId !== null;
  const canSubmit = isAuthenticated && isConfirmed && message.trim().length > 0 && !submitLoading;

  useEffect(() => {
    async function hydrateAuth() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setAuthUserId(null);
        return;
      }
      if (data.user) {
        try {
          await ensureBrandProfile(data.user);
          setAuthUserId(data.user.id);
        } catch {
          // Keep the page usable by showing OAuth actions instead of a blocking error.
          setAuthUserId(null);
          return;
        }
      }
      if (!data.user) {
        setAuthUserId(null);
      }
    }

    void hydrateAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          await ensureBrandProfile(session.user);
          setAuthUserId(session.user.id);
          setError(null);
          return;
        } catch {
          setAuthUserId(null);
          return;
        }
      }
      setAuthUserId(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const submitLabel = useMemo(() => {
    if (submitLoading) {
      return 'Submitting...';
    }
    return 'Submit Inquiry';
  }, [submitLoading]);

  async function handleOAuth(provider: OAuthProvider) {
    setError(null);
    setLoadingProvider(provider);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.href,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingProvider(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setError(null);
    setSubmitLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setSubmitLoading(false);
      setError(userError?.message ?? 'Please verify your account before submitting.');
      return;
    }

    try {
      await ensureBrandProfile(userData.user);
    } catch (profileError) {
      const message =
        profileError instanceof Error ? profileError.message : 'Failed to create brand profile.';
      setError(message);
      setSubmitLoading(false);
      return;
    }

    const parsedBudget = budget.trim().length > 0 ? Number(budget) : null;
    const normalizedBudget =
      parsedBudget !== null && Number.isFinite(parsedBudget) ? parsedBudget : null;

    const insertPayload: {
      creator_user_id: string;
      brand_user_id: string;
      message: string;
      status: string;
      campaign_title?: string;
      budget?: number;
    } = {
      creator_user_id: creatorId,
      brand_user_id: userData.user.id,
      message:
        timeline.trim().length > 0
          ? `${message.trim()}\n\nPreferred timeline: ${timeline.trim()}`
          : message.trim(),
      status: 'new',
    };

    if (campaignTitle.trim().length > 0) {
      insertPayload.campaign_title = campaignTitle.trim();
    }
    if (normalizedBudget !== null) {
      insertPayload.budget = normalizedBudget;
    }
    const { error: insertError } = await supabase.from('inquiries').insert(insertPayload);

    if (insertError) {
      setError(insertError.message);
      setSubmitLoading(false);
      return;
    }

    setSubmitLoading(false);
    setSuccess(true);
    setCampaignTitle('');
    setBudget('');
    setTimeline('');
    setMessage('');
    setIsConfirmed(false);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/20 bg-surface/95 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <BrandLogo className="h-7 w-auto" alt="Spark" />
          <Link className="text-xs font-semibold uppercase tracking-wider text-secondary" href="/login">
            Log in
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-24 pt-6 md:gap-6 md:px-8 md:pt-10">
        <section>
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary">Creator ID: {creatorId}</p>
          <h1 className="mt-3 font-headline text-4xl font-bold tracking-tight md:text-5xl">Start an Inquiry</h1>
          <p className="mt-2 max-w-xl text-sm text-on-surface-variant md:text-base">
            Send a collaboration request directly to this creator.
          </p>
        </section>

        {error && (
          <section className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </section>
        )}

        {!isAuthenticated && (
          <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 md:p-6">
            <h2 className="font-headline text-xl font-bold">Verification Required</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              To protect creators from spam, verify your brand account first.
            </p>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loadingProvider !== null}
                className="flex h-11 items-center justify-center rounded-full border border-outline-variant/30 bg-surface px-4 text-sm font-semibold disabled:opacity-50"
              >
                {loadingProvider === 'google' ? 'Connecting Google...' : 'Continue with Google'}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                disabled={loadingProvider !== null}
                className="flex h-11 items-center justify-center rounded-full border border-outline-variant/30 bg-surface px-4 text-sm font-semibold disabled:opacity-50"
              >
                {loadingProvider === 'facebook' ? 'Connecting Facebook...' : 'Continue with Facebook'}
              </button>
            </div>
          </section>
        )}

        {success ? (
          <section className="rounded-xl border border-primary/15 bg-surface-container-lowest p-6">
            <h2 className="font-headline text-2xl font-bold">Inquiry sent</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Thanks, your request has been sent to the creator.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
            >
              Send another inquiry
            </button>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-4 pb-24 md:p-6 md:pb-6"
          >
            <h2 className="font-headline text-xl font-bold">Campaign Details</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-on-surface">Campaign title (optional)</span>
                <input
                  value={campaignTitle}
                  onChange={(event) => setCampaignTitle(event.target.value)}
                  disabled={!isAuthenticated}
                  className="h-11 rounded-lg border border-outline-variant/35 bg-surface px-3 text-sm disabled:opacity-50"
                  placeholder="Summer product launch"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-on-surface">Budget (optional)</span>
                  <input
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    disabled={!isAuthenticated}
                    className="h-11 rounded-lg border border-outline-variant/35 bg-surface px-3 text-sm disabled:opacity-50"
                    inputMode="decimal"
                    placeholder="5000"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-on-surface">Preferred timeline (optional)</span>
                  <input
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value)}
                    disabled={!isAuthenticated}
                    className="h-11 rounded-lg border border-outline-variant/35 bg-surface px-3 text-sm disabled:opacity-50"
                    placeholder="Q3 2026"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-on-surface">Your message</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={!isAuthenticated}
                  required
                  rows={6}
                  className="rounded-lg border border-outline-variant/35 bg-surface px-3 py-3 text-sm disabled:opacity-50"
                  placeholder="Share goals, scope, deliverables, and deadline."
                />
              </label>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(event) => setIsConfirmed(event.target.checked)}
                  disabled={!isAuthenticated}
                  className="mt-1 h-4 w-4 rounded border-outline-variant/40"
                />
                <span className="text-on-surface-variant">
                  I confirm this inquiry is for a legitimate brand collaboration.
                </span>
              </label>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/25 bg-surface p-4 md:static md:mt-6 md:border-none md:bg-transparent md:p-0">
              <button
                type="submit"
                disabled={!canSubmit}
                className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-on-primary disabled:opacity-50"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
