/// Valeurs passées au lancement : --dart-define=URL_API=... (jamais de secret dans le dépôt).
abstract final class Config {
  static const urlApi = String.fromEnvironment('URL_API');
  static const urlSupabase = String.fromEnvironment('URL_SUPABASE');
  static const cleAnonSupabase = String.fromEnvironment('CLE_ANON_SUPABASE');
}
