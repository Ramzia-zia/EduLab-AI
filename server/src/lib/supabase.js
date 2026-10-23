import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase agissant AU NOM de l'utilisateur : le jeton est transmis à
 * PostgREST, donc les règles RLS de la base s'appliquent à chaque requête.
 * Le serveur n'utilise volontairement aucune clé « service role ».
 */
export function createUserClient(config, accessToken) {
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
