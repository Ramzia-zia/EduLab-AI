import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

void main() {
  group('Oscilloscope', () {
    test('tension continue : U = Sv x y', () {
      expect(
          tensionContinueDepuisDeviationV(
              sensibiliteVParDiv: 2, deviationDiv: 3),
          closeTo(6, 1e-9));
    });
    test('déviation et tension sont réciproques', () {
      final y = deviationDepuisTensionDiv(tensionV: 5, sensibiliteVParDiv: 2);
      expect(
          tensionContinueDepuisDeviationV(
              sensibiliteVParDiv: 2, deviationDiv: y),
          closeTo(5, 1e-12));
    });
    test('trace visible ou hors écran', () {
      expect(traceVisible(deviationDiv: 3, demiHauteurEcranDiv: 4), isTrue);
      expect(traceVisible(deviationDiv: -4, demiHauteurEcranDiv: 4), isTrue);
      expect(traceVisible(deviationDiv: 6, demiHauteurEcranDiv: 4), isFalse);
    });
    test('T = n x Sb, f = 1 / T', () {
      final t = periodeDepuisDivisionsS(
          divisionsParPeriode: 5, baseTempsSParDiv: 0.001);
      expect(t, closeTo(0.005, 1e-12));
      expect(frequenceDepuisPeriodeHz(periodeS: t), closeTo(200, 1e-9));
    });
    test('Um = Sv x ym et Ueff = Um / √2', () {
      final um = valeurMaximaleDepuisDivisionsV(
          sensibiliteVParDiv: 2, divisionsSommet: 3);
      expect(um, closeTo(6, 1e-12));
      expect(valeurEfficaceDepuisMaximaleV(valeurMaximaleV: um),
          closeTo(4.2426, 1e-3));
    });
    test('Q4 : doubler la fréquence divise par deux les divisions par période',
        () {
      final n1 = divisionsParPeriode(frequenceHz: 200, baseTempsSParDiv: 0.001);
      final n2 = divisionsParPeriode(frequenceHz: 400, baseTempsSParDiv: 0.001);
      expect(n2, closeTo(n1 / 2, 1e-12));
    });
    test('le signal est périodique et de moyenne nulle (alternatif)', () {
      const um = 6.0;
      const f = 200.0;
      expect(
          tensionSinusoidaleV(valeurMaximaleV: um, frequenceHz: f, tempsS: 0),
          closeTo(0, 1e-9));
      expect(
          tensionSinusoidaleV(
              valeurMaximaleV: um, frequenceHz: f, tempsS: 1 / (4 * f)),
          closeTo(um, 1e-9));
      expect(
          tensionSinusoidaleV(
              valeurMaximaleV: um, frequenceHz: f, tempsS: 1 / (2 * f)),
          closeTo(0, 1e-9));
      expect(
          tensionSinusoidaleV(
              valeurMaximaleV: um, frequenceHz: f, tempsS: 3 / (4 * f)),
          closeTo(-um, 1e-9));
    });
    test('valeurs invalides refusées', () {
      expect(() => frequenceDepuisPeriodeHz(periodeS: 0), throwsArgumentError);
      expect(
          () => deviationDepuisTensionDiv(tensionV: 1, sensibiliteVParDiv: 0),
          throwsArgumentError);
    });
  });
}
