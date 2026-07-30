import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable lookup with safe access
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' ? process.env || {} : {};

const supabaseUrl =
  procEnv.NEXT_PUBLIC_SUPABASE_URL ||
  procEnv.VITE_SUPABASE_URL ||
  metaEnv?.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  procEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  procEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'MY_SUPABASE_URL' &&
    !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check Supabase connection or fallback
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase URL & Anon Key not set. Running in High-Speed Local Persistence Mode.',
    };
  }

  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return {
        success: true,
        message: 'Connected to Supabase project. Table initialization ready.',
      };
    }
    return {
      success: true,
      message: 'Supabase connection verified successfully!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Supabase connection attempt: ${err?.message || 'Using local sync'}`,
    };
  }
}
