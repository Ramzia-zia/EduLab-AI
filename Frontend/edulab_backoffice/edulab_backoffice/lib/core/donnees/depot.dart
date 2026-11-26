// PROVISOIRE : donnees de demonstration, tirees de la maquette.
// A remplacer par le client Dart genere depuis openapi.json.
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../auth/session.dart';
import 'modeles_provisoires.dart';

abstract class DepotDonnees {
  Future<TableauAdmin> tableauAdmin();
  Future<TableauEnseignant> tableauEnseignant();
  Future<TableauMinistere> tableauMinistere();
  Future<TableauEtablissement> tableauEtablissement();
  Future<List<ClasseResume>> classes();
  Future<ResultatsClasse> resultatsClasse(String id);
  Future<List<StatEtablissement>> statsEtablissements();
  Future<List<EtablissementLigne>> etablissements();
  Future<List<Compte>> comptes();
}

class DepotDemo implements DepotDonnees {
  Future<T> _attendre<T>(T valeur) =>
      Future<T>.delayed(const Duration(milliseconds: 300), () => valeur);

  @override
  Future<TableauAdmin> tableauAdmin() => _attendre(const TableauAdmin(
        nb_etablissements: 24,
        nb_enseignants: 1250,
        nb_eleves: 48730,
        taux_utilisation: 92,
        evolution_libelles: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        evolution_valeurs: [25, 38, 48, 60, 69, 82],
        repartition_regions: [
          PartRegion(nom: 'Maritime', pourcentage: 28),
          PartRegion(nom: 'Plateaux', pourcentage: 24),
          PartRegion(nom: 'Centrale', pourcentage: 20),
          PartRegion(nom: 'Kara', pourcentage: 15),
          PartRegion(nom: 'Savanes', pourcentage: 13),
        ],
        activites: [
          Activite(
              texte: 'Nouvel établissement ajouté : Lycée Moderne de Lomé',
              il_y_a: 'Il y a 2 h',
              icone: Icons.add_business_outlined),
          Activite(
              texte: '12 nouveaux enseignants inscrits',
              il_y_a: 'Il y a 3 h',
              icone: Icons.person_add_alt_1_outlined),
          Activite(
              texte: 'Mise à jour du contenu : Physique – Terminale',
              il_y_a: 'Il y a 1 j',
              icone: Icons.task_alt_outlined),
        ],
      ));

  @override
  Future<TableauEnseignant> tableauEnseignant() =>
      _attendre(const TableauEnseignant(
        nb_classes: 3,
        nb_cours: 12,
        nb_eleves: 92,
        taux_reussite: 87,
        classes: _classes,
        activites: [
          Activite(
              texte: 'Cours « Ondes et lumière » publié',
              il_y_a: 'Aujourd\'hui, 09:20',
              icone: Icons.check_box_outlined),
          Activite(
              texte: 'Exercice « Forces et énergie » corrigé',
              il_y_a: 'Hier, 16:40',
              icone: Icons.check_box_outlined),
        ],
      ));

  @override
  Future<TableauMinistere> tableauMinistere() =>
      _attendre(const TableauMinistere(
        nb_etablissements: 246,
        nb_enseignants: 12540,
        nb_eleves: 482700,
        taux_utilisation: 88,
        performance_regions: [
          PartRegion(nom: 'Maritime', pourcentage: 92),
          PartRegion(nom: 'Plateaux', pourcentage: 87),
          PartRegion(nom: 'Centrale', pourcentage: 85),
          PartRegion(nom: 'Kara', pourcentage: 90),
          PartRegion(nom: 'Savanes', pourcentage: 84),
        ],
      ));

  @override
  Future<TableauEtablissement> tableauEtablissement() =>
      _attendre(const TableauEtablissement(
        nom: 'Lycée Moderne de Lomé',
        actif: true,
        nb_enseignants: 24,
        nb_eleves: 620,
        activites: [
          Activite(
              texte: 'Compte enseignant créé : Mme Adjo',
              il_y_a: 'Il y a 1 h',
              icone: Icons.person_add_alt_1_outlined),
          Activite(
              texte: 'Compte élève ajouté : Koffi D.',
              il_y_a: 'Il y a 2 h',
              icone: Icons.person_add_alt_1_outlined),
          Activite(
              texte: 'Cours publié : Chimie – Seconde',
              il_y_a: 'Il y a 1 jour',
              icone: Icons.description_outlined),
        ],
      ));

