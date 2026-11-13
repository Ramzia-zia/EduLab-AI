// COUCHE PROVISOIRE (voir modeles.dart) : implémente à la main les routes de
// CONTRAT.md v0.1 chapitre 3. À remplacer par un adaptateur sur le client généré.
import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'modeles.dart';

/// Seule porte d'entrée du serveur pour les écrans.
abstract interface class ApiEdulab {
  Future<Profil> moi(); // GET /moi
  Future<List<ExperienceResume>> experiences({String? matiere, String? niveau});
  Future<ExperiencePack> pack(String id); // GET /experiences/{id}/pack
  Future<List<ResultatSync>> sync(SyncLot lot); // POST /tentatives/sync
  Future<PageListe<Tentative>> tentatives({int page = 1, int taille = 50});
  Future<AssistantReponse> assistant(AssistantDemande demande); // POST /assistant
}

class ClientApiProvisoire implements ApiEdulab {
  ClientApiProvisoire({
    required this.urlBase,
    required this.jeton,
    http.Client? client,
    this.delai = const Duration(seconds: 15),
  }) : _client = client ?? http.Client();

  final String urlBase;
  final String? Function() jeton;
  final http.Client _client;
  final Duration delai;

  Future<dynamic> _appeler(
    String methode,
    String chemin, {
    Map<String, String>? requete,
    Object? corps,
  }) async {
    final uri = Uri.parse('$urlBase/api/v1$chemin')
        .replace(queryParameters: requete == null || requete.isEmpty ? null : requete);
    final entetes = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    final t = jeton();
    if (t != null) entetes['Authorization'] = 'Bearer $t';

    final http.Response reponse;
    try {
      final appel = methode == 'GET'
          ? _client.get(uri, headers: entetes)
          : _client.post(uri, headers: entetes, body: jsonEncode(corps));
      reponse = await appel.timeout(delai);
    } on http.ClientException {
      throw const ErreurReseau();
    } on TimeoutException {
      throw const ErreurReseau();
    }

    final texte = utf8.decode(reponse.bodyBytes);
    final json = texte.isEmpty ? null : jsonDecode(texte);
    if (reponse.statusCode >= 200 && reponse.statusCode < 300) return json;
    if (json is Map<String, dynamic>) {
      throw ErreurApi.depuisJson(json, reponse.statusCode);
    }
    throw ErreurApi(
      code: 'erreur_serveur',
      message: 'Une erreur est survenue.',
      statutHttp: reponse.statusCode,
    );
  }

  // « liste d'X » : le contrat montre aussi l'enveloppe {elements,...} pour les listes.
  List<dynamic> _elements(dynamic json) =>
      json is List ? json : (json as Map<String, dynamic>)['elements'] as List;

  @override
  Future<Profil> moi() async =>
      Profil.fromJson(await _appeler('GET', '/moi') as Map<String, dynamic>);

  @override
  Future<List<ExperienceResume>> experiences({String? matiere, String? niveau}) async {
    final json = await _appeler('GET', '/experiences', requete: {
      if (matiere != null) 'matiere': matiere,
      if (niveau != null) 'niveau': niveau,
    });
    return [
      for (final e in _elements(json))
        ExperienceResume.fromJson(e as Map<String, dynamic>),
    ];
  }

  @override
  Future<ExperiencePack> pack(String id) async => ExperiencePack.fromJson(
        await _appeler('GET', '/experiences/$id/pack') as Map<String, dynamic>,
      );

  @override
  Future<List<ResultatSync>> sync(SyncLot lot) async {
    final json = await _appeler('POST', '/tentatives/sync', corps: lot.toJson())
        as Map<String, dynamic>;
    return [
      for (final r in json['resultats'] as List)
        ResultatSync.fromJson(r as Map<String, dynamic>),
    ];
  }

  @override
  Future<PageListe<Tentative>> tentatives({int page = 1, int taille = 50}) async {
    final json = await _appeler('GET', '/tentatives',
        requete: {'page': '$page', 'taille': '$taille'});
    final liste = _elements(json);
    final enveloppe = json is Map<String, dynamic> ? json : const <String, dynamic>{};
    return PageListe(
      elements: [for (final t in liste) Tentative.fromJson(t as Map<String, dynamic>)],
      page: enveloppe['page'] as int? ?? page,
      taille: enveloppe['taille'] as int? ?? taille,
      total: enveloppe['total'] as int? ?? liste.length,
    );
  }

  @override
  Future<AssistantReponse> assistant(AssistantDemande demande) async =>
      AssistantReponse.fromJson(
        await _appeler('POST', '/assistant', corps: demande.toJson())
            as Map<String, dynamic>,
      );
}
