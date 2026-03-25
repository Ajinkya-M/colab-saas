'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import KanbanColumn from '@/components/dashboard/KanbanColumn';
import CampaignDetailModal from '@/components/dashboard/CampaignDetailModal';
import InquiryDetailModal from '@/components/dashboard/InquiryDetailModal';
import { Deal, DealStatus } from '@/data/mockDeals';
import { supabase } from '@/lib/supabase';

const columns = [
  { title: 'New Inquiries', status: 'inquiry' as const, dotColor: 'bg-blue-400' },
  { title: 'Negotiating', status: 'negotiating' as const, dotColor: 'bg-amber-400' },
  { title: 'Contract Signed', status: 'contract_signed' as const, dotColor: 'bg-tertiary' },
  { title: 'In Production', status: 'in_production' as const, dotColor: 'bg-primary' },
];

const FALLBACK_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBbxMJ_KrbFXyZsFcYeC5wcE82NqgLGJG7K5Z2Ulut0osREdurTDwLQ5JYioMm3-RE_spM0VLSWTEvyjSae8kG4e1sGGaYIq4n_2i1V7dx6Nu9k-3xrysmAPO52DCNleQLKsi3alX8b0bJ-M26FzLeOVLx9_ufEuhDhupw5q2uKAqobwnn_oRHf9j3H8I-JP9cpUODm1HkNcbVAdX0Klt-UFHXSgNYPSj3KUXQJBEIrUgePdyJu7WsMzgn8CkzxhyvMNqdj4U1K7G9x';

type DbDealRow = {
  id: string;
  title: string;
  description: string | null;
  budget: number | string | null;
  priority: 'high' | 'medium' | 'low' | string;
  deal_stages: { key: string } | { key: string }[] | null;
  brand_profile: { name: string | null; avatar_url: string | null } | { name: string | null; avatar_url: string | null }[] | null;
};

type StageRow = {
  id: string;
  key: string;
};

