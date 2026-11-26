import 'dart:convert';

import 'package:edulab_mobile/core/api_provisoire/api.dart';
import 'package:edulab_mobile/core/api_provisoire/modeles.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  test('uses the FastAPI paths and accepts the live experience shape',
      () async {
    final client = ClientApiProvisoire(
      urlBase: 'https://api.example.test/',
      jeton: () => 'token',
      client: MockClient((request) async {
        expect(request.url.path, '/experiences');
        expect(request.headers['Authorization'], 'Bearer token');
        return http.Response(
          jsonEncode([
            {'id': 'exp-1', 'matiere': 'chimie', 'titre': 'Dosage'}
          ]),
          200,
        );
      }),
    );

    final experiences = await client.experiences();
    expect(experiences.single.niveau, '');
    expect(experiences.single.version, 1);
    expect(experiences.single.etat, 'a_commencer');
  });

  test('creates queued attempts before sending compatible event payloads',
      () async {
    final appels = <http.Request>[];
    final client = ClientApiProvisoire(
      urlBase: 'https://api.example.test',
      jeton: () => 'token',
      client: MockClient((request) async {
        appels.add(request);
        if (request.url.path == '/tentatives') {
          expect(
              jsonDecode(request.body)['debut_le'], '2026-11-25T10:00:00.000Z');
          expect(
              jsonDecode(request.body)['fin_le'], '2026-11-25T10:05:00.000Z');
          expect(
              jsonDecode(request.body)['resultat'], {'volume_verse_ml': 21.5});
          return http.Response('{}', 201);
        }
        expect(request.url.path, '/tentatives/sync');
        final evenement =
            (jsonDecode(request.body)['evenements'] as List).single as Map;
        expect(evenement['type'], 'ajout_reactif');
        expect(evenement['charge'], {'volume_ml': 2.5});
        expect(evenement.containsKey('action'), isFalse);
        return http.Response(
          jsonEncode({
            'resultats': [
              {
                'evenement_id': 'event-1',
                'statut': 'accepte',
                'doublon': false,
                'code': null,
              }
            ]
          }),
          200,
        );
      }),
    );

    final resultats = await client.sync(SyncLot(
      tentatives: [
        Tentative(
          id: 'attempt-1',
          experienceId: 'exp-1',
          versionExperience: 1,
          debut: DateTime.utc(2026, 11, 25, 10),
          fin: DateTime.utc(2026, 11, 25, 10, 5),
          statut: 'terminee',
          resultat: const {'volume_verse_ml': 21.5},
        ),
      ],
      evenements: [
        EvenementTentative(
          id: 'event-1',
          tentativeId: 'attempt-1',
          rang: 1,
          horodatage: DateTime.utc(2026, 11, 25, 10, 1),
          action: 'ajout_reactif',
          valeurs: const {'volume_ml': 2.5},
        ),
      ],
    ));

    expect(appels.map((request) => request.url.path),
        ['/tentatives', '/tentatives/sync']);
    expect(resultats.map((resultat) => resultat.id), ['attempt-1', 'event-1']);
    expect(
        resultats.map((resultat) => resultat.statut), ['accepte', 'accepte']);
  });
}
