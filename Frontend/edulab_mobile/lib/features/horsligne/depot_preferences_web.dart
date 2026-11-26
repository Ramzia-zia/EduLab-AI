import 'dart:async';
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../core/api_provisoire/modeles.dart';
import 'depot_local.dart';

class DepotPreferencesWeb implements DepotLocal {
  static const _tentativesKey = 'edulab.tentatives.v1';
  static const _evenementsKey = 'edulab.evenements.v1';
  static const _resumesKey = 'edulab.experiences.v1';
  static const _packsKey = 'edulab.packs.v1';
  static const _profilKey = 'edulab.profil.v1';

  Future<void> _file = Future<void>.value();

  Future<T> _executer<T>(
    Future<T> Function(SharedPreferences preferences) operation,
  ) {
    final resultat = Completer<T>();
    _file = _file.then((_) async {
      try {
        resultat.complete(
          await operation(await SharedPreferences.getInstance()),
        );
      } catch (error, stackTrace) {
        resultat.completeError(error, stackTrace);
      }
    });
    return resultat.future;
  }

  List<Map<String, dynamic>> _lireListe(
    SharedPreferences preferences,
    String cle,
  ) {
    final contenu = preferences.getString(cle);
    if (contenu == null) return [];
    return (jsonDecode(contenu) as List)
        .map((ligne) => (ligne as Map).cast<String, dynamic>())
        .toList();
  }

  Future<void> _sauverListe(
    SharedPreferences preferences,
    String cle,
    List<Map<String, dynamic>> lignes,
  ) async {
    if (!await preferences.setString(cle, jsonEncode(lignes))) {
      throw StateError('Échec de sauvegarde du stockage local ($cle).');
    }
  }

  Tentative _tentative(Map<String, dynamic> ligne) =>
      Tentative.fromJson((ligne['donnees'] as Map).cast<String, dynamic>());

  EvenementTentative _evenement(Map<String, dynamic> ligne) =>
      EvenementTentative.fromJson(
          (ligne['donnees'] as Map).cast<String, dynamic>());

  @override
  Future<void> creerTentative(Tentative tentative) =>
      _executer((preferences) async {
        final lignes = _lireListe(preferences, _tentativesKey);
        lignes.removeWhere((ligne) => ligne['donnees']['id'] == tentative.id);
        lignes.add({
          'donnees': tentative.toJson(),
          'envoyee': false,
          'code_refus': null,
        });
        await _sauverListe(preferences, _tentativesKey, lignes);
      });

  @override
  Future<void> terminerTentative({
    required String id,
    required DateTime fin,
    required String statut,
    int? score,
    Map<String, dynamic>? resultat,
  }) =>
      _executer((preferences) async {
        final lignes = _lireListe(preferences, _tentativesKey);
        final index =
            lignes.indexWhere((ligne) => ligne['donnees']['id'] == id);
        if (index == -1) return;
        final tentative = _tentative(lignes[index]);
        lignes[index]['donnees'] = tentative
            .copyWith(
                fin: fin, statut: statut, score: score, resultat: resultat)
            .toJson();
        await _sauverListe(preferences, _tentativesKey, lignes);
      });

  @override
  Future<void> ajouterEvenement(EvenementTentative evenement) =>
      _executer((preferences) async {
        final lignes = _lireListe(preferences, _evenementsKey);
        if (lignes.any((ligne) =>
            ligne['donnees']['id'] == evenement.id ||
            (ligne['donnees']['tentative_id'] == evenement.tentativeId &&
                ligne['donnees']['rang'] == evenement.rang))) {
          throw StateError('Événement déjà présent dans le stockage local.');
        }
        lignes.add({
          'donnees': evenement.toJson(),
          'envoye': false,
          'code_refus': null,
        });
        await _sauverListe(preferences, _evenementsKey, lignes);
      });

  @override
  Future<int> prochainRang(String tentativeId) => _executer((preferences) {
        final rangs = _lireListe(preferences, _evenementsKey)
            .where((ligne) => ligne['donnees']['tentative_id'] == tentativeId)
            .map((ligne) => ligne['donnees']['rang'] as int);
        return Future.value(
            rangs.fold<int>(0, (max, rang) => rang > max ? rang : max) + 1);
      });

  @override
  Future<Tentative?> lireTentative(String id) => _executer((preferences) {
        final lignes = _lireListe(preferences, _tentativesKey);
        final index =
            lignes.indexWhere((ligne) => ligne['donnees']['id'] == id);
        return Future.value(index == -1 ? null : _tentative(lignes[index]));
      });

  @override
  Future<List<Tentative>> historique() => _executer((preferences) {
        final tentatives = _lireListe(preferences, _tentativesKey)
            .map(_tentative)
            .toList()
          ..sort((a, b) => b.debut.compareTo(a.debut));
        return Future.value(tentatives);
      });

