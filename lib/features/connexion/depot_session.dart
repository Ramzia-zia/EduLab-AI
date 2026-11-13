/// Connexion Supabase vue de l'application (interface, pour pouvoir la remplacer dans les tests).
abstract interface class DepotSession {
  String? get jeton;
  Future<void> connecter(String email, String motDePasse);
  Future<void> deconnecter();
}
