import { createBrowserClient } from "@supabase/ssr";

const getEnvVar = (viteKey: string, nextKey: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env && process.env[nextKey]) {
    return process.env[nextKey];
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

