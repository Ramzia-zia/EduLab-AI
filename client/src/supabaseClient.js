import { createClient } from '@supabase/supabase-js';
import { getConfig } from './config.js';

let client = null;

/** Client Supabase unique ; la session est conservée dans le stockage du navigateur (donc hors ligne aussi). */
export function getSupabase() {
  if (!client) {
    const { supabaseUrl, supabaseAnonKey } = getConfig();
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
