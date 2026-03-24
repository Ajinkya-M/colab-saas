'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import KanbanColumn from '@/components/dashboard/KanbanColumn';
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
};

type StageRow = {
  id: string;
  key: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [stageIdByStatus, setStageIdByStatus] = useState<Partial<Record<DealStatus, string>>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

          return {
            id: deal.id,
            brandName: 'Brand Partner',
            projectName: deal.title,
            description: deal.description ?? 'No description yet.',
            budget: Number.isFinite(normalizedBudget) ? normalizedBudget : 0,
            status,
            priority: deal.priority === 'high' || deal.priority === 'medium' || deal.priority === 'low' ? deal.priority : 'medium',
            icon: 'work',
            contactAvatar: FALLBACK_AVATAR,
          };
        })
        .filter((deal): deal is Deal => deal !== null);

      setDeals(mappedDeals);
      setDealsLoading(false);
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

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Sidebar */}
      <Sidebar activePage="Home" />

      {/* Top Navigation */}
      <header className="fixed top-0 right-0 left-64 z-40 bg-surface flex justify-between items-center px-8 py-4">
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

      {/* Main Content */}
      <main className="ml-64 pt-24 min-h-screen px-8 pb-8">
        {/* Page Title */}
        <div className="mb-10">
          <h2 className="font-headline text-5xl font-bold tracking-tight text-on-surface mb-2">Editorial Pipeline</h2>
          <p className="font-body text-secondary text-lg">Manage your creative workflow and brand partnerships.</p>
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
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scroll-smooth">
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
              />
            ))}
          </div>
        )}
      </main>

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
    </div>
  );
}
