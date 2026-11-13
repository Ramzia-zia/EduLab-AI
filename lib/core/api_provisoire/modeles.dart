// COUCHE PROVISOIRE : écart assumé avec la règle « jamais de modèle écrit à la main ».
// Ces classes recopient CONTRAT.md v0.1 (chapitre 3, « Modèles ») faute d'openapi.json.
// À SUPPRIMER dès que le client Dart généré (edulab_api) est disponible :
// seul ce dossier change, les écrans n'en dépendent qu'à travers api.dart.

DateTime _date(Object? v) => DateTime.parse(v as String).toUtc();
String _iso(DateTime d) => d.toUtc().toIso8601String();

class Profil {
  const Profil({
    required this.id,
    required this.nom,
    required this.role,
    this.etablissementId,
  });

  final String id;
  final String nom;
  final String role;
  final String? etablissementId;

  factory Profil.fromJson(Map<String, dynamic> j) => Profil(
        id: j['id'] as String,
        nom: j['nom'] as String,
        role: j['role'] as String,
        etablissementId: j['etablissement_id'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'nom': nom,
        'role': role,
        'etablissement_id': etablissementId,
      };
}

class ExperienceResume {
  const ExperienceResume({
    required this.id,
    required this.matiere,
    required this.niveau,
    required this.titre,
    required this.dureeMin,
    required this.difficulte,
    required this.version,
    required this.etat,
  });

  final String id;
  final String matiere;
  final String niveau;
  final String titre;
  final int dureeMin;
  final String difficulte;
  final int version;
  final String etat; // a_commencer | en_cours | termine

  factory ExperienceResume.fromJson(Map<String, dynamic> j) => ExperienceResume(
        id: j['id'] as String,
        matiere: j['matiere'] as String,
        niveau: j['niveau'] as String,
        titre: j['titre'] as String,
        dureeMin: j['duree_min'] as int,
        difficulte: j['difficulte'] as String,
        version: j['version'] as int,
        etat: j['etat'] as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'matiere': matiere,
        'niveau': niveau,
        'titre': titre,
        'duree_min': dureeMin,
        'difficulte': difficulte,
        'version': version,
        'etat': etat,
      };
}

class ExperiencePack {
  const ExperiencePack({
    required this.id,
    required this.version,
    required this.definition,
  });

  final String id;
  final int version;
  final Map<String, dynamic> definition;

  factory ExperiencePack.fromJson(Map<String, dynamic> j) => ExperiencePack(
        id: j['id'] as String,
        version: j['version'] as int,
        definition: (j['definition'] as Map).cast<String, dynamic>(),
      );

  Map<String, dynamic> toJson() =>
      {'id': id, 'version': version, 'definition': definition};
}

class Tentative {
  const Tentative({
    required this.id,
    required this.experienceId,
    required this.versionExperience,
    required this.debut,
    this.fin,
    required this.statut,
    this.score,
    this.resultat,
  });

  final String id;
  final String experienceId;
  final int versionExperience;
  final DateTime debut;
  final DateTime? fin;
  final String statut; // en_cours | terminee | abandonnee
  final int? score;
  final Map<String, dynamic>? resultat;

  Tentative copyWith({
    DateTime? fin,
    String? statut,
    int? score,
    Map<String, dynamic>? resultat,
  }) =>
      Tentative(
        id: id,
        experienceId: experienceId,
        versionExperience: versionExperience,
        debut: debut,
        fin: fin ?? this.fin,
        statut: statut ?? this.statut,
        score: score ?? this.score,
        resultat: resultat ?? this.resultat,
      );

  factory Tentative.fromJson(Map<String, dynamic> j) => Tentative(
        id: j['id'] as String,
        experienceId: j['experience_id'] as String,
        versionExperience: j['version_experience'] as int,
        debut: _date(j['debut']),
        fin: j['fin'] == null ? null : _date(j['fin']),
        statut: j['statut'] as String,
        score: j['score'] as int?,
        resultat: (j['resultat'] as Map?)?.cast<String, dynamic>(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'experience_id': experienceId,
        'version_experience': versionExperience,
        'debut': _iso(debut),
        'fin': fin == null ? null : _iso(fin!),
        'statut': statut,
        'score': score,
        'resultat': resultat,
      };
}

class EvenementTentative {
  const EvenementTentative({
    required this.id,
    required this.tentativeId,
    required this.rang,
    required this.horodatage,
    required this.action,
    required this.valeurs,
  });

