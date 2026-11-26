import 'package:edulab_mobile/core/api_provisoire/modeles.dart';
import 'package:edulab_mobile/core/fournisseurs.dart';
import 'package:edulab_mobile/core/labo/moteur.dart';
import 'package:edulab_mobile/core/reseau/reseau.dart';
import 'package:edulab_mobile/core/theme/theme.dart';
import 'package:edulab_mobile/features/laboratoire/ecran_laboratoire.dart';
import 'package:edulab_mobile/features/laboratoire/etat_laboratoire.dart';
import 'package:edulab_mobile/features/laboratoire/widgets/zone_manipulation.dart';
import 'package:edulab_mobile/features/laboratoire/widgets/zone_materiel.dart';
import 'package:edulab_mobile/features/laboratoire/widgets/zone_resultat.dart';
import 'package:edulab_mobile/features/laboratoire/widgets/zone_securite.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support/faux.dart';

Widget _habiller(Widget enfant) => MaterialApp(
      theme: construireTheme(),
      home: Scaffold(body: SingleChildScrollView(child: enfant)),
    );

void main() {
  group('Zone matériel', () {
    testWidgets('affiche chaque pièce et signale celle qui est placée', (tester) async {
      await tester.pumpWidget(_habiller(ZoneMateriel(
        materiel: const ['lunettes', 'burette'],
        places: const {'burette'},
        onPlacer: (_) {},
      )));

      expect(find.text('Lunettes'), findsOneWidget);
      expect(find.text('Burette'), findsOneWidget);
      expect(find.bySemanticsLabel('Burette, placé'), findsOneWidget);
      expect(find.bySemanticsLabel('Lunettes, à placer'), findsOneWidget);
    });

    testWidgets('appelle onPlacer avec l\'identifiant de la pièce', (tester) async {
      final places = <String>[];
      await tester.pumpWidget(_habiller(ZoneMateriel(
        materiel: const ['lunettes'],
        places: const {},
        onPlacer: places.add,
      )));

      await tester.tap(find.text('Lunettes'));
      expect(places, ['lunettes']);
    });

    testWidgets('une pièce déjà placée ne se place pas deux fois', (tester) async {
      final places = <String>[];
      await tester.pumpWidget(_habiller(ZoneMateriel(
        materiel: const ['lunettes'],
        places: const {'lunettes'},
        onPlacer: places.add,
      )));

      await tester.tap(find.text('Lunettes'));
      expect(places, isEmpty);
    });
  });

  group('Zone manipulation', () {
    testWidgets('propose les trois réglages et rend le choix', (tester) async {
      final choix = <double>[];
      await tester.pumpWidget(_habiller(ZoneManipulation(
        niveau: NiveauxRobinet.ferme,
        volumeMl: 0,
        volumeMaxMl: 25,
        onChoisir: choix.add,
      )));

      expect(find.text('Robinet fermé'), findsOneWidget);
      await tester.tap(find.text('Goutte à goutte'));
      await tester.tap(find.text('Jet'));
      expect(choix, [NiveauxRobinet.goutte, NiveauxRobinet.jet]);
    });

    testWidgets('désactivée : aucun réglage possible', (tester) async {
      final choix = <double>[];
      await tester.pumpWidget(_habiller(ZoneManipulation(
        niveau: NiveauxRobinet.ferme,
        volumeMl: 0,
        volumeMaxMl: 25,
        desactive: true,
        onChoisir: choix.add,
      )));

      await tester.tap(find.text('Jet'));
      expect(choix, isEmpty);
    });
  });

  group('Zone sécurité', () {
    testWidgets('sans alerte', (tester) async {
      await tester.pumpWidget(_habiller(const ZoneSecurite()));
      expect(find.text('Sécurité · Aucune alerte'), findsOneWidget);
    });

    testWidgets('action bloquée : affiche le message de la règle', (tester) async {
      await tester.pumpWidget(
          _habiller(const ZoneSecurite(message: 'Mets d\'abord tes lunettes.')));
      expect(find.text('Sécurité · Action bloquée'), findsOneWidget);
      expect(find.text('Mets d\'abord tes lunettes.'), findsOneWidget);
    });
  });

  group('Zone résultat', () {
    testWidgets('affiche volume et pH avec la virgule décimale', (tester) async {
      await tester.pumpWidget(_habiller(const ZoneResultat(
        volumeMl: 0,
        ph: 3.0,
        tempsS: 0,
        courbe: [PointCourbe(0, 3.0)],
        enCours: false,
        termine: false,
      )));

      expect(find.text('Résultat · en attente'), findsOneWidget);
      expect(find.text('V = 0,00 mL · pH = 3,0'), findsOneWidget);
    });

    testWidgets('terminé', (tester) async {
      await tester.pumpWidget(_habiller(const ZoneResultat(
        volumeMl: 16.0,
        ph: 7.0,
        tempsS: 40,
        courbe: [PointCourbe(0, 3.0), PointCourbe(40, 7.0)],
        enCours: false,
        termine: true,
      )));

      expect(find.text('Résultat · terminé'), findsOneWidget);
      expect(find.text('V = 16,00 mL · pH = 7,0'), findsOneWidget);
    });
  });

  group('Écran laboratoire (4 zones assemblées)', () {
    late DepotMemoire depot;

    setUp(() {
      depot = DepotMemoire()
        ..packs['titrage_acide_base'] =
            const ExperiencePack(id: 'titrage_acide_base', version: 1, definition: definitionTitrage);
    });

    Future<void> ouvrir(WidgetTester tester, {MoteurTitrage? moteur}) async {
      tester.view.physicalSize = const Size(400, 3000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(ProviderScope(
        overrides: [
          depotLocalProvider.overrideWithValue(depot),
          apiProvider.overrideWithValue(FauxServeur()),
          moteurTitrageProvider.overrideWithValue(moteur ?? MoteurFactice()),
          enLigneProvider.overrideWith((ref) => Stream.value(true)),
        ],
        child: MaterialApp(
          theme: construireTheme(),
          home: const EcranLaboratoire(experienceId: 'titrage_acide_base'),
        ),
      ));
      await tester.pumpAndSettle();
    }

    testWidgets('montre les 4 zones et la carte de l\'assistant', (tester) async {
      await ouvrir(tester);

      expect(find.text('Matériel'), findsOneWidget);
      expect(find.text('Manipulation'), findsOneWidget);
      expect(find.text('Sécurité · Aucune alerte'), findsOneWidget);
      expect(find.text('Résultat · en attente'), findsOneWidget);
      expect(find.text('Assistant'), findsOneWidget);
    });

    testWidgets('sans lunettes, ouvrir le robinet est bloqué et journalisé', (tester) async {
      await ouvrir(tester);

      await tester.tap(find.text('Goutte à goutte'));
      await tester.pumpAndSettle();

      expect(find.text('Sécurité · Action bloquée'), findsOneWidget);
      expect(find.textContaining('Mets d\'abord tes lunettes'), findsOneWidget);
      expect(find.text('Robinet fermé'), findsOneWidget);
      expect(depot.evenements.map((e) => e.action), ['action_bloquee']);
      expect(depot.evenements.single.valeurs['regle_id'], 'lunettes_avant_soude');
    });

    testWidgets('avec les lunettes, le robinet s\'ouvre', (tester) async {
      await ouvrir(tester);

      await tester.tap(find.text('Lunettes'));
      await tester.pump();
      await tester.tap(find.text('Goutte à goutte'));
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Sécurité · Aucune alerte'), findsOneWidget);
      expect(find.text('Robinet goutte à goutte'), findsOneWidget);
      expect(depot.evenements.map((e) => e.action),
          ['placer_materiel', 'tourner_robinet']);
      expect(depot.evenements.map((e) => e.rang), [1, 2]);
    });

    testWidgets('simulation non branchée : message lisible, pas de calcul inventé',
        (tester) async {
      await ouvrir(tester, moteur: const MoteurNonBranche());

      expect(find.text('La simulation n\'est pas encore branchée.'), findsOneWidget);
      expect(find.text('Manipulation'), findsNothing);
    });
  });
}
