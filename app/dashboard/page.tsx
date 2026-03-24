'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import KanbanColumn from '@/components/dashboard/KanbanColumn';
import { MOCK_DEALS, Deal } from '@/data/mockDeals';

const columns = [
  { title: 'New Inquiries', status: 'inquiry' as const, dotColor: 'bg-blue-400' },
  { title: 'Negotiating', status: 'negotiating' as const, dotColor: 'bg-amber-400' },
  { title: 'Contract Signed', status: 'contract_signed' as const, dotColor: 'bg-tertiary' },
  { title: 'In Production', status: 'in_production' as const, dotColor: 'bg-primary' },
];

export default function DashboardPage() {
  const [deals] = useState<Deal[]>(MOCK_DEALS);

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
              <p className="text-sm font-bold text-on-surface font-headline">Alex Sterling</p>
              <p className="text-[10px] text-secondary font-body font-medium">Pro Creator</p>
            </div>
            <img
              alt="User Profile Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbxMJ_KrbFXyZsFcYeC5wcE82NqgLGJG7K5Z2Ulut0osREdurTDwLQ5JYioMm3-RE_spM0VLSWTEvyjSae8kG4e1sGGaYIq4n_2i1V7dx6Nu9k-3xrysmAPO52DCNleQLKsi3alX8b0bJ-M26FzLeOVLx9_ufEuhDhupw5q2uKAqobwnn_oRHf9j3H8I-JP9cpUODm1HkNcbVAdX0Klt-UFHXSgNYPSj3KUXQJBEIrUgePdyJu7WsMzgn8CkzxhyvMNqdj4U1K7G9x"
            />
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
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scroll-smooth">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              deals={deals}
              dotColor={col.dotColor}
            />
          ))}
        </div>
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