  final String id;
  final String tentativeId;
  final int rang;
  final DateTime horodatage;
  final String action;
  final Map<String, dynamic> valeurs;

  factory EvenementTentative.fromJson(Map<String, dynamic> j) =>
      EvenementTentative(
        id: j['id'] as String,
        tentativeId: j['tentative_id'] as String,
        rang: j['rang'] as int,
        horodatage: _date(j['horodatage']),
        action: j['action'] as String,
        valeurs: (j['valeurs'] as Map).cast<String, dynamic>(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'tentative_id': tentativeId,
        'rang': rang,
        'horodatage': _iso(horodatage),
        'action': action,
        'valeurs': valeurs,
      };
}

class SyncLot {
  const SyncLot({required this.tentatives, required this.evenements});

  final List<Tentative> tentatives;
  final List<EvenementTentative> evenements;

  Map<String, dynamic> toJson() => {
        'tentatives': [for (final t in tentatives) t.toJson()],
        'evenements': [for (final e in evenements) e.toJson()],
      };
}

class ResultatSync {
  const ResultatSync({required this.id, required this.statut, this.code});

  final String id;
  final String statut; // accepte | refuse | deja_recu
  final String? code;

  factory ResultatSync.fromJson(Map<String, dynamic> j) => ResultatSync(
        id: j['id'] as String,
        statut: j['statut'] as String,
        code: j['code'] as String?,
      );
}

class MessageAssistant {
  const MessageAssistant({required this.role, required this.contenu});

  final String role;
  final String contenu;

  Map<String, dynamic> toJson() => {'role': role, 'contenu': contenu};
}

class AssistantDemande {
  const AssistantDemande({
    required this.experienceId,
    required this.tentativeId,
    required this.niveauIndice,
    required this.message,
    required this.historique,
    required this.etatExperience,
    this.derniereErreur,
  });

  final String experienceId;
  final String tentativeId;
  final int niveauIndice;
  final String message; // 1000 caractères au plus
  final List<MessageAssistant> historique; // 6 messages au plus
  final Map<String, dynamic> etatExperience;
  final String? derniereErreur;

  Map<String, dynamic> toJson() => {
        'experience_id': experienceId,
        'tentative_id': tentativeId,
        'niveau_indice': niveauIndice,
        'message': message,
        'historique': [for (final m in historique) m.toJson()],
        'etat_experience': etatExperience,
        'derniere_erreur': derniereErreur,
      };
}

class AssistantReponse {
  const AssistantReponse({
    required this.reponse,
    required this.niveauIndice,
    required this.source,
  });

  final String reponse; // 120 mots au plus
  final int niveauIndice;
  final String source; // ia | regles

  factory AssistantReponse.fromJson(Map<String, dynamic> j) => AssistantReponse(
        reponse: j['reponse'] as String,
        niveauIndice: j['niveau_indice'] as int,
        source: j['source'] as String,
      );
}

class PageListe<T> {
  const PageListe({
    required this.elements,
    required this.page,
    required this.taille,
    required this.total,
  });

  final List<T> elements;
  final int page;
  final int taille;
  final int total;
}

/// Format d'erreur unique du contrat : {code, message, details}.
class ErreurApi implements Exception {
  const ErreurApi({
    required this.code,
    required this.message,
    this.details = const {},
    this.statutHttp,
  });

  final String code;
  final String message;
  final Map<String, dynamic> details;
  final int? statutHttp;

  factory ErreurApi.depuisJson(Map<String, dynamic> j, int statutHttp) =>
      ErreurApi(
        code: j['code'] as String? ?? 'erreur_serveur',
        message: j['message'] as String? ?? 'Une erreur est survenue.',
        details: (j['details'] as Map?)?.cast<String, dynamic>() ?? const {},
        statutHttp: statutHttp,
      );

  @override
  String toString() => 'ErreurApi($code: $message)';
}

/// Pas de réseau (ou serveur injoignable) : on bascule en mode hors-ligne.
class ErreurReseau implements Exception {
  const ErreurReseau();

  @override
  String toString() => 'ErreurReseau';
}
