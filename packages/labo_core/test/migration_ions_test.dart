import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

void main() {
  group('Migration des ions', () {
    test(
        'Cu²⁺ (bleu) migre vers la cathode, dans le sens du courant conventionnel',
        () {
      expect(electrodeVersLaquelleMigre(chargeElementaire: 2),
          equals(Electrode.cathode));
      expect(memeSensQueCourantConventionnel(chargeElementaire: 2), isTrue);
    });
    test(
        'MnO₄⁻ (violet) migre vers l\'anode, en sens contraire du courant conventionnel',
        () {
      expect(electrodeVersLaquelleMigre(chargeElementaire: -1),
          equals(Electrode.anode));
      expect(memeSensQueCourantConventionnel(chargeElementaire: -1), isFalse);
    });
    test('charge nulle refusée', () {
      expect(() => electrodeVersLaquelleMigre(chargeElementaire: 0),
          throwsArgumentError);
      expect(() => memeSensQueCourantConventionnel(chargeElementaire: 0),
          throwsArgumentError);
    });
  });
}