  static const _classes = [
    ClasseResume(id: 'c1', nom: '2nde A', abreviation: '2A', nb_eleves: 32),
    ClasseResume(id: 'c2', nom: '1ère C', abreviation: '1C', nb_eleves: 28),
    ClasseResume(id: 'c3', nom: 'Tle D', abreviation: 'TD', nb_eleves: 32),
  ];

  @override
  Future<List<ClasseResume>> classes() => _attendre(_classes);

  @override
  Future<ResultatsClasse> resultatsClasse(String id) {
    final classe =
        _classes.firstWhere((c) => c.id == id, orElse: () => _classes.first);
    return _attendre(ResultatsClasse(
      classe_nom: classe.nom,
      eleves: [
        ResultatEleve(
            nom: 'Koffi Dossou',
            experiences_faites: 3,
            score_moyen: 72,
            derniere_activite: DateTime.utc(2026, 11, 24, 7, 30)),
        ResultatEleve(
            nom: 'Akouavi Mensah',
            experiences_faites: 5,
            score_moyen: 88,
            derniere_activite: DateTime.utc(2026, 11, 23, 15, 10)),
        ResultatEleve(
            nom: 'Yao Agbeko',
            experiences_faites: 1,
            score_moyen: 54,
            derniere_activite: DateTime.utc(2026, 11, 20, 9, 5)),
      ],
      erreurs_frequentes: const [
        ErreurFrequente(code: 'debit_trop_rapide', nb: 12),
        ErreurFrequente(code: 'lunettes_oubliees', nb: 7),
        ErreurFrequente(code: 'lecture_burette', nb: 4),
      ],
    ));
  }

  @override
  Future<List<StatEtablissement>> statsEtablissements() => _attendre(const [
        StatEtablissement(
            nom: 'Lycée Moderne de Lomé',
            commune: 'Lomé',
            nb_eleves_actifs: 128,
            taux_reussite: 0.78,
            progression_moyenne: 0.12),
        StatEtablissement(
            nom: 'Lycée de Kara',
            commune: 'Kara',
            nb_eleves_actifs: 96,
            taux_reussite: 0.84,
            progression_moyenne: 0.09),
        StatEtablissement(
            nom: 'Lycée d\'Atakpamé',
            commune: 'Atakpamé',
            nb_eleves_actifs: 74,
            taux_reussite: 0.71,
            progression_moyenne: 0.15),
      ]);

  @override
  Future<List<EtablissementLigne>> etablissements() => _attendre(const [
        EtablissementLigne(
            id: 'e1',
            nom: 'Lycée Moderne de Lomé',
            commune: 'Lomé',
            region: 'Maritime',
            nb_eleves: 620,
            actif: true),
        EtablissementLigne(
            id: 'e2',
            nom: 'Lycée de Kara',
            commune: 'Kara',
            region: 'Kara',
            nb_eleves: 540,
            actif: true),
        EtablissementLigne(
            id: 'e3',
            nom: 'Lycée d\'Atakpamé',
            commune: 'Atakpamé',
            region: 'Plateaux',
            nb_eleves: 410,
            actif: false),
      ]);

  @override
  Future<List<Compte>> comptes() => _attendre(const [
        Compte(
            id: 'p1',
            nom: 'Mensah Komlan',
            email: 'mensah@csi.tg',
            role: 'enseignant'),
        Compte(
            id: 'p2',
            nom: 'Amédor Sylvie',
            email: 'amedor@csi.tg',
            role: 'enseignant'),
        Compte(
            id: 'p3',
            nom: 'Tchalla David',
            email: 'tchalla@csi.tg',
            role: 'enseignant'),
        Compte(
            id: 'p4',
            nom: 'Koffi Dossou',
            email: 'koffi.dossou@csi.tg',
            role: 'eleve',
            classe: 'Tle D'),
        Compte(
            id: 'p5',
            nom: 'Akouavi Mensah',
            email: 'akouavi.mensah@csi.tg',
            role: 'eleve',
            classe: '1ère C'),
      ]);
}

final depotProvider = Provider<DepotDonnees>((ref) {
  final session = ref.watch(sessionProvider);
  return session == null ? DepotDemo() : DepotConnecte(session);
});

