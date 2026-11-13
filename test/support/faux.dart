// Doublures de test : dépôt en mémoire, faux serveur, faux moteur de simulation.
import 'package:edulab_mobile/core/api_provisoire/api.dart';
import 'package:edulab_mobile/core/api_provisoire/modeles.dart';
import 'package:edulab_mobile/core/labo/moteur.dart';
import 'package:edulab_mobile/features/horsligne/depot_local.dart';

class DepotMemoire implements DepotLocal {
  final tentatives = <String, Tentative>{};
  final evenements = <EvenementTentative>[];
  final envoyes = <String>{};
  final refuses = <String, String>{};
  final packs = <String, ExperiencePack>{};
  List<ExperienceResume> resumes = [];
  Profil? profil;

  @override
  Future<void> creerTentative(Tentative t) async => tentatives[t.id] = t;

  @override
  Future<void> terminerTentative({
    required String id,
    required DateTime fin,
    required String statut,
    int? score,
    Map<String, dynamic>? resultat,
  }) async =>
      tentatives[id] =
          tentatives[id]!.copyWith(fin: fin, statut: statut, score: score, resultat: resultat);

  @override
  Future<void> ajouterEvenement(EvenementTentative e) async => evenements.add(e);

  @override
  Future<int> prochainRang(String tentativeId) async =>
      evenements.where((e) => e.tentativeId == tentativeId).length + 1;

  @override
  Future<Tentative?> lireTentative(String id) async => tentatives[id];

  @override
  Future<List<Tentative>> historique() async => tentatives.values.toList();

  @override
  Future<List<ElementEnvoi>> enAttente(int limite) async {
    final pretes = tentatives.values
        .where((t) => t.statut != 'en_cours' && !envoyes.contains(t.id))
        .toList()
      ..sort((a, b) => a.debut.compareTo(b.debut));
    final elements = <ElementEnvoi>[
      for (final t in pretes.take(limite)) ElementTentative(t),
    ];
    final reste = limite - elements.length;
    if (reste > 0) {
      final ids = {
        for (final t in tentatives.values)
          if (t.statut != 'en_cours') t.id,
      };
      final evs = evenements
          .where((e) => ids.contains(e.tentativeId) && !envoyes.contains(e.id))
          .toList()
        ..sort((a, b) {
          final c = a.tentativeId.compareTo(b.tentativeId);
          return c != 0 ? c : a.rang.compareTo(b.rang);
        });
      elements.addAll(evs.take(reste).map(ElementEvenement.new));
    }
    return elements;
  }

  @override
  Future<int> appliquer(List<ResultatSync> resultats) async {
    var n = 0;
    for (final r in resultats) {
      if (envoyes.add(r.id)) n++;
      if (r.statut == 'refuse') refuses[r.id] = r.code ?? 'refuse';
    }
    return n;
  }

  @override
  Future<int> nombreEnAttente() async => (await enAttente(1 << 30)).length;

  @override
  Future<void> sauverResumes(List<ExperienceResume> r) async => resumes = r;

  @override
  Future<List<ExperienceResume>> lireResumes() async => resumes;

  @override
  Future<void> sauverPack(ExperiencePack pack) async => packs[pack.id] = pack;

  @override
  Future<ExperiencePack?> lirePack(String id) async => packs[id];

  @override
  Future<void> sauverProfil(Profil p) async => profil = p;

  @override
  Future<Profil?> lireProfil() async => profil;
}

/// Faux serveur : accepte tout par défaut, avec des cas préparables.
class FauxServeur implements ApiEdulab {
  final lots = <SyncLot>[];
  final dejaRecus = <String>{};
  final refuses = <String, String>{};
  bool horsLigne = false;
  int? coupureApresLots;

  @override
  Future<List<ResultatSync>> sync(SyncLot lot) async {
    if (horsLigne || (coupureApresLots != null && lots.length >= coupureApresLots!)) {
      throw const ErreurReseau();
    }
    lots.add(lot);
    final ids = [
      for (final t in lot.tentatives) t.id,
      for (final e in lot.evenements) e.id,
    ];
    return [
      for (final id in ids)
        if (refuses.containsKey(id))
          ResultatSync(id: id, statut: 'refuse', code: refuses[id])
        else if (dejaRecus.contains(id))
          ResultatSync(id: id, statut: 'deja_recu')
        else
          ResultatSync(id: id, statut: 'accepte'),
    ];
  }

  @override
  Future<AssistantReponse> assistant(AssistantDemande demande) async =>
      AssistantReponse(
          reponse: 'Ralentis près de l\'équivalence.',
          niveauIndice: demande.niveauIndice,
          source: 'ia');

  @override
  Future<Profil> moi() async => throw UnimplementedError();
  @override
  Future<List<ExperienceResume>> experiences({String? matiere, String? niveau}) async =>
      throw UnimplementedError();
  @override
  Future<ExperiencePack> pack(String id) async => throw UnimplementedError();
  @override
  Future<PageListe<Tentative>> tentatives({int page = 1, int taille = 50}) async =>
      throw UnimplementedError();
}

/// Faux moteur : valeurs fixes de test, SANS formule. Ne remplace pas labo_core.
class MoteurFactice implements MoteurTitrage {
  @override
  SessionTitrage demarrer() => _SessionFactice();
}

class _SessionFactice implements SessionTitrage {
  @override
  double get volumeEquivalentMl => 16.0;
  @override
  double get volumeMaxMl => 25.0;
  @override
  double debitMlParS(double niveauRobinet) => niveauRobinet * 1.0;
  @override
  double ph(double volumeVerseMl) => 3.0;
  @override
  bool procheEquivalence(double volumeVerseMl) => false;
}

const definitionTitrage = <String, dynamic>{
  'id': 'titrage_acide_base',
  'matiere': 'chimie',
  'niveau': 'terminale',
  'materiel': ['lunettes', 'burette', 'soude', 'erlenmeyer', 'pipette', 'phenolphtaleine'],
  'securite': [
    {
      'regle_id': 'lunettes_avant_soude',
      'avant': 'verser_soude',
      'exige': 'lunettes',
      'message': 'La soude peut abîmer les yeux. Mets d\'abord tes lunettes.',
    },
  ],
  'conseils': [
    {
      'quand': 'volume_proche_equivalence',
      'niveau': 'avertissement',
      'message': 'Tu approches de l\'équivalence. Ralentis : goutte à goutte.',
    },
  ],
  'calcul': 'titrage',
};

Tentative tentativeTerminee(String id, DateTime debut) => Tentative(
      id: id,
      experienceId: 'titrage_acide_base',
      versionExperience: 1,
      debut: debut,
      fin: debut.add(const Duration(minutes: 5)),
      statut: 'terminee',
    );

EvenementTentative evenement(String tentativeId, int rang) => EvenementTentative(
      id: '$tentativeId-ev$rang',
      tentativeId: tentativeId,
      rang: rang,
      horodatage: DateTime.utc(2026, 11, 11, 8, 0, rang),
      action: 'placer_materiel',
      valeurs: const {'materiel_id': 'lunettes'},
    );
