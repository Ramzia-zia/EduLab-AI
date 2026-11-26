import 'dart:convert';

import 'package:drift/drift.dart';

import '../../core/api_provisoire/modeles.dart';
import 'base_locale.dart';
import 'depot_local.dart';

class DepotDrift implements DepotLocal {
  DepotDrift(this._b);

  final BaseLocale _b;

  Tentative _versTentative(LigneTentative l) => Tentative(
        id: l.id,
        experienceId: l.experienceId,
        versionExperience: l.versionExperience,
        debut: l.debut.toUtc(),
        fin: l.fin?.toUtc(),
        statut: l.statut,
        score: l.score,
        resultat: l.resultatJson == null
            ? null
            : (jsonDecode(l.resultatJson!) as Map).cast<String, dynamic>(),
      );

  EvenementTentative _versEvenement(LigneEvenement l) => EvenementTentative(
        id: l.id,
        tentativeId: l.tentativeId,
        rang: l.rang,
        horodatage: l.horodatage.toUtc(),
        action: l.action,
        valeurs: (jsonDecode(l.valeursJson) as Map).cast<String, dynamic>(),
      );

  @override
  Future<void> creerTentative(Tentative t) =>
      _b.into(_b.tentativesLocales).insertOnConflictUpdate(
            TentativesLocalesCompanion.insert(
              id: t.id,
              experienceId: t.experienceId,
              versionExperience: t.versionExperience,
              debut: t.debut,
              statut: t.statut,
              fin: Value(t.fin),
              score: Value(t.score),
              resultatJson:
                  Value(t.resultat == null ? null : jsonEncode(t.resultat)),
            ),
          );

  @override
  Future<void> terminerTentative({
    required String id,
    required DateTime fin,
    required String statut,
    int? score,
    Map<String, dynamic>? resultat,
  }) =>
      (_b.update(_b.tentativesLocales)..where((t) => t.id.equals(id))).write(
        TentativesLocalesCompanion(
          fin: Value(fin),
          statut: Value(statut),
          score: Value(score),
          resultatJson: Value(resultat == null ? null : jsonEncode(resultat)),
        ),
      );

  @override
  Future<void> ajouterEvenement(EvenementTentative e) =>
      _b.into(_b.evenementsLocaux).insert(
            EvenementsLocauxCompanion.insert(
              id: e.id,
              tentativeId: e.tentativeId,
              rang: e.rang,
              horodatage: e.horodatage,
              action: e.action,
              valeursJson: jsonEncode(e.valeurs),
            ),
          );

  @override
  Future<int> prochainRang(String tentativeId) async {
    final maxi = _b.evenementsLocaux.rang.max();
    final ligne = await (_b.selectOnly(_b.evenementsLocaux)
          ..addColumns([maxi])
          ..where(_b.evenementsLocaux.tentativeId.equals(tentativeId)))
        .getSingle();
    return (ligne.read(maxi) ?? 0) + 1;
  }

  @override
  Future<Tentative?> lireTentative(String id) async {
    final l = await (_b.select(_b.tentativesLocales)
          ..where((t) => t.id.equals(id)))
        .getSingleOrNull();
    return l == null ? null : _versTentative(l);
  }

  @override
  Future<List<Tentative>> historique() async {
    final lignes = await (_b.select(_b.tentativesLocales)
          ..orderBy([(t) => OrderingTerm.desc(t.debut)]))
        .get();
    return lignes.map(_versTentative).toList();
  }

  @override
  Future<List<ElementEnvoi>> enAttente(int limite) async {
    final tentatives = await (_b.select(_b.tentativesLocales)
          ..where((t) => t.envoyee.equals(false) & t.statut.equals('en_cours').not())
          ..orderBy([(t) => OrderingTerm.asc(t.debut)])
          ..limit(limite))
        .get();
    final elements = <ElementEnvoi>[
      for (final t in tentatives) ElementTentative(_versTentative(t)),
    ];

    final reste = limite - elements.length;
    if (reste > 0) {
      final terminees = _b.selectOnly(_b.tentativesLocales)
        ..addColumns([_b.tentativesLocales.id])
        ..where(_b.tentativesLocales.statut.equals('en_cours').not());
      final evenements = await (_b.select(_b.evenementsLocaux)
            ..where((e) => e.envoye.equals(false) & e.tentativeId.isInQuery(terminees))
            ..orderBy([
              (e) => OrderingTerm.asc(e.tentativeId),
              (e) => OrderingTerm.asc(e.rang),
            ])
            ..limit(reste))
          .get();
      elements.addAll(evenements.map((e) => ElementEvenement(_versEvenement(e))));
    }
    return elements;
  }

  @override
  Future<int> appliquer(List<ResultatSync> resultats) async {
    var marquees = 0;
    await _b.transaction(() async {
      for (final r in resultats) {
        final refus = r.statut == 'refuse' ? (r.code ?? 'refuse') : null;
        marquees += await (_b.update(_b.tentativesLocales)
              ..where((t) => t.id.equals(r.id)))
            .write(TentativesLocalesCompanion(
          envoyee: const Value(true),
          codeRefus: Value(refus),
        ));
        marquees += await (_b.update(_b.evenementsLocaux)
              ..where((e) => e.id.equals(r.id)))
            .write(EvenementsLocauxCompanion(
          envoye: const Value(true),
          codeRefus: Value(refus),
        ));
      }
    });
    return marquees;
  }

  @override
  Future<int> nombreEnAttente() async => (await enAttente(1 << 30)).length;

  @override
  Future<void> sauverResumes(List<ExperienceResume> resumes) =>
      _b.batch((b) {
        b.deleteAll(_b.experiencesLocales);
        b.insertAll(_b.experiencesLocales, [
          for (final r in resumes)
            ExperiencesLocalesCompanion.insert(
              id: r.id,
              resumeJson: jsonEncode(r.toJson()),
            ),
        ]);
      });

  @override
  Future<List<ExperienceResume>> lireResumes() async {
    final lignes = await _b.select(_b.experiencesLocales).get();
    return [
      for (final l in lignes)
        ExperienceResume.fromJson(
            (jsonDecode(l.resumeJson) as Map).cast<String, dynamic>()),
    ];
  }

  @override
  Future<void> sauverPack(ExperiencePack pack) =>
      _b.into(_b.packsLocaux).insertOnConflictUpdate(
            PacksLocauxCompanion.insert(
              id: pack.id,
              version: pack.version,
              definitionJson: jsonEncode(pack.definition),
            ),
          );

  @override
  Future<ExperiencePack?> lirePack(String id) async {
    final l = await (_b.select(_b.packsLocaux)..where((p) => p.id.equals(id)))
        .getSingleOrNull();
    if (l == null) return null;
    return ExperiencePack(
      id: l.id,
      version: l.version,
      definition: (jsonDecode(l.definitionJson) as Map).cast<String, dynamic>(),
    );
  }

  @override
  Future<void> sauverProfil(Profil profil) =>
      _b.into(_b.profilsLocaux).insertOnConflictUpdate(
            ProfilsLocauxCompanion.insert(
              id: profil.id,
              profilJson: jsonEncode(profil.toJson()),
            ),
          );

  @override
  Future<Profil?> lireProfil() async {
    final l = await _b.select(_b.profilsLocaux).get();
    if (l.isEmpty) return null;
    return Profil.fromJson(
        (jsonDecode(l.first.profilJson) as Map).cast<String, dynamic>());
  }
}