type InquiryRow = {
  id: string;
  message: string;
  campaign_title: string | null;
  budget: number | string | null;
  status: string | null;
  created_at: string;
  brand_user_id: string | null;
  brand_profile: { name: string | null; avatar_url: string | null } | { name: string | null; avatar_url: string | null }[] | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [stageIdByStatus, setStageIdByStatus] = useState<Partial<Record<DealStatus, string>>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [inquiriesError, setInquiriesError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [inquiryActionLoadingId, setInquiryActionLoadingId] = useState<string | null>(null);
  const [isInquiriesCollapsed, setIsInquiriesCollapsed] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<DealStatus>('inquiry');

  useEffect(() => {
    function getDisplayName(email: string | undefined, metadata: Record<string, unknown> | undefined) {
      const nameFromMetadata =
        (typeof metadata?.full_name === 'string' && metadata.full_name) ||
        (typeof metadata?.name === 'string' && metadata.name) ||
        (typeof metadata?.user_name === 'string' && metadata.user_name);

      if (nameFromMetadata) {
        return nameFromMetadata;
      }

      if (!email) {
        return 'Creator';
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

    async function ensureProfile(
      userId: string,
      email: string | undefined,
      metadata: Record<string, unknown> | undefined
    ) {
      const name = getDisplayName(email, metadata);
      const avatar = getAvatar(metadata);

      const { error } = await supabase.from('profiles').upsert(
        {
          user_id: userId,
          type: 'creator',
          name,
          avatar_url: avatar,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.error('Failed to upsert profile:', error.message);
      }
    }

    function normalizeStageKey(dealStage: DbDealRow['deal_stages']): string | null {
      if (!dealStage) {
        return null;
      }
      if (Array.isArray(dealStage)) {
        return dealStage[0]?.key ?? null;
      }
      return dealStage.key ?? null;
    }

    function mapStageToStatus(stageKey: string | null): DealStatus | null {
      if (stageKey === 'inquiry' || stageKey === 'negotiating' || stageKey === 'contract_signed' || stageKey === 'in_production') {
        return stageKey;
      }
      return null;
    }

    async function loadDealsForUser(userId: string) {
      setDealsLoading(true);
      setDealsError(null);

      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          budget,
          priority,
          deal_stages (
            key
          ),
          brand_profile:profiles!deals_brand_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('creator_user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        setDealsError(error.message);
        setDealsLoading(false);
        return;
      }

      const mappedDeals = ((data ?? []) as DbDealRow[])
        .map((deal): Deal | null => {
          const stageKey = normalizeStageKey(deal.deal_stages);
          const status = mapStageToStatus(stageKey);
          if (!status) {
            return null;
          }

          const normalizedBudget =
            typeof deal.budget === 'number'
              ? deal.budget
              : typeof deal.budget === 'string'
                ? Number(deal.budget)
                : 0;
          const brandProfile = Array.isArray(deal.brand_profile)
            ? deal.brand_profile[0] ?? null
            : deal.brand_profile;
          const resolvedBrandName =
            brandProfile?.name && brandProfile.name.trim().length > 0
              ? brandProfile.name
              : 'Brand Partner';
          const resolvedBrandAvatar =
            brandProfile?.avatar_url && brandProfile.avatar_url.trim().length > 0
              ? brandProfile.avatar_url
              : FALLBACK_AVATAR;

          return {
            id: deal.id,
            brandName: resolvedBrandName,
            projectName: deal.title,
            description: deal.description ?? 'No description yet.',
            budget: Number.isFinite(normalizedBudget) ? normalizedBudget : 0,
            status,
            priority: deal.priority === 'high' || deal.priority === 'medium' || deal.priority === 'low' ? deal.priority : 'medium',
            icon: 'work',
            contactAvatar: resolvedBrandAvatar,
          };
        })
        .filter((deal): deal is Deal => deal !== null);

      setDeals(mappedDeals);
      setDealsLoading(false);
    }

    async function loadInquiriesForUser(userId: string) {
      setInquiriesError(null);
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          message,
          campaign_title,
          budget,
          status,
          created_at,
          brand_user_id,
          brand_profile:profiles!inquiries_brand_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('creator_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        setInquiriesError(error.message);
        return;
      }

      const visibleInquiries = ((data ?? []) as InquiryRow[]).filter((inquiry) => {
        const status = (inquiry.status ?? '').toLowerCase();
        return status !== 'accepted' && status !== 'archived';
      });
      setInquiries(visibleInquiries);
    }

    async function loadStageMapping() {
      const { data, error } = await supabase
        .from('deal_stages')
        .select('id, key')
        .in('key', ['inquiry', 'negotiating', 'contract_signed', 'in_production']);

      if (error) {
        setDealsError(error.message);
        return;
      }

      const mapping: Partial<Record<DealStatus, string>> = {};
      for (const row of (data ?? []) as StageRow[]) {
        if (
          row.key === 'inquiry' ||
          row.key === 'negotiating' ||
          row.key === 'contract_signed' ||
          row.key === 'in_production'
        ) {
          mapping[row.key] = row.id;
        }
      }
      setStageIdByStatus(mapping);
    }

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
        return;
      }

      const { email, user_metadata } = data.user;
      setCurrentUserId(data.user.id);
      setUserName(getDisplayName(email, user_metadata));
      setUserEmail(email ?? '');
      setAvatarUrl(getAvatar(user_metadata));
      await ensureProfile(data.user.id, email, user_metadata);
      await loadStageMapping();
      await loadDealsForUser(data.user.id);
      await loadInquiriesForUser(data.user.id);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { email, user_metadata } = session.user;
      setCurrentUserId(session.user.id);
      setUserName(getDisplayName(email, user_metadata));
      setUserEmail(email ?? '');
      setAvatarUrl(getAvatar(user_metadata));
      void ensureProfile(session.user.id, email, user_metadata);
      void loadStageMapping();
      void loadDealsForUser(session.user.id);
      void loadInquiriesForUser(session.user.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  async function handleDropDeal(targetStatus: DealStatus) {
    if (!draggingDealId || !currentUserId) {
      return;
    }

    const nextStageId = stageIdByStatus[targetStatus];
    if (!nextStageId) {
      setDealsError('Missing stage mapping. Please refresh and try again.');
      return;
    }

    const existingDeal = deals.find((deal) => deal.id === draggingDealId);
    if (!existingDeal || existingDeal.status === targetStatus) {
      setDraggingDealId(null);
      return;
    }

    const previousDeals = deals;
    setDealsError(null);
    setDeals((currentDeals) =>
      currentDeals.map((deal) =>
        deal.id === draggingDealId ? { ...deal, status: targetStatus } : deal
      )
    );
    setDraggingDealId(null);

    const { error } = await supabase
      .from('deals')
      .update({ stage_id: nextStageId })
      .eq('id', existingDeal.id)
      .eq('creator_user_id', currentUserId);

    if (error) {
      setDeals(previousDeals);
      setDealsError(`Failed to move deal: ${error.message}`);
    }
  }

  const inquiryLink =
    currentUserId && typeof window !== 'undefined'
      ? `${window.location.origin}/c/${currentUserId}/inquiry`
      : '';

  async function handleCopyInquiryLink() {
    if (!inquiryLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inquiryLink);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      setTimeout(() => setCopyState('idle'), 1800);
    }
  }

  async function handleAcceptInquiry(inquiry: InquiryRow) {
    if (!currentUserId) {
      return;
    }

    const inquiryStageId = stageIdByStatus.inquiry;
    if (!inquiryStageId) {
      setInquiriesError('Missing inquiry stage mapping. Please refresh and try again.');
      return;
    }

    setInquiriesError(null);
    setInquiryActionLoadingId(inquiry.id);

    const normalizedBudget =
      inquiry.budget !== null && inquiry.budget !== '' && Number.isFinite(Number(inquiry.budget))
        ? Number(inquiry.budget)
        : 0;

    const insertPayload: {
      creator_user_id: string;
      stage_id: string;
      title: string;
      description: string;
      budget: number;
      priority: 'high' | 'medium' | 'low';
      inquiry_id?: string;
      brand_user_id?: string;
    } = {
      creator_user_id: currentUserId,
      stage_id: inquiryStageId,
      title: inquiry.campaign_title?.trim() || 'New Brand Inquiry',
      description: inquiry.message,
      budget: normalizedBudget,
      priority: 'medium',
    };

    if (inquiry.brand_user_id) {
      insertPayload.brand_user_id = inquiry.brand_user_id;
    }
    insertPayload.inquiry_id = inquiry.id;

    const { data: insertedDeal, error: dealInsertError } = await supabase
      .from('deals')
      .insert(insertPayload)
      .select('id, title, description, budget, priority')
      .single();

    if (dealInsertError) {
      setInquiriesError(`Failed to accept inquiry: ${dealInsertError.message}`);
      setInquiryActionLoadingId(null);
      return;
    }

    const { error: inquiryUpdateError } = await supabase
      .from('inquiries')
      .update({ status: 'accepted' })
      .eq('id', inquiry.id)
      .eq('creator_user_id', currentUserId);

    if (inquiryUpdateError) {
      setInquiriesError(`Deal created but inquiry status update failed: ${inquiryUpdateError.message}`);
    }

    setInquiries((current) => current.filter((row) => row.id !== inquiry.id));
    if (selectedInquiryId === inquiry.id) {
      setSelectedInquiryId(null);
    }

    if (insertedDeal) {
      const budget =
        typeof insertedDeal.budget === 'number'
          ? insertedDeal.budget
          : typeof insertedDeal.budget === 'string'
            ? Number(insertedDeal.budget)
            : 0;

      const mappedDeal: Deal = {
        id: insertedDeal.id,
        brandName: getInquiryBrandName(inquiry),
        projectName: insertedDeal.title,
        description: insertedDeal.description ?? 'No description yet.',
        budget: Number.isFinite(budget) ? budget : 0,
        status: 'inquiry',
        priority:
          insertedDeal.priority === 'high' ||
          insertedDeal.priority === 'medium' ||
          insertedDeal.priority === 'low'
            ? insertedDeal.priority
            : 'medium',
        icon: 'work',
        contactAvatar: getInquiryBrandAvatar(inquiry) ?? FALLBACK_AVATAR,
      };

      setDeals((current) => [mappedDeal, ...current]);
    }

    setInquiryActionLoadingId(null);
  }

  async function handleDeclineInquiry(inquiryId: string) {
    if (!currentUserId) {
      return;
    }

    setInquiriesError(null);
    setInquiryActionLoadingId(inquiryId);

    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'rejected' })
      .eq('id', inquiryId)
      .eq('creator_user_id', currentUserId);

    if (error) {
      setInquiriesError(`Failed to decline inquiry: ${error.message}`);
      setInquiryActionLoadingId(null);
      return;
    }

    setInquiries((current) =>
      current.map((inquiry) =>
        inquiry.id === inquiryId ? { ...inquiry, status: 'rejected' } : inquiry
      )
    );
    setInquiryActionLoadingId(null);
  }

  async function handleRemoveRejectedInquiry(inquiryId: string) {
    if (!currentUserId) {
      return;
    }

    setInquiriesError(null);
    setInquiryActionLoadingId(inquiryId);

    const { data: deletedInquiryRows, error: deleteInquiryError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiryId)
      .eq('creator_user_id', currentUserId)
      .select('id');

    if (deleteInquiryError) {
      setInquiriesError(`Failed to remove inquiry: ${deleteInquiryError.message}`);
      setInquiryActionLoadingId(null);
      return;
    }

    if (!deletedInquiryRows || deletedInquiryRows.length === 0) {
      setInquiriesError('Failed to remove inquiry: no rows were deleted. Check RLS delete policy.');
      setInquiryActionLoadingId(null);
      return;
    }

    setInquiries((current) => current.filter((inquiry) => inquiry.id !== inquiryId));
    if (selectedInquiryId === inquiryId) {
      setSelectedInquiryId(null);
    }
    setInquiryActionLoadingId(null);
  }

  const selectedInquiry =
    selectedInquiryId !== null
      ? inquiries.find((inquiry) => inquiry.id === selectedInquiryId) ?? null
      : null;

  function getInquiryBrandProfile(inquiry: InquiryRow) {
    if (!inquiry.brand_profile) {
      return { name: null, avatar_url: null };
    }
    if (Array.isArray(inquiry.brand_profile)) {
      return inquiry.brand_profile[0] ?? { name: null, avatar_url: null };
    }
    return inquiry.brand_profile;
  }

  function getInquiryBrandName(inquiry: InquiryRow) {
    const profile = getInquiryBrandProfile(inquiry);
    if (profile.name && profile.name.trim().length > 0) {
      return profile.name;
    }
    return 'Brand User';
  }

  function getInquiryBrandAvatar(inquiry: InquiryRow) {
    const profile = getInquiryBrandProfile(inquiry);
    if (profile.avatar_url && profile.avatar_url.trim().length > 0) {
      return profile.avatar_url;
    }
    return null;
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Sidebar */}
      <Sidebar activePage="Home" />

      {/* Desktop Top Navigation */}
      <header className="fixed top-0 right-0 left-64 z-40 bg-surface hidden md:flex justify-between items-center px-8 py-4">
        <div className="flex items-center w-1/3">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-sm font-body font-normal"
              placeholder="Search projects..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-on-surface-variant hover:text-primary transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface font-headline">{userName}</p>
              <p className="text-[10px] text-secondary font-body font-medium">{userEmail || 'Authenticated User'}</p>
            </div>
            {avatarUrl ? (
              <img
                alt={`${userName} avatar`}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
                referrerPolicy="no-referrer"
                src={avatarUrl}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary ring-2 ring-primary/10 flex items-center justify-center text-xs font-bold font-headline">
                {initials || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/10 flex md:hidden items-center justify-between px-4 py-3">
        <button className="p-2 text-on-surface-variant">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-headline text-xl font-bold tracking-tight text-primary">Spark</h1>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/10"
              referrerPolicy="no-referrer"
              src={avatarUrl}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold font-headline">
              {initials || 'U'}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-20 md:pt-24 min-h-screen px-4 md:px-8 pb-32 md:pb-8">
        {/* Mobile Milestone Card */}
        <div className="mb-6 block md:hidden bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-label">Weekly Milestone</span>
            <span className="text-xs font-bold text-primary font-headline">85% to Target</span>
          </div>
          <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[85%]"></div>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6 md:mb-10">
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-1 md:mb-2 text-editorial-blue">Editorial Pipeline</h2>
          <p className="font-body text-secondary text-sm md:text-lg">Manage your creative workflow and brand partnerships.</p>
        </div>

        <section className="mb-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-secondary font-label">Public Inquiry Link</p>
              <p className="text-sm text-on-surface-variant">
                Share this URL with brands so they can submit inquiries directly to you.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="max-w-[440px] truncate rounded-full bg-surface px-4 py-2 text-xs">
                {inquiryLink || 'Loading creator link...'}
              </code>
              <button
                type="button"
                onClick={handleCopyInquiryLink}
                disabled={!inquiryLink}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary disabled:opacity-50"
              >
                {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy Failed' : 'Copy Link'}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsInquiriesCollapsed((current) => !current)}
              className="flex items-center gap-2"
            >
              <h3 className="font-headline text-xl font-bold text-on-surface">Latest Inquiries</h3>
              <span className="material-symbols-outlined text-secondary">
                {isInquiriesCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
            <p className="text-xs text-secondary">{inquiries.length} recent</p>
          </div>
          {!isInquiriesCollapsed && (
            <>
              {inquiriesError && <p className="text-sm text-error">Failed to load inquiries: {inquiriesError}</p>}
              {!inquiriesError && inquiries.length === 0 && (
                <p className="text-sm text-secondary">No inquiries yet. Share your link to start receiving requests.</p>
              )}
              <div className="space-y-3">
                {inquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    onClick={() => setSelectedInquiryId(inquiry.id)}
                    className="cursor-pointer rounded-xl border border-outline-variant/25 bg-surface p-4 transition-colors hover:bg-surface-container-low"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      {getInquiryBrandAvatar(inquiry) ? (
                        <img
                          src={getInquiryBrandAvatar(inquiry)!}
                          alt={`${getInquiryBrandName(inquiry)} avatar`}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-outline-variant/25"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {getInquiryBrandName(inquiry).slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">{getInquiryBrandName(inquiry)}</p>
                        <p className="text-[11px] text-secondary">Brand</p>
                      </div>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                      <span className="rounded-full bg-surface-container-low px-2 py-0.5 uppercase tracking-wider">
                        {inquiry.status ?? 'new'}
                      </span>
                      <span>{new Date(inquiry.created_at).toLocaleString()}</span>
                    </div>
                    <p className="font-semibold text-on-surface">
                      {inquiry.campaign_title?.trim() || 'Untitled Campaign'}
                    </p>
                    {inquiry.budget !== null && inquiry.budget !== '' && Number.isFinite(Number(inquiry.budget)) && (
                      <p className="text-sm text-secondary">Budget: ${Number(inquiry.budget).toLocaleString()}</p>
                    )}
                    <p className="mt-2 text-sm text-on-surface-variant">{inquiry.message}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {inquiry.status === 'new' ? (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleAcceptInquiry(inquiry);
                            }}
                            disabled={inquiryActionLoadingId === inquiry.id}
                            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary disabled:opacity-50"
                          >
                            {inquiryActionLoadingId === inquiry.id ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeclineInquiry(inquiry.id);
                            }}
                            disabled={inquiryActionLoadingId === inquiry.id}
                            className="rounded-full border border-outline-variant/40 px-3 py-1.5 text-xs font-semibold text-on-surface disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </>
                      ) : inquiry.status === 'rejected' ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleRemoveRejectedInquiry(inquiry.id);
                          }}
                          disabled={inquiryActionLoadingId === inquiry.id}
                          className="rounded-full border border-error/30 bg-error-container px-3 py-1.5 text-xs font-semibold text-on-error-container disabled:opacity-50"
                        >
                          {inquiryActionLoadingId === inquiry.id ? 'Removing...' : 'Remove From List'}
                        </button>
                      ) : (
                        <span className="text-xs text-secondary">
                          {inquiry.status === 'accepted' ? 'Accepted' : inquiry.status === 'rejected' ? 'Declined' : 'Updated'}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Mobile Pipeline Switcher */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-surface-container-low rounded-xl mb-6 overflow-x-auto no-scrollbar border border-outline-variant/5">
          {columns.map((col) => (
            <button
              key={col.status}
              onClick={() => setActiveMobileTab(col.status)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeMobileTab === col.status
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {col.title.replace('Inquiries', '').replace('Signed', '').trim()}
            </button>
          ))}
        </div>

        {/* Kanban Board */}
        {dealsError && (
          <p className="mb-4 text-sm text-error">Failed to load deals: {dealsError}</p>
        )}

        {dealsLoading ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-secondary">
            Loading your pipeline...
          </div>
        ) : (
          <>
            {/* Mobile Tab View */}
            <div className="block md:hidden">
              {columns
                .filter((col) => col.status === activeMobileTab)
                .map((col) => (
                  <KanbanColumn
                    key={col.status}
                    title={col.title}
                    status={col.status}
                    deals={deals}
                    dotColor={col.dotColor}
                    draggingDealId={draggingDealId}
                    onDragStartDeal={setDraggingDealId}
                    onDragEndDeal={() => setDraggingDealId(null)}
                    onDropDeal={handleDropDeal}
                    onSelectDeal={setSelectedDealId}
                  />
                ))}
            </div>

            {/* Desktop Grid View */}
            <div className="hidden md:flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scroll-smooth">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.status}
                  title={col.title}
                  status={col.status}
                  deals={deals}
                  dotColor={col.dotColor}
                  draggingDealId={draggingDealId}
                  onDragStartDeal={setDraggingDealId}
                  onDragEndDeal={() => setDraggingDealId(null)}
                  onDropDeal={handleDropDeal}
                  onSelectDeal={setSelectedDealId}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-t border-outline-variant/10 flex md:hidden justify-around py-3 pb-8">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold font-label">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">brand_awareness</span>
          <span className="text-[10px] font-bold font-label">Deals</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">chat</span>
          <span className="text-[10px] font-bold font-label">Inbox</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold font-label">Settings</span>
        </button>
      </footer>

      {/* Floating Weekly Milestone Card */}
      <div className="fixed bottom-8 right-8 w-80 glass-card p-6 rounded-2xl border border-outline-variant/20 shadow-2xl z-40 hidden md:block">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">trophy</span>
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface">Weekly Milestone</p>
            <p className="font-body text-xs text-secondary">85% of target reach achieved.</p>
          </div>
        </div>
        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-container h-full w-[85%]"></div>
        </div>
      </div>

      {/* Slide-over Modal for Deal Details */}
      {selectedDealId && (
        <CampaignDetailModal
          deal={deals.find((d) => d.id === selectedDealId)!}
          onClose={() => setSelectedDealId(null)}
        />
      )}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          isActionLoading={inquiryActionLoadingId === selectedInquiry.id}
          onClose={() => setSelectedInquiryId(null)}
          onAccept={() => void handleAcceptInquiry(selectedInquiry)}
          onDecline={() => void handleDeclineInquiry(selectedInquiry.id)}
          onRemoveRejected={() => void handleRemoveRejectedInquiry(selectedInquiry.id)}
        />
      )}
    </div>
  );
}
