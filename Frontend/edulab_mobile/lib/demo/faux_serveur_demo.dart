import 'dart:async';

import '../core/api_provisoire/api.dart';
import '../core/api_provisoire/modeles.dart';
import '../features/connexion/depot_session.dart';
import '../features/horsligne/depot_local.dart';
import 'donnees_demo.dart';

class SessionDemo implements DepotSession {
  String? _jeton;

  @override
  String? get jeton => _jeton;

  @override
  Future<void> connecter(String email, String motDePasse) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    _jeton = 'demo';
  }

  @override
  Future<void> deconnecter() async => _jeton = null;
}

class ApiDemo implements ApiEdulab {
  @override
  Future<Profil> moi() async => profilDemo;

  @override
  Future<List<ExperienceResume>> experiences(
      {String? matiere, String? niveau}) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return [
      for (final resume in resumesDemo)
        if ((matiere == null || resume.matiere == matiere) &&
            (niveau == null || resume.niveau == niveau))
          resume,
    ];
  }

  @override
  Future<ExperiencePack> pack(String id) async => throw const ErreurApi(
        code: 'pack_indisponible',
        message: 'Les simulations sont chargées depuis l’interface web.',
        statutHttp: 404,
      );

  @override
  Future<List<ResultatSync>> sync(SyncLot lot) async => [
        for (final t in lot.tentatives)
          ResultatSync(id: t.id, statut: 'accepte'),
        for (final e in lot.evenements)
          ResultatSync(id: e.id, statut: 'accepte'),
      ];

  @override
  Future<PageListe<Tentative>> tentatives(
      {int page = 1, int taille = 50}) async {
    final liste = [
      Tentative(
        id: 'h1',
        experienceId: 'mesure_ph',
        versionExperience: 1,
        debut: DateTime.now().toUtc().subtract(const Duration(days: 2)),
        statut: 'terminee',
        score: 85,
      ),
      Tentative(
        id: 'h2',
        experienceId: 'titrage_acide_base',
        versionExperience: 1,
        debut: DateTime.now().toUtc().subtract(const Duration(days: 1)),
        statut: 'abandonnee',
      ),
    ];
    return PageListe(
        elements: liste, page: 1, taille: taille, total: liste.length);
  }

  static const _indices = [
    'Observe le niveau dans la burette avant de verser.',
    'Près de l\'équivalence, un petit volume change beaucoup le pH.',
    'Ferme le robinet dès que la couleur change, puis lis le volume.',
  ];

  @override
  Future<AssistantReponse> assistant(AssistantDemande demande) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    final n = demande.niveauIndice.clamp(1, 3);
    return AssistantReponse(
        reponse: _indices[n - 1], niveauIndice: n, source: 'regles');
  }
}

class DepotDemo implements DepotLocal {
  final _tentatives = <String, Tentative>{};
  final _evenements = <EvenementTentative>[];
  final _envoyes = <String>{};
  final _packs = <String, ExperiencePack>{};
  List<ExperienceResume> _resumes = [];
  Profil? _profil;

  @override
  Future<void> creerTentative(Tentative t) async => _tentatives[t.id] = t;

  @override
  Future<void> terminerTentative({
    required String id,
    required DateTime fin,
    required String statut,
    int? score,
    Map<String, dynamic>? resultat,
  }) async =>
      _tentatives[id] = _tentatives[id]!
          .copyWith(fin: fin, statut: statut, score: score, resultat: resultat);

  @override
  Future<void> ajouterEvenement(EvenementTentative e) async =>
      _evenements.add(e);

  @override
  Future<int> prochainRang(String id) async =>
      _evenements.where((e) => e.tentativeId == id).length + 1;

  @override
  Future<Tentative?> lireTentative(String id) async => _tentatives[id];

  @override
  Future<List<Tentative>> historique() async => _tentatives.values.toList();

  @override
  Future<List<ElementEnvoi>> enAttente(int limite) async {
    final pretes = _tentatives.values
        .where((t) => t.statut != 'en_cours' && !_envoyes.contains(t.id))
        .take(limite)
        .toList();
    final elements = <ElementEnvoi>[
      for (final t in pretes) ElementTentative(t)
    ];
    final ids = {
      for (final t in _tentatives.values)
        if (t.statut != 'en_cours') t.id
    };
    final evs = _evenements
        .where((e) => ids.contains(e.tentativeId) && !_envoyes.contains(e.id))
        .take(limite - elements.length);
    elements.addAll(evs.map(ElementEvenement.new));
    return elements;
  }

  @override
  Future<int> appliquer(List<ResultatSync> resultats) async =>
      resultats.where((r) => _envoyes.add(r.id)).length;

  @override
  Future<int> nombreEnAttente() async => (await enAttente(1 << 30)).length;

  @override
  Future<void> sauverResumes(List<ExperienceResume> r) async => _resumes = r;

  @override
  Future<List<ExperienceResume>> lireResumes() async => _resumes;

  @override
  Future<void> sauverPack(ExperiencePack p) async => _packs[p.id] = p;

  @override
  Future<ExperiencePack?> lirePack(String id) async => _packs[id];

  @override
  Future<void> sauverProfil(Profil p) async => _profil = p;

  @override
  Future<Profil?> lireProfil() async => _profil;
}
