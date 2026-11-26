import 'package:edulab_mobile/core/api_provisoire/modeles.dart';
import 'package:edulab_mobile/features/horsligne/depot_local.dart';
import 'package:edulab_mobile/features/horsligne/depot_preferences_web.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('persists offline records and sends only unfinished sync items',
      () async {
    final depot = DepotPreferencesWeb();
    final tentative = Tentative(
      id: 'attempt-1',
      experienceId: 'exp-1',
      versionExperience: 1,
      debut: DateTime.utc(2026, 11, 25, 10),
      statut: 'en_cours',
    );
    await depot.creerTentative(tentative);
    await depot.ajouterEvenement(_evenement('event-2', 2));
    await depot.ajouterEvenement(_evenement('event-1', 1));
    expect(await depot.enAttente(10), isEmpty);

    await depot.terminerTentative(
      id: tentative.id,
      fin: DateTime.utc(2026, 11, 25, 10, 5),
      statut: 'terminee',
      resultat: const {'volume_verse_ml': 21.5},
    );
    final file = await DepotPreferencesWeb().enAttente(10);
    expect(file.first, isA<ElementTentative>());
    expect(
      file.skip(1).map((element) => (element as ElementEvenement).evenement.id),
      ['event-1', 'event-2'],
    );

    expect(
      await depot.appliquer(const [
        ResultatSync(id: 'attempt-1', statut: 'accepte'),
        ResultatSync(id: 'event-1', statut: 'accepte'),
      ]),
      2,
    );
    final restante = await DepotPreferencesWeb().enAttente(10);
    expect(restante, hasLength(1));
    expect((restante.single as ElementEvenement).evenement.id, 'event-2');
  });
}

EvenementTentative _evenement(String id, int rang) => EvenementTentative(
      id: id,
      tentativeId: 'attempt-1',
      rang: rang,
      horodatage: DateTime.utc(2026, 11, 25, 10, rang),
      action: 'mesure',
      valeurs: {'rang': rang},
    );
