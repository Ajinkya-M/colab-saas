'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BrandLogo from '@/components/BrandLogo';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // In a real app, we might wait for email confirmation, 
      // but for this "orchestration", we'll redirect to dashboard.
      router.push('/dashboard');
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setOauthLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      {/* --- DESKTOP VIEW (lg and above) --- */}
      <main className="hidden lg:flex flex-1 overflow-hidden flex-row">
        {/* Left Side: Branded Section */}
        <section className="w-1/2 editorial-gradient relative flex-col justify-between p-20 text-on-primary overflow-hidden min-h-screen hidden lg:flex">
          {/* Background Decoration (Abstract Pattern) */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg height="100%" viewBox="0 0 800 800" width="100%" xmlns="http://www.w3.org/2000/svg">
              <circle cx="400" cy="400" fill="none" r="300" stroke="white" strokeWidth="2"></circle>
              <circle cx="400" cy="400" fill="none" r="150" stroke="white" strokeWidth="1"></circle>
              <line stroke="white" strokeWidth="1" x1="0" x2="800" y1="400" y2="400"></line>
              <line stroke="white" strokeWidth="1" x1="400" x2="400" y1="0" y2="800"></line>
            </svg>
          </div>
          
          {/* Header/Logo Area */}
          <div className="z-10">
            <BrandLogo className="h-10 w-auto brightness-0 invert" alt="Spark" />
          </div>
          
          {/* Testimonial Content */}
          <div className="z-10 max-w-lg relative">
            <div className="mb-8">
              <span className="material-symbols-outlined text-4xl opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            </div>
            <p className="font-headline text-4xl leading-tight font-bold mb-10">
              Managing brand deals has never been more transparent and effortless.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-lowest flex-shrink-0">
                <img className="w-full h-full object-cover" alt="Rising Creator portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDni2VBl8-sShDxEMBviPNe5qztCkHQZ-Obt8YAfD-_d8wADAKXaZQ_7d7esCyJ9Un6a7O2UH07HNc1_m-Nk05sWoaiG9UtUEqhDZS8Oj99ni9hdmy_ev2sU_z4nZKWQTEElXCD1YqfQ_KXeUlnHxjbx7Iax8n7oUlUtIPVgN7XJSEjl06S0z1qJnO9VtAHzvRHnSSWp3_TwjOzv33GFBpsUKJ2MwFIvQfop_fW12QTLRSqmtRHf8n9M2ygccmnBZDpDh8aLGmFFOMX" />
              </div>
              <div>
                <p className="font-bold text-lg">Rising Creator</p>
                <p className="text-sm opacity-80 uppercase tracking-widest font-label">Top Tier Partner</p>
              </div>
            </div>
            
            {/* Glowing Overlapping Card */}
            <div className="absolute bottom-[-15%] right-[-15%] glass-card p-10 rounded-xl max-w-sm border border-white/20 z-20">
              <p className="text-on-surface font-headline font-bold text-xl mb-4">Milestone Achieved</p>
              <div className="flex items-end gap-2 text-primary">
                <span className="text-4xl font-extrabold">$12.4k</span>
                <span className="font-label uppercase text-xs pb-1 tracking-wider opacity-60">Revenue this month</span>
              </div>
              <div className="mt-6 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full editorial-gradient w-[85%] rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Signup Form */}
        <section className="w-1/2 bg-surface-container-lowest flex items-center justify-center p-20">
          <div className="w-full max-w-[440px] flex flex-col">
            <div className="mb-10 text-left">
              <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight mb-2">Create your account</h2>
              <p className="text-secondary font-body">Join the elite network of professional creators.</p>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-6 ghost-border rounded-md hover:bg-surface transition-colors duration-200 ambient-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-medium text-on-surface">
                {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
              </span>
            </button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full ghost-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-label">
                <span className="bg-surface-container-lowest px-4 text-outline">or</span>
              </div>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg mb-4 border border-error/10">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider" htmlFor="desktop-name">Full Name</label>
                <input 
                  className="w-full px-4 py-3 bg-surface-container-lowest ghost-border rounded-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200" 
                  id="desktop-name" 
                  name="name" 
                  placeholder="Alex Sterling" 
                  required 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider" htmlFor="desktop-email">Email Address</label>
                <input 
                  className="w-full px-4 py-3 bg-surface-container-lowest ghost-border rounded-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200" 
                  id="desktop-email" 
                  name="email" 
                  placeholder="alex@studio.co" 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider" htmlFor="desktop-password">Password</label>
                <input 
                  className="w-full px-4 py-3 bg-surface-container-lowest ghost-border rounded-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200" 
                  id="desktop-password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button 
                className="w-full mt-8 py-4 editorial-gradient text-on-primary rounded-full font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
            
            <div className="mt-10 text-center">
              <p className="text-secondary font-body">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline ml-1" href="/login">Log In</Link>
              </p>
            </div>
            
            <div className="mt-auto pt-10 text-center">
              <p className="text-[10px] text-outline uppercase tracking-widest font-label leading-relaxed">
                By signing up, you agree to our <Link className="hover:text-primary underline decoration-primary/20" href="#">Terms of Service</Link> <br /> and <Link className="hover:text-primary underline decoration-primary/20" href="#">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer for Desktop */}
      <footer className="hidden lg:flex bg-surface-container-lowest border-t border-outline-variant/20 w-full py-8 mt-auto">
        <div className="flex justify-between items-center px-10 w-full max-w-screen-2xl mx-auto">
          <p className="text-secondary font-body text-sm tracking-wide">© 2024 The Editorial Authority. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link className="text-secondary font-body text-sm tracking-wide hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</Link>
            <Link className="text-secondary font-body text-sm tracking-wide hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</Link>
            <Link className="text-secondary font-body text-sm tracking-wide hover:underline opacity-80 hover:opacity-100 transition-opacity" href="#">Support</Link>
          </div>
        </div>
      </footer>

      {/* --- MOBILE VIEW (below lg) --- */}
      <main className="flex lg:hidden flex-col items-center">
        {/* Header Section */}
        <header className="w-full pt-12 pb-8 px-6 flex flex-col items-center text-center">
          <div className="mb-8">
            <BrandLogo className="h-8 w-auto" alt="Spark" />
          </div>
          <h1 className="font-headline text-[2.5rem] font-bold leading-tight tracking-tight text-on-surface mb-6">
            Create your account
          </h1>
          {/* Milestone Social Proof Element */}
          <div className="w-full max-w-sm glass-card ambient-shadow rounded-xl p-4 flex items-center gap-4 ghost-border">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div className="text-left">
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Milestone Achieved</p>
              <p className="font-body text-sm font-medium">Join 25,000+ elite creators today</p>
            </div>
          </div>
        </header>
        
        {/* Form Section */}
        <section className="w-full max-w-md px-6 pb-20">
          <div className="bg-surface-container-lowest rounded-xl p-8 ambient-shadow ghost-border">
            {/* Social Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-md ghost-border hover:bg-surface-container-low transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-body font-semibold text-on-surface">
                {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
              </span>
            </button>
            
            <div className="flex items-center my-8">
              <div className="flex-grow h-px bg-outline-variant opacity-20"></div>
              <span className="px-4 font-label text-[10px] uppercase tracking-widest text-outline">OR REGISTER WITH EMAIL</span>
              <div className="flex-grow h-px bg-outline-variant opacity-20"></div>
            </div>
            
            {/* Registration Form */}
            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg mb-4 border border-error/10">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant" htmlFor="mobile-name">Full Name</label>
                <input 
                  className="w-full bg-surface-container-lowest ghost-border rounded-md px-4 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface placeholder:text-outline-variant" 
                  id="mobile-name" 
                  placeholder="Enter your name" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant" htmlFor="mobile-email">Email Address</label>
                <input 
                  className="w-full bg-surface-container-lowest ghost-border rounded-md px-4 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface placeholder:text-outline-variant" 
                  id="mobile-email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant" htmlFor="mobile-password">Password</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-lowest ghost-border rounded-md px-4 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-on-surface placeholder:text-outline-variant" 
                    id="mobile-password" 
                    placeholder="Min. 8 characters" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  className="w-full editorial-gradient text-on-primary py-5 rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-150 disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
              </div>
            </form>
            
            {/* Redirect */}
            <div className="mt-8 text-center">
              <p className="font-body text-sm text-on-surface-variant">
                  Already have an account? 
                  <Link className="text-primary font-bold hover:underline ml-1" href="/login">Log in</Link>
              </p>
            </div>
          </div>
          
          {/* Legal Footer */}
          <footer className="mt-12 text-center">
            <p className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                © 2024 THE EDITORIAL AUTHORITY
            </p>
            <div className="mt-4 flex justify-center gap-6">
              <Link className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-primary transition-colors" href="#">Privacy</Link>
              <Link className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-primary transition-colors" href="#">Terms</Link>
              <Link className="font-label text-[10px] uppercase tracking-widest font-semibold text-slate-400 hover:text-primary transition-colors" href="#">Support</Link>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
