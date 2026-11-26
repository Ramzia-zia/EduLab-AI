import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

void main() {
  const p = ParametresBanc();
  group('Banc interactif : image sur l\'écran', () {
    test('p = 20 cm donne p\' = 60 cm (f\' = 15 cm)', () {
      final i = imageSurEcran(xObjetCm: 10, xLentilleCm: 30, xEcranCm: 90, parametres: p);
      expect(i.positionImageCm! - 30, closeTo(60, 1e-9));
      expect(i.nette, isTrue);
    });
    test('grandissement et taille', () {
      final i = imageSurEcran(xObjetCm: 10, xLentilleCm: 30, xEcranCm: 90, parametres: p);
      expect(i.grandissement!, closeTo(3.0, 1e-9));
      expect(i.tailleImageCm!, closeTo(3.6, 1e-9));
    });
    test('écran mal placé : flou 2,4 px par cm', () {
      final i = imageSurEcran(xObjetCm: 10, xLentilleCm: 30, xEcranCm: 95, parametres: p);
      expect(i.ecartCm!, closeTo(5.0, 0.01));
      expect(i.flouPx, closeTo(12.0, 0.03));
      expect(i.nette, isFalse);
    });
    test('netteté : seuil 0,5 cm', () {
      expect(imageSurEcran(xObjetCm: 10, xLentilleCm: 30, xEcranCm: 90.4, parametres: p).nette, isTrue);
      expect(imageSurEcran(xObjetCm: 10, xLentilleCm: 30, xEcranCm: 90.6, parametres: p).nette, isFalse);
    });
    test('objet au foyer ou plus près : pas d\'image réelle', () {
      expect(imageSurEcran(xObjetCm: 10, xLentilleCm: 25, xEcranCm: 70, parametres: p).positionImageCm, isNull);
      expect(imageSurEcran(xObjetCm: 10, xLentilleCm: 20, xEcranCm: 70, parametres: p).nette, isFalse);
    });
  });

  group('Bessel (D = 80 cm)', () {
    test('d = 40 cm et f\' = 15,0 cm', () {
      final pos = positionsBesselBanc(80, p)!;
      expect(pos[1] - pos[0], closeTo(40, 1e-9));
      expect((80 * 80 - 40 * 40) / (4 * 80), closeTo(15.0, 1e-9));
    });
    test('positions absolues avec objet à 10 cm : 30 et 70', () {
      final pos = positionsBesselBanc(80, p)!;
      expect(10 + pos[0], closeTo(30, 1e-9));
      expect(10 + pos[1], closeTo(70, 1e-9));
    });
    test('D < 4f\' : aucune position', () {
      expect(positionsBesselBanc(50, p), isNull);
    });
    test('à chaque position l\'image est nette, agrandie puis réduite', () {
      final pos = positionsBesselBanc(80, p)!;
      final a = imageSurEcran(xObjetCm: 10, xLentilleCm: 10 + pos[0], xEcranCm: 90, parametres: p);
      final b = imageSurEcran(xObjetCm: 10, xLentilleCm: 10 + pos[1], xEcranCm: 90, parametres: p);
      expect(a.nette, isTrue);
      expect(b.nette, isTrue);
      expect(a.grandissement!, greaterThan(1));
      expect(b.grandissement!, lessThan(1));
    });
  });

  group('Bilbermann', () {
    test('objet dans le plan focal : image nette de même taille', () {
      final i = imageAutocollimation(xObjetCm: 25, xLentilleCm: 40, parametres: p);
      expect(i.nette, isTrue);
      expect(i.grandissement!, closeTo(1.0, 1e-6));
      expect(i.tailleImageCm!, closeTo(1.2, 1e-6));
    });
    test('objet à 3 cm du plan focal : image floue', () {
      final i = imageAutocollimation(xObjetCm: 22, xLentilleCm: 40, parametres: p);
      expect(i.nette, isFalse);
    });
  });

  group('Rayons', () {
    test('sans miroir, trois rayons convergent à l\'image quand l\'écran est bon', () {
      final r = rayons(xObjetCm: 10, xLentilleCm: 30, xEcranCm: 90, parametres: p);
      final fin = r.where((s) => s.x2 == 90).toList();
      expect(fin.length, equals(3));
      for (final s in fin) {
        expect(s.y2, closeTo(-3.6, 1e-9));
      }
    });
    test('avec miroir et objet au foyer : les rayons reviennent au sommet inversé', () {
      final r = rayons(xObjetCm: 25, xLentilleCm: 40, xMiroirCm: 43, parametres: p);
      final retours = r.where((s) => s.retour && s.x2 == 25).toList();
      expect(retours.length, equals(3));
      for (final s in retours) {
        expect(s.y2, closeTo(-1.2, 1e-6));
      }
    });
  });

  group('Lecture sur la règle', () {
    test('arrondie au millimètre', () {
      expect(lectureRegleCm(30.04), closeTo(30.0, 1e-9));
      expect(lectureRegleCm(30.06), closeTo(30.1, 1e-9));
    });
    test('parallaxe : ± 0,5 mm', () {
      expect(lectureRegleCm(30.0, parallaxeMm: 0.5), closeTo(30.05, 1e-9));
    });
  });
}