class DepotConnecte extends DepotDemo {
  DepotConnecte(this._session, {http.Client? client})
      : _client = client ?? http.Client();

  final Session _session;
  final http.Client _client;
  static const _urlApi = String.fromEnvironment('URL_API');

  Future<dynamic> _get(String chemin) async {
    if (_urlApi.trim().isEmpty) {
      throw StateError('URL_API n’est pas configurée.');
    }
    final uri = Uri.parse('${_urlApi.replaceFirst(RegExp(r'/+$'), '')}$chemin');
    final http.Response response;
    try {
      response = await _client.get(uri, headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ${_session.jeton}',
      }).timeout(const Duration(seconds: 15));
    } on http.ClientException {
      throw StateError('Impossible de joindre le serveur EduLab.');
    } on TimeoutException {
      throw StateError('Le serveur EduLab met trop de temps à répondre.');
    }
    final Object? body =
        response.body.isEmpty ? null : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = body is Map<String, dynamic>
          ? body['message'] as String? ?? 'Erreur du serveur EduLab.'
          : 'Erreur du serveur EduLab.';
      throw StateError(message);
    }
    return body;
  }

  List<Map<String, dynamic>> _lignes(Object? body) {
    if (body is! List) throw StateError('Réponse de liste invalide.');
    return [for (final row in body) (row as Map).cast<String, dynamic>()];
  }

  Map<String, dynamic> _objet(Object? body) {
    if (body is! Map) throw StateError('Réponse objet invalide.');
    return body.cast<String, dynamic>();
  }

  @override
  Future<List<ClasseResume>> classes() async => [
        for (final row in _lignes(await _get('/classes')))
          ClasseResume(
            id: row['id'] as String,
            nom: row['nom'] as String,
            abreviation: (row['nom'] as String)
                .split(RegExp(r'\s+'))
                .take(2)
                .map((part) => part.isEmpty ? '' : part[0])
                .join()
                .toUpperCase(),
            niveau: row['niveau'] as String,
          ),
      ];

  Future<Map<String, dynamic>> _bilan(String id) async =>
      _objet(await _get('/classes/$id/bilan'));

  @override
  Future<TableauEnseignant> tableauEnseignant() async {
    final liste = await classes();
    final bilans = await Future.wait([for (final c in liste) _bilan(c.id)]);
    final scores = [
      for (final bilan in bilans)
        if (bilan['score_moyen'] != null)
          (bilan['score_moyen'] as num).toDouble(),
    ];
    return TableauEnseignant(
      nb_classes: liste.length,
      nb_cours: null,
      nb_eleves: bilans.fold(
        0,
        (total, bilan) => total + (bilan['nombre_eleves'] as int),
      ),
      taux_reussite:
          scores.isEmpty ? 0 : scores.reduce((a, b) => a + b) / scores.length,
      classes: [
        for (var i = 0; i < liste.length; i++)
          ClasseResume(
            id: liste[i].id,
            nom: liste[i].nom,
            abreviation: liste[i].abreviation,
            niveau: liste[i].niveau,
            nb_eleves: bilans[i]['nombre_eleves'] as int,
          ),
      ],
      activites: const [],
    );
  }

  @override
  Future<ResultatsClasse> resultatsClasse(String id) async {
    final classes = await this.classes();
    final bilan = await _bilan(id);
    final correspondantes = classes.where((classe) => classe.id == id);
    return ResultatsClasse(
      classe_nom: correspondantes.isEmpty ? id : correspondantes.first.nom,
      eleves: const [],
      erreurs_frequentes: const [],
      synthese: true,
      nb_eleves: bilan['nombre_eleves'] as int,
      nb_tentatives: bilan['nombre_tentatives'] as int,
      nb_tentatives_terminees: bilan['nombre_tentatives_terminees'] as int,
      score_moyen: (bilan['score_moyen'] as num?)?.toDouble(),
      par_experience: [
        for (final row in (bilan['par_experience'] as List))
          BilanExperience(
            experience_id:
                (row as Map<String, dynamic>)['experience_id'] as String,
            nombre_tentatives: row['nombre_tentatives'] as int,
            score_moyen: (row['score_moyen'] as num?)?.toDouble(),
            titre: row['titre'] as String?,
            matiere: row['matiere'] as String?,
          ),
      ],
    );
  }

  @override
  Future<List<StatEtablissement>> statsEtablissements() async {
    final route = _session.role == Role.ministere
        ? '/stats/ministere'
        : '/stats/etablissement';
    return [
      for (final row in _lignes(await _get(route)))
        StatEtablissement(
          nom: row['nom_etablissement'] as String? ??
              _session.etablissementNom ??
              'Mon établissement',
          commune: '—',
          nb_eleves_actifs: row['nombre_eleves_actifs'] as int?,
          taux_reussite: 0,
          progression_moyenne: 0,
          etablissement_id: row['etablissement_id'] as String?,
          matiere: row['matiere'] as String,
          nombre_tentatives: row['nombre_tentatives'] as int,
          score_moyen: (row['score_moyen'] as num?)?.toDouble(),
        ),
    ];
  }

  @override
  Future<TableauMinistere> tableauMinistere() async {
    final lignes = await statsEtablissements();
    final etablissements = {
      for (final ligne in lignes)
        if (ligne.etablissement_id != null) ligne.etablissement_id!,
    };
    final parMatiere = <String, List<double>>{};
    for (final ligne in lignes) {
      if (ligne.score_moyen != null && ligne.matiere != null) {
        parMatiere
            .putIfAbsent(ligne.matiere!, () => [])
            .add(ligne.score_moyen!);
      }
    }
    return TableauMinistere(
      nb_etablissements: etablissements.length,
      nb_enseignants: null,
      nb_eleves: null,
      taux_utilisation: null,
      performance_regions: [
        for (final entry in parMatiere.entries)
          PartRegion(
            nom: entry.key,
            pourcentage:
                entry.value.reduce((a, b) => a + b) / entry.value.length,
          ),
      ],
    );
  }

  @override
  Future<TableauEtablissement> tableauEtablissement() async {
    await statsEtablissements();
    return TableauEtablissement(
      nom: _session.etablissementNom ?? 'Mon établissement',
      actif: _session.etablissementActif ?? true,
      nb_enseignants: null,
      nb_eleves: null,
      activites: const [],
    );
  }

  @override
  Future<TableauAdmin> tableauAdmin() => Future.error(
      StateError('Aucune route admin n’est disponible dans l’API.'));

  @override
  Future<List<EtablissementLigne>> etablissements() => Future.error(
      StateError('Aucune route d’établissements n’est disponible dans l’API.'));

  @override
  Future<List<Compte>> comptes() => Future.error(
      StateError('Aucune route de comptes n’est disponible dans l’API.'));
}

