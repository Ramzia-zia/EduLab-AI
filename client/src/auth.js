import { getMeta, setMeta } from './storage/idb.js';
import { getSupabase } from './supabaseClient.js';

const PROFILE_META_KEY = 'profile';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

/**
 * @param {object} input
 * @param {'student'|'teacher'} input.role
 */
export async function signUp({ email, password, fullName, role = 'student', gradeLevel }) {
  const data = unwrap(
    await getSupabase().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, grade_level: gradeLevel ?? null } },
    }),
  );
  return data.user;
}

export async function signIn({ email, password }) {
  const data = unwrap(await getSupabase().auth.signInWithPassword({ email, password }));
  return data.user;
}

export async function signOut() {
  unwrap({ error: (await getSupabase().auth.signOut()).error });
}

/** Lit la session conservée localement : fonctionne sans connexion. */
export async function getSession() {
  return unwrap(await getSupabase().auth.getSession()).session;
}

export async function getCurrentUserId() {
  return (await getSession())?.user?.id ?? null;
}

export async function getAccessToken() {
  return (await getSession())?.access_token ?? null;
}

/**
 * Profil de l'utilisateur connecté. Mis en cache localement après chaque
 * lecture réussie, pour rester disponible hors ligne.
 */
export async function getProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const profile = unwrap(
      await getSupabase()
        .from('profiles')
        .select('id, full_name, role, grade_level, school')
        .eq('id', userId)
        .single(),
    );
    await setMeta(PROFILE_META_KEY, profile);
    return profile;
  } catch (error) {
    const cached = await getMeta(PROFILE_META_KEY);
    if (cached?.id === userId) return cached;
    throw error;
  }
}

/** @returns {() => void} fonction de désabonnement */
export function onAuthChange(listener) {
  const { data } = getSupabase().auth.onAuthStateChange((event, session) => listener(event, session));
  return () => data.subscription.unsubscribe();
}
