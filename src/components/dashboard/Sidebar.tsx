'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  activePage?: string;
}

const navItems = [
  { icon: 'home', label: 'Home', href: '/dashboard' },
  { icon: 'chat_bubble', label: 'Messages', href: '#' },
  { icon: 'description', label: 'Contracts', href: '#' },
  { icon: 'receipt_long', label: 'Invoices', href: '#' },
  { icon: 'settings', label: 'Settings', href: '#' },
];

export default function Sidebar({ activePage = 'Home' }: SidebarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-surface-container-low border-r border-outline-variant/20 flex flex-col p-4 gap-y-2 font-body text-sm font-medium">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined">edit_square</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-on-surface leading-tight">The Editorial Authority</h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">Creator Studio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ease-in-out hover:translate-x-1 ${
              activePage === item.label
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-gray-500 hover:bg-gray-200/50'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {/* New Project Button */}
        <button className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <span className="material-symbols-outlined">add</span>
          <span>New Project</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
