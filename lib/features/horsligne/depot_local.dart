import '../../core/api_provisoire/modeles.dart';

sealed class ElementEnvoi {
  const ElementEnvoi();
}

class ElementTentative extends ElementEnvoi {
  const ElementTentative(this.tentative);
  final Tentative tentative;
}

class ElementEvenement extends ElementEnvoi {
  const ElementEvenement(this.evenement);
  final EvenementTentative evenement;
}

/// Stockage local (drift/SQLite en production, mémoire dans les tests).
abstract interface class DepotLocal {
  // Tentatives faites sur le téléphone
  Future<void> creerTentative(Tentative tentative);
  Future<void> terminerTentative({
    required String id,
    required DateTime fin,
    required String statut,
    int? score,
    Map<String, dynamic>? resultat,
  });
  Future<void> ajouterEvenement(EvenementTentative evenement);
  Future<int> prochainRang(String tentativeId);
  Future<Tentative?> lireTentative(String id);
  Future<List<Tentative>> historique();

  // File d'envoi : tentatives terminées d'abord, puis événements par tentative et par rang.
  Future<List<ElementEnvoi>> enAttente(int limite);

  /// Applique la réponse du serveur. Retourne le nombre de lignes marquées.
  Future<int> appliquer(List<ResultatSync> resultats);
  Future<int> nombreEnAttente();

  // Cache pour le mode hors-ligne
  Future<void> sauverResumes(List<ExperienceResume> resumes);
  Future<List<ExperienceResume>> lireResumes();
  Future<void> sauverPack(ExperiencePack pack);
  Future<ExperiencePack?> lirePack(String id);
  Future<void> sauverProfil(Profil profil);
  Future<Profil?> lireProfil();
}
