import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const getURL = () => {
  // In the browser, always trust the current origin so deployed apps never fall back to localhost.
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : null;

  let url =
    browserOrigin ??
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Optional explicit production URL.
    process?.env?.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? // Optional Vercel production domain.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Optional Vercel deployment domain.
    'http://localhost:3000/';

  // Make sure to include `https://` when protocol is not already present.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  if (typeof window !== 'undefined') {
    // Helpful in production to confirm which URL is used for OAuth redirects.
    console.info('[auth] computed OAuth redirect base URL:', url);
  }
  return url;
};
  
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
