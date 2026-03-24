'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);

  async function handleGoogleLogin() {
    setLoadingProvider('google');
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoadingProvider(null);
    }
  }

  async function handleFacebookLogin() {
    setLoadingProvider('facebook');
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoadingProvider(null);
    }
  }

  return (
    <main className="bg-surface font-body text-on-surface selection:bg-primary-fixed-dim min-h-screen">
      
      {/* --- DESKTOP VIEW (lg and above) --- */}
      <div className="hidden lg:flex min-h-screen flex-row">
        {/* Left Side: Branded Editorial Section (50/50 Split) */}
        <section className="editorial-gradient w-1/2 min-h-screen relative flex items-center justify-center p-20 overflow-hidden">
          {/* Abstract Background Pattern Decor */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" viewBox="0 0 800 800" width="100%" xmlns="http://www.w3.org/2000/svg">
              <circle cx="400" cy="400" fill="none" r="300" stroke="white" strokeDasharray="10 20" strokeWidth="1"></circle>
              <circle cx="100" cy="100" fill="none" r="150" stroke="white" strokeWidth="0.5"></circle>
              <rect fill="none" height="200" stroke="white" strokeWidth="1" transform="rotate(45 600 700)" width="200" x="500" y="600"></rect>
            </svg>
          </div>
          <div className="relative z-10 max-w-lg">
            {/* Brand Anchor Title */}
            <div className="mb-12">
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white">The Editorial Authority</h1>
            </div>
            {/* Glowing Testimonial Quote */}
            <div className="glass-card p-8 rounded-xl ambient-shadow border border-white/20 transform translate-x-12">
              <span className="material-symbols-outlined text-primary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
              <p className="font-headline text-2xl font-semibold text-on-surface leading-tight mb-6 italic">
                The only platform that truly understands the creator workflow.
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-white overflow-hidden">
                  <img alt="Creator Portrait" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoztReKEc1pUWaJtPtvdz0AbTkSy8uW8lt6XMGgUN4ArVa1xXTepff3yW89IiVNY2PP2Awt7OSbgOGteNdrpFZytBGJeclArw0J7_KO_bhLV0_KP2RFibvuznI-vU81SPE8PlGaOLHBzh_MkTpGmy4jIx8XLgc7qHPUUGDKdLsNZtzi0oHD2YB9KqLufe5c47h6CiIQyIqf-Wi-S-lWYV_MWwou6ABf3HoYguj9empC9Jav81FNa7RjyHZEbrKxg6Ux4vugJMzTlk5" />
                </div>
                <div>
                  <p className="font-label text-sm font-bold text-primary uppercase tracking-wider">Top Creator</p>
                  <p className="text-on-surface-variant text-sm">Verified Power User</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Authentication Form Section */}
        <section className="w-1/2 bg-surface-container-lowest flex items-center justify-center p-20">
          <div className="w-full max-w-md space-y-10">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Welcome back</h2>
              <p className="text-on-surface-variant font-body">Continue your creative journey where you left off.</p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg border border-error/10">
                {error}
              </div>
            )}

            {/* Social Login Options */}
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-surface-container-lowest border border-outline-variant/20 rounded-xl ambient-shadow font-label font-semibold text-on-surface hover:bg-surface-container-low transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {loadingProvider === 'google' ? (
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                )}
                Continue with Google
              </button>

              <button 
                type="button" 
                onClick={handleFacebookLogin} 
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-surface-container-lowest border border-outline-variant/20 rounded-xl ambient-shadow font-label font-semibold text-on-surface hover:bg-surface-container-low transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {loadingProvider === 'facebook' ? (
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                Continue with Facebook
              </button>
            </div>
            
            {/* Footer Links */}
            <p className="text-center font-body text-sm text-on-surface-variant">
              Don&apos;t have an account? 
              <Link className="font-bold text-primary hover:underline ml-1" href="/signup">Get Started</Link>
            </p>
          </div>
        </section>
      </div>

      {/* --- MOBILE VIEW (below lg) --- */}
      <div className="flex lg:hidden flex-col min-h-screen">
        <header className="editorial-gradient relative overflow-hidden pt-12 pb-20 px-8 flex flex-col items-center justify-center text-center">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>
          <div className="relative z-10 mb-8">
            <h1 className="font-headline font-extrabold text-2xl tracking-tighter text-on-primary uppercase mb-2">THE EDITORIAL AUTHORITY</h1>
            <div className="h-1 w-12 bg-tertiary-fixed mx-auto rounded-full"></div>
          </div>
          <div className="relative z-10 glass-card p-6 rounded-xl ambient-shadow max-w-xs mx-auto transform -rotate-1">
            <div className="flex items-center gap-3 mb-3">
              <img alt="Creator Profile" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5BGsGm3WNWS2IK81vYWZMfFvTiWWa7oeDEO-NUQWJSgLbRo_TyKnn2iCIs2EltBvv1nowTsjWgkvJkzIkUfVGcTXP9zwT9nV9oUuwC9dIunTmWR90CbGnotysMlHiPAhli2jpC3hS1bRCljE1obfk0-ulCyi1druGxfnsREN_byU2DKNkB1OS-fn_MXdR7ZqDoworYxpnDvvtZJnE4_dRRE_oB-yDJpFdvLlokQMUOZ-uoEcRvNYh9xwGzfKcKpVvrDxEGokePXDp"/>
              <div className="text-left">
                <p className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">Featured Creator</p>
                <p className="font-headline font-bold text-sm text-on-surface">Elena Vance</p>
              </div>
            </div>
            <p className="text-sm italic leading-relaxed text-on-surface-variant">
              &quot;This platform redefined how I curate my digital presence. Absolute authority in editorial design.&quot;
            </p>
          </div>
        </header>
        <section className="flex-grow bg-surface-container-lowest -mt-8 rounded-t-[2.5rem] relative z-20 px-8 pt-12 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center">
              <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Welcome Back</h2>
              <p className="text-on-surface-variant text-sm">Enter your credentials to access your studio</p>
            </div>
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg mb-6 border border-error/10">
                  {error}
                </div>
              )}

              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl font-label font-semibold text-on-surface hover:bg-surface-container-low transition-colors ambient-shadow active:scale-[0.98] duration-150 disabled:opacity-50"
              >
                {loadingProvider === 'google' ? (
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <button 
                type="button" 
                onClick={handleFacebookLogin} 
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl font-label font-semibold text-on-surface hover:bg-surface-container-low transition-colors ambient-shadow active:scale-[0.98] duration-150 disabled:opacity-50"
              >
                {loadingProvider === 'facebook' ? (
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <span>Continue with Facebook</span>
              </button>
            </div>
            <div className="mt-12 text-center">
              <p className="text-sm text-on-surface-variant">
                  New to the atelier? 
                  <Link className="text-primary font-bold hover:underline ml-1" href="/signup">Request Access</Link>
              </p>
            </div>
          </div>
        </section>
        <footer className="w-full flex flex-col items-center gap-4 px-8 py-8 bg-surface-container-low">
          <div className="flex gap-6">
            <Link className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-primary transition-colors" href="#">Support</Link>
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400">© 2024 THE EDITORIAL AUTHORITY</p>
        </footer>
      </div>

    </main>
  );
}