  @override
  Future<List<ElementEnvoi>> enAttente(int limite) => _executer((preferences) {
        final tentatives = _lireListe(preferences, _tentativesKey);
        final evenements = _lireListe(preferences, _evenementsKey);
        final envoi = <ElementEnvoi>[];
        final tentativesFiltrees = tentatives
            .where((ligne) =>
                ligne['envoyee'] != true &&
                _tentative(ligne).statut != 'en_cours')
            .toList()
          ..sort((a, b) => _tentative(a).debut.compareTo(_tentative(b).debut));
        for (final ligne in tentativesFiltrees.take(limite)) {
          envoi.add(ElementTentative(_tentative(ligne)));
        }

        final idsTermines = tentatives
            .where((ligne) => _tentative(ligne).statut != 'en_cours')
            .map((ligne) => _tentative(ligne).id)
            .toSet();
        final evenementsFiltres = evenements
            .where((ligne) =>
                ligne['envoye'] != true &&
                idsTermines.contains(ligne['donnees']['tentative_id']))
            .toList()
          ..sort((a, b) {
            final idA = _evenement(a).tentativeId;
            final idB = _evenement(b).tentativeId;
            final comparaison = idA.compareTo(idB);
            return comparaison != 0
                ? comparaison
                : _evenement(a).rang.compareTo(_evenement(b).rang);
          });
        final reste = limite - envoi.length;
        for (final ligne in evenementsFiltres.take(reste)) {
          envoi.add(ElementEvenement(_evenement(ligne)));
        }
        return Future.value(envoi);
      });

  @override
  Future<int> appliquer(List<ResultatSync> resultats) =>
      _executer((preferences) async {
        final tentatives = _lireListe(preferences, _tentativesKey);
        final evenements = _lireListe(preferences, _evenementsKey);
        var modifiees = 0;
        for (final resultat in resultats) {
          final refus =
              resultat.statut == 'refuse' ? (resultat.code ?? 'refuse') : null;
          final tentativeIndex = tentatives
              .indexWhere((ligne) => ligne['donnees']['id'] == resultat.id);
          if (tentativeIndex != -1) {
            tentatives[tentativeIndex]
              ..['envoyee'] = true
              ..['code_refus'] = refus;
            modifiees += 1;
            continue;
          }
          final evenementIndex = evenements
              .indexWhere((ligne) => ligne['donnees']['id'] == resultat.id);
          if (evenementIndex != -1) {
            evenements[evenementIndex]
              ..['envoye'] = true
              ..['code_refus'] = refus;
            modifiees += 1;
          }
        }
        await _sauverListe(preferences, _tentativesKey, tentatives);
        await _sauverListe(preferences, _evenementsKey, evenements);
        return modifiees;
      });

  @override
  Future<int> nombreEnAttente() async => (await enAttente(1 << 30)).length;

  @override
  Future<void> sauverResumes(List<ExperienceResume> resumes) =>
      _executer((preferences) => _sauverListe(
            preferences,
            _resumesKey,
            resumes.map((resume) => resume.toJson()).toList(),
          ));

  @override
  Future<List<ExperienceResume>> lireResumes() => _executer((preferences) {
        final resumes = _lireListe(preferences, _resumesKey)
            .map(ExperienceResume.fromJson)
            .toList();
        return Future.value(resumes);
      });

  @override
  Future<void> sauverPack(ExperiencePack pack) =>
      _executer((preferences) async {
        final contenu = preferences.getString(_packsKey);
        final packs = contenu == null
            ? <String, dynamic>{}
            : (jsonDecode(contenu) as Map).cast<String, dynamic>();
        packs[pack.id] = pack.toJson();
        if (!await preferences.setString(_packsKey, jsonEncode(packs))) {
          throw StateError('Échec de sauvegarde du pack ${pack.id}.');
        }
      });

  @override
  Future<ExperiencePack?> lirePack(String id) => _executer((preferences) {
        final contenu = preferences.getString(_packsKey);
        if (contenu == null) return Future.value(null);
        final packs = (jsonDecode(contenu) as Map).cast<String, dynamic>();
        final pack = packs[id];
        return Future.value(pack == null
            ? null
            : ExperiencePack.fromJson(pack as Map<String, dynamic>));
      });

  @override
  Future<void> sauverProfil(Profil profil) => _executer((preferences) async {
        if (!await preferences.setString(
            _profilKey, jsonEncode(profil.toJson()))) {
          throw StateError('Échec de sauvegarde du profil local.');
        }
      });

  @override
  Future<Profil?> lireProfil() => _executer((preferences) {
        final contenu = preferences.getString(_profilKey);
        return Future.value(
          contenu == null
              ? null
              : Profil.fromJson(
                  (jsonDecode(contenu) as Map).cast<String, dynamic>(),
                ),
        );
      });
}
