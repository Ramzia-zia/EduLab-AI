import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

void main() {
  group('Résistances et loi d\'Ohm', () {
    test('série : 100 + 150 = 250 ohms', () {
      expect(resistanceSerieOhm([100, 150]), closeTo(250, 1e-9));
    });
    test('dérivation : 100 // 150 = 60 ohms', () {
      expect(resistanceDerivationOhm([100, 150]), closeTo(60, 1e-9));
    });
    test('résistance négative ou nulle refusée', () {
      expect(() => resistanceSerieOhm([100, 0]), throwsArgumentError);
      expect(() => resistanceDerivationOhm([-5]), throwsArgumentError);
      expect(() => resistanceSerieOhm([]), throwsArgumentError);
    });
    test('I = U / R', () {
      expect(intensiteLoiOhmA(tensionV: 6, resistanceOhm: 250),
          closeTo(0.024, 1e-9));
      expect(() => intensiteLoiOhmA(tensionV: 6, resistanceOhm: 0),
          throwsArgumentError);
    });
  });

  group('Loi d\'unicité (série) et loi des nœuds (dérivation)', () {
    test('la même intensité en série ne dépend pas de l\'ordre de R1 et R2',
        () {
      final a = intensiteSerieA(tensionGenerateurV: 6, r1Ohm: 100, r2Ohm: 150);
      final b = intensiteSerieA(tensionGenerateurV: 6, r1Ohm: 150, r2Ohm: 100);
      expect(a, closeTo(b, 1e-12));
    });
    test('loi des nœuds : I0 = I1 + I2, pas de partage à parts égales', () {
      final c =
          courantsDerivation(tensionGenerateurV: 6, r1Ohm: 100, r2Ohm: 150);
      expect(c.i0A, closeTo(c.i1A + c.i2A, 1e-12));
      expect(c.i1A == c.i2A,
          isFalse); // Q3 de la fiche : le courant ne se partage pas à parts égales
      expect(
          c.i1A,
          greaterThan(
              c.i2A)); // la plus petite résistance reçoit le plus grand courant
    });
    test('I0 en dérivation égale U / résistance équivalente', () {
      final c =
          courantsDerivation(tensionGenerateurV: 6, r1Ohm: 100, r2Ohm: 150);
      final i = intensiteLoiOhmA(
          tensionV: 6, resistanceOhm: resistanceDerivationOhm([100, 150]));
      expect(c.i0A, closeTo(i, 1e-12));
    });
  });

  group('Tensions', () {
    test('série : U_PA + U_AN = U_PN', () {
      final t = tensionsSerie(tensionGenerateurV: 6, r1Ohm: 100, r2Ohm: 150);
      expect(t.uPaV + t.uAnV, closeTo(t.uPnV, 1e-12));
    });
    test('intervertir R1 et R2 ne change pas U_PN (Q4)', () {
      final a = tensionsSerie(tensionGenerateurV: 6, r1Ohm: 100, r2Ohm: 150);
      final b = tensionsSerie(tensionGenerateurV: 6, r1Ohm: 150, r2Ohm: 100);
      expect(a.uPnV, closeTo(b.uPnV, 1e-12));
    });
    test('masse en N : V_P - V_A = U_PA (Q6 du TP tension n°1)', () {
      final p =
          potentielsSerie(tensionGenerateurV: 4.5, r1Ohm: 100, r2Ohm: 150);
      final t = tensionsSerie(tensionGenerateurV: 4.5, r1Ohm: 100, r2Ohm: 150);
      expect(p.potentielPV - p.potentielAV, closeTo(t.uPaV, 1e-12));
      expect(p.potentielNV, equals(0.0));
    });
    test('interrupteur : tension du générateur si ouvert, 0 si fermé', () {
      expect(tensionInterrupteurV(ferme: false, tensionGenerateurV: 6),
          equals(6.0));
      expect(tensionInterrupteurV(ferme: true, tensionGenerateurV: 6),
          equals(0.0));
    });
    test('voltmètre inversé : même valeur, signe moins', () {
      final normal =
          tensionMesureeV(potentielBorneVV: 6, potentielBorneComV: 3.6);
      final inverse =
          tensionMesureeV(potentielBorneVV: 3.6, potentielBorneComV: 6);
      expect(inverse, closeTo(-normal, 1e-12));
    });
    test('dérivation : U_PN = U1 = U2', () {
      final t = tensionsDerivation(tensionGenerateurV: 6);
      expect(t.u1V, equals(t.uPnV));
      expect(t.u2V, equals(t.uPnV));
    });
  });

  group('Appareil à aiguille', () {
    test('lecture à 24 divisions pour 24 mA au calibre 0,1 A', () {
      final l = lectureAiguilleIntensite(
          intensiteA: 0.024, calibreA: 0.1, divisionsTotal: 100);
      expect(l.divisions, closeTo(24, 1e-9));
      expect(l.horsEchelle, isFalse);
      expect(l.sensInverse, isFalse);
    });
    test(
        'hors échelle quand l\'intensité dépasse le calibre : l\'aiguille bute',
        () {
      final l = lectureAiguilleIntensite(
          intensiteA: 0.2, calibreA: 0.1, divisionsTotal: 100);
      expect(l.horsEchelle, isTrue);
      expect(l.divisions, equals(100.0));
    });
    test('pleine échelle exacte n\'est pas hors échelle', () {
      final l = lectureAiguilleIntensite(
          intensiteA: 0.1, calibreA: 0.1, divisionsTotal: 100);
      expect(l.horsEchelle, isFalse);
    });
    test('polarité inversée : l\'aiguille part à l\'envers', () {
      final l = lectureAiguilleTension(
          tensionV: -2.4, calibreV: 3, divisionsTotal: 30);
      expect(l.sensInverse, isTrue);
      expect(l.divisions, equals(0.0));
    });
    test('aller-retour : I -> lecture -> I', () {
      final l = lectureAiguilleIntensite(
          intensiteA: 0.024, calibreA: 0.3, divisionsTotal: 100);
      final i = intensiteDepuisLectureA(
          calibreA: 0.3, lectureDiv: l.divisions, divisionsTotal: 100);
      expect(i, closeTo(0.024, 1e-12));
    });
    test('calibre ou nombre de divisions invalide refusé', () {
      expect(
          () => lectureAiguilleIntensite(
              intensiteA: 0.02, calibreA: 0, divisionsTotal: 100),
          throwsArgumentError);
      expect(
          () => lectureAiguilleIntensite(
              intensiteA: 0.02, calibreA: 0.1, divisionsTotal: 0),
          throwsArgumentError);
    });
  });

  group('Incertitude', () {
    test('ΔI = classe x calibre / 100 ; précision = ΔI / I', () {
      final delta = incertitudeAbsolueA(classe: 1.5, calibreA: 0.1);
      expect(delta, closeTo(0.0015, 1e-12));
      expect(
          incertitudeRelative(incertitudeAbsolue: delta, valeurMesuree: 0.024),
          closeTo(0.0625, 1e-9));
    });
    test(
        'Q5 : un calibre plus grand donne une incertitude relative plus grande',
        () {
      final petit = incertitudeRelative(
          incertitudeAbsolue: incertitudeAbsolueA(classe: 1.5, calibreA: 0.1),
          valeurMesuree: 0.024);
      final grand = incertitudeRelative(
          incertitudeAbsolue: incertitudeAbsolueA(classe: 1.5, calibreA: 0.3),
          valeurMesuree: 0.024);
      expect(grand, greaterThan(petit));
    });
    test('encadrement', () {
      final e = encadrement(valeurMesuree: 0.024, incertitudeAbsolue: 0.0015);
      expect(e.minimum, closeTo(0.0225, 1e-12));
      expect(e.maximum, closeTo(0.0255, 1e-12));
    });
    test('valeur mesurée nulle refusée pour l\'incertitude relative', () {
      expect(
          () =>
              incertitudeRelative(incertitudeAbsolue: 0.001, valeurMesuree: 0),
          throwsArgumentError);
    });
  });
}
