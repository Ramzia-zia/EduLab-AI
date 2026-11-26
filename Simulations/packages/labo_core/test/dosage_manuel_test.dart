import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

void main() {
  const s = SerieDosage();
  group('Dosage manuel : points de repère de la SPEC', () {
    test('Ve = 16,0 mL', () => expect(s.veMl, closeTo(16.0, 1e-9)));
    test('pH initial 1,10', () => expect(phDosage(s, 0), closeTo(1.10, 0.01)));
    test('pH 1,54 à 8 mL', () => expect(phDosage(s, 8), closeTo(1.54, 0.01)));
    test('pH 2,54 à 15 mL', () => expect(phDosage(s, 15), closeTo(2.54, 0.01)));
    test('pH 7,00 à 16 mL', () => expect(phDosage(s, 16), closeTo(7.0, 1e-9)));
    test('pH 10,14 à 16,05 mL', () => expect(phDosage(s, 16.05), closeTo(10.14, 0.01)));
    test('pH 11,14 à 16,5 mL', () => expect(phDosage(s, 16.5), closeTo(11.14, 0.01)));
    test('pH 12,00 à 20 mL', () => expect(phDosage(s, 20), closeTo(12.0, 0.01)));
  });
  group('Couleur et erreurs', () {
    test('incolore avant l\'équivalence', () => expect(intensiteRose(phDosage(s, 15.95)), closeTo(0, 1e-9)));
    test('rose à une goutte après l\'équivalence', () {
      expect(intensiteRose(phDosage(s, 16.05)), greaterThan(0.3));
    });
    test('rose plus intense en cas de surdosage', () {
      expect(intensiteRose(phDosage(s, 16.5)), greaterThan(intensiteRose(phDosage(s, 16.05))));
    });
    test('goutte de 0,05 mL à ± 5 %', () {
      expect(volumeGoutteMl(0), closeTo(0.05, 1e-12));
      expect(volumeGoutteMl(1), closeTo(0.0525, 1e-12));
    });
    test('pipette : 5 mm d\'écart donnent 0,2 mL', () => expect(volumePipetteMl(20, 5), closeTo(20.2, 1e-9)));
    test('bulle : volume réel inférieur au volume lu', () => expect(volumeVerseAvecBulle(16, true), closeTo(15.7, 1e-9)));
    test('plus de 5 gouttes d\'indicateur décalent le virage', () {
      expect(decalageVirageMl(3), closeTo(0, 1e-12));
      expect(decalageVirageMl(8), closeTo(0.09, 1e-12));
    });
    test('la tache rose s\'estompe plus vite en agitant', () {
      expect(tacheLocale(1, 5, 1), lessThan(tacheLocale(1, 5, 0)));
    });
  });
}