final tableauAdminProvider =
    FutureProvider((ref) => ref.watch(depotProvider).tableauAdmin());
final tableauEnseignantProvider =
    FutureProvider((ref) => ref.watch(depotProvider).tableauEnseignant());
final tableauMinistereProvider =
    FutureProvider((ref) => ref.watch(depotProvider).tableauMinistere());
final tableauEtablissementProvider =
    FutureProvider((ref) => ref.watch(depotProvider).tableauEtablissement());
final classesProvider =
    FutureProvider((ref) => ref.watch(depotProvider).classes());
final resultatsClasseProvider = FutureProvider.family(
    (ref, String id) => ref.watch(depotProvider).resultatsClasse(id));
final statsEtablissementsProvider =
    FutureProvider((ref) => ref.watch(depotProvider).statsEtablissements());
final etablissementsProvider =
    FutureProvider((ref) => ref.watch(depotProvider).etablissements());

/// Liste des comptes de l'etablissement, avec creation, modification et suppression.
class ComptesNotifier extends AsyncNotifier<List<Compte>> {
  @override
  Future<List<Compte>> build() => ref.read(depotProvider).comptes();

  List<Compte> get _liste => state.valueOrNull ?? const [];

  void creer(Compte compte) => state = AsyncData([compte, ..._liste]);

  void creerPlusieurs(List<Compte> comptes) =>
      state = AsyncData([...comptes, ..._liste]);

  void modifier(Compte compte) => state = AsyncData([
        for (final c in _liste)
          if (c.id == compte.id) compte else c
      ]);

  void supprimer(String id) =>
      state = AsyncData(_liste.where((c) => c.id != id).toList());
}

final comptesProvider =
    AsyncNotifierProvider<ComptesNotifier, List<Compte>>(ComptesNotifier.new);
