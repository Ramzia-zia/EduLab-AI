import 'package:edulab_mobile/features/horsligne/service_sync.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support/faux.dart';

void main() {
  late DepotMemoire depot;
  late FauxServeur serveur;
  late ServiceSync service;

  setUp(() {
    depot = DepotMemoire();
    serveur = FauxServeur();
    service = ServiceSync(depot, serveur);
  });

  /// Une tentative terminée avec [nb] événements.
  void remplir(int nb, {String id = 'a'}) {
    depot.tentatives[id] = tentativeTerminee(id, DateTime.utc(2026, 11, 11, 8));
    for (var r = 1; r <= nb; r++) {
      depot.evenements.add(evenement(id, r));
    }
  }

  test('envoie par lots de 50 éléments au plus', () async {
    remplir(120); // 1 tentative + 120 événements = 121 éléments
    final resume = await service.envoyerTout();

    expect(resume.interrompu, isFalse);
    expect(resume.envoyes, 121);
    expect(serveur.lots.length, 3); // 50 + 50 + 21
    for (final lot in serveur.lots) {
      expect(lot.tentatives.length + lot.evenements.length, lessThanOrEqualTo(50));
    }
    expect(await depot.nombreEnAttente(), 0);
  });

  test('les événements partent dans l\'ordre des rang, la tentative d\'abord', () async {
    remplir(60);
    await service.envoyerTout();

    expect(serveur.lots.first.tentatives.single.id, 'a');
    final rangs = [for (final l in serveur.lots) ...l.evenements.map((e) => e.rang)];
    expect(rangs, List.generate(60, (i) => i + 1));
  });

  test('ne renvoie jamais un élément déjà accepté', () async {
    remplir(10);
    await service.envoyerTout();
    final apres = serveur.lots.length;

    await service.envoyerTout();
    expect(serveur.lots.length, apres);
  });

  test('une tentative en cours reste sur le téléphone', () async {
    depot.tentatives['b'] = tentativeTerminee('b', DateTime.utc(2026, 11, 11))
        .copyWith(statut: 'en_cours');
    depot.evenements.add(evenement('b', 1));

    final resume = await service.envoyerTout();
    expect(resume.envoyes, 0);
    expect(serveur.lots, isEmpty);
  });

  test('sans réseau : rien n\'est perdu, la file garde tout', () async {
    remplir(10);
    serveur.horsLigne = true;

    final resume = await service.envoyerTout();
    expect(resume.interrompu, isTrue);
    expect(resume.envoyes, 0);
    expect(await depot.nombreEnAttente(), 11);

    serveur.horsLigne = false;
    final reprise = await service.envoyerTout();
    expect(reprise.interrompu, isFalse);
    expect(await depot.nombreEnAttente(), 0);
  });

  test('coupure au milieu : les lots déjà envoyés restent envoyés', () async {
    remplir(120);
    serveur.coupureApresLots = 1;

    final resume = await service.envoyerTout();
    expect(resume.interrompu, isTrue);
    expect(resume.envoyes, 50);
    expect(await depot.nombreEnAttente(), 71);
  });

  test('deja_recu est marqué envoyé sans être écrit une deuxième fois', () async {
    remplir(2);
    serveur.dejaRecus.add('a-ev1');

    await service.envoyerTout();
    expect(await depot.nombreEnAttente(), 0);
  });

  test('un élément refusé est marqué avec son code et n\'est pas renvoyé', () async {
    remplir(2);
    serveur.refuses['a-ev2'] = 'donnees_invalides';

    await service.envoyerTout();
    expect(depot.refuses['a-ev2'], 'donnees_invalides');
    expect(await depot.nombreEnAttente(), 0);
  });

  test('refuse une taille de lot au-dessus de 50', () {
    expect(() => ServiceSync(depot, serveur, tailleLot: 51), throwsAssertionError);
  });
}
