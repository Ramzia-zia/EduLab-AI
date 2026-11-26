import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

void main() {
  group('Bilbermann', () {
    test('f\' = |OA|', () {
      expect(foyerBilbermannCm(positionObjetCm: 35, positionLentilleCm: 50),
          closeTo(15, 1e-9));
      expect(foyerBilbermannCm(positionObjetCm: 65, positionLentilleCm: 50),
          closeTo(15, 1e-9));
    });
    test('objet confondu avec la lentille refusé', () {
      expect(
          () => foyerBilbermannCm(positionObjetCm: 50, positionLentilleCm: 50),
          throwsArgumentError);
    });
  });

  group('Bessel', () {
    test('f\' = (D² - d²) / (4D)', () {
      expect(foyerBesselCm(distanceObjetEcranCm: 80, ecartPositionsCm: 40),
          closeTo(15, 1e-9));
    });
    test('deux positions symétriques dont la somme vaut D', () {
      final p = positionsBessel(distanceObjetEcranCm: 80, fPrimeCm: 15)!;
      expect(p.l1Cm + p.l2Cm, closeTo(80, 1e-9));
      expect(p.ecartCm, closeTo(40, 1e-9));
    });
    test('aller-retour : f\' -> positions -> f\'', () {
      final p = positionsBessel(distanceObjetEcranCm: 90, fPrimeCm: 18)!;
      final f =
          foyerBesselCm(distanceObjetEcranCm: 90, ecartPositionsCm: p.ecartCm);
      expect(f, closeTo(18, 1e-9));
    });
    test('Q4 : pas de position si D < 4f\'', () {
      expect(positionsBessel(distanceObjetEcranCm: 50, fPrimeCm: 15), isNull);
    });
    test('D = 4f\' : une seule position (d = 0)', () {
      final p = positionsBessel(distanceObjetEcranCm: 60, fPrimeCm: 15)!;
      expect(p.ecartCm, closeTo(0, 1e-9));
      expect(p.l1Cm, closeTo(30, 1e-9));
    });
    test('écart d >= D refusé', () {
      expect(
          () => foyerBesselCm(distanceObjetEcranCm: 80, ecartPositionsCm: 80),
          throwsArgumentError);
    });
  });

  group('Descartes', () {
    test('OA = -30 cm donne OA\' = 30 cm et γ = -1', () {
      expect(positionImageCm(oaCm: -30, fPrimeCm: 15), closeTo(30, 1e-9));
      expect(grandissement(oaCm: -30, oaPrimeCm: 30), closeTo(-1, 1e-9));
    });
    test('les deux positions de Bessel sont conjuguées (OA et OA\' échangés)',
        () {
      final a = positionImageCm(oaCm: -20, fPrimeCm: 15)!;
      final b = positionImageCm(oaCm: -60, fPrimeCm: 15)!;
      expect(a, closeTo(60, 1e-9));
      expect(b, closeTo(20, 1e-9));
    });
    test('objet dans le plan focal : pas d\'image sur l\'écran', () {
      expect(positionImageCm(oaCm: -15, fPrimeCm: 15), isNull);
    });
    test('objet entre le foyer et la lentille : image virtuelle (OA\' < 0)',
        () {
      expect(positionImageCm(oaCm: -10, fPrimeCm: 15)!, closeTo(-30, 1e-9));
    });
    test('OA positif refusé', () {
      expect(
          () => positionImageCm(oaCm: 10, fPrimeCm: 15), throwsArgumentError);
    });
    test('aller-retour : (OA, OA\') -> f\'', () {
      final oaPrime = positionImageCm(oaCm: -45, fPrimeCm: 15)!;
      expect(
          foyerDescartesCm(oaCm: -45, oaPrimeCm: oaPrime), closeTo(15, 1e-9));
    });
    test('vergence : f\' = 15 cm donne 6,67 dioptries', () {
      expect(vergenceDioptries(fPrimeCm: 15), closeTo(6.6667, 1e-3));
    });
  });

  group('Statistiques', () {
    test('moyenne et écart-type n-1', () {
      final v = [14.8, 15.1, 15.0];
      expect(moyenne(v), closeTo(14.9667, 1e-3));
      expect(ecartTypeEchantillon(v), closeTo(0.1528, 1e-3));
    });
    test('écart-type d\'une seule valeur refusé', () {
      expect(() => ecartTypeEchantillon([15.0]), throwsArgumentError);
    });
    test('écart relatif : 17,20 mL pour 16,0 mL donne 7,5 %', () {
      expect(ecartRelatif(mesure: 17.2, reference: 16.0), closeTo(0.075, 1e-9));
    });
  });
}
