import 'dart:async';

import '../core/api_provisoire/api.dart';
import '../core/api_provisoire/modeles.dart';
import '../core/labo/moteur.dart';
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
  Future<List<ExperienceResume>> experiences({String? matiere, String? niveau}) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return resumesDemo;
  }

  @override
  Future<ExperiencePack> pack(String id) async => packDemo(id);

  @override
  Future<List<ResultatSync>> sync(SyncLot lot) async => [
        for (final t in lot.tentatives) ResultatSync(id: t.id, statut: 'accepte'),
        for (final e in lot.evenements) ResultatSync(id: e.id, statut: 'accepte'),
      ];

  @override
  Future<PageListe<Tentative>> tentatives({int page = 1, int taille = 50}) async {
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
    return PageListe(elements: liste, page: 1, taille: taille, total: liste.length);
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
    return AssistantReponse(reponse: _indices[n - 1], niveauIndice: n, source: 'regles');
  }
}

/// Moteur de DÉMO : le pH vient d'une lecture entre les valeurs de reference_values.json
/// (0 mL → 1,1 ; 15,99 → 4,56 ; 16,0 → 7,0 ; 16,05 → 10,14). Ce n'est PAS le vrai calcul.
class MoteurDemo implements MoteurTitrage {
  const MoteurDemo();

  @override
  SessionTitrage demarrer() => _SessionDemo();
}

class _SessionDemo implements SessionTitrage {
  static const _points = [
    [0.0, 1.1],
    [15.99, 4.56],
    [16.0, 7.0],
    [16.05, 10.14],
  ];

  @override
  double get volumeEquivalentMl => 16.0;

  @override
  double get volumeMaxMl => 25.0;

  @override
  double debitMlParS(double niveauRobinet) => niveauRobinet * 2.0;

  @override
  double ph(double v) {
    if (v <= _points.first[0]) return _points.first[1];
    for (var i = 1; i < _points.length; i++) {
      final a = _points[i - 1];
      final b = _points[i];
      if (v <= b[0]) return a[1] + (b[1] - a[1]) * (v - a[0]) / (b[0] - a[0]);
    }
    return _points.last[1];
  }

  @override
  bool procheEquivalence(double v) => (v - volumeEquivalentMl).abs() < 1.0;
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
  Future<void> ajouterEvenement(EvenementTentative e) async => _evenements.add(e);

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
    final elements = <ElementEnvoi>[for (final t in pretes) ElementTentative(t)];
    final ids = {for (final t in _tentatives.values) if (t.statut != 'en_cours') t.id};
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
