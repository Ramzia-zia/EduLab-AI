import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';
import 'simulation_aide.dart';

Sim _pret({bool lunettes = true, double acide = 20}) {
  final s = Sim(charger('titrage_acide_base'));
  for (final m in ['burette', 'becher', 'soude', 'erlenmeyer', 'pipette']) {
    s.placer(m);
  }
  if (lunettes) s.placer('lunettes');
  s.faire('verser', {'solution': 'acide', 'volume_ml': acide});
  s.faire('verser', {'solution': 'phenolphtaleine', 'volume_ml': 3});
  return s;
}

AffichageDosage _a(Sim s) => (s.labo as LaboDosage).affichage(s.etat);

void main() {
  group('titrage_acide_base', () {
    test('équivalence à 16,0 mL et pH de référence', () {
      expect(volumeEquivalentMl(caMolL: 0.08, vaMl: 20, cbMolL: 0.1),
          closeTo(16.0, 1e-9));
      final s = _pret();
      expect(_a(s).ph!, closeTo(1.1, 0.02));
    });

    test('sans lunettes, le robinet reste bloqué', () {
      final s = _pret(lunettes: false);
      final r = s.faire('tourner_robinet', {'debit': 'goutte_a_goutte'});
      expect(r.bloquee, isTrue);
      expect(r.evenement.valeurs['regle_id'], equals('lunettes_avant_soude'));
      expect(
          r.message,
          equals(
              'Mets d\'abord tes lunettes : la soude peut abîmer les yeux.'));
      expect(s.erreurs.join(','), equals('lunettes_oubliees'));
      s.placer('lunettes');
      expect(s.faire('tourner_robinet', {'debit': 'goutte_a_goutte'}).bloquee,
          isFalse);
    });

    test('dosage soigné : jet puis goutte à goutte, virage, mesures justes',
        () {
      final s = _pret();
      s.faire('tourner_robinet', {'debit': 'jet'});
      s.avancer(20); // 10 mL
      expect(_a(s).volumeVerseMl, closeTo(10, 1e-9));
      s.faire('tourner_robinet', {'debit': 'goutte_a_goutte'});
      s.avancer(120); // 16,0 mL
      expect(_a(s).ph!, closeTo(7.0, 0.02));
      expect(_a(s).couleur, equals('incolore'));
      s.avancer(2); // 16,1 mL
      expect(_a(s).couleur, equals('rose'));
      expect(s.conseils.contains('equivalence_atteinte'), isTrue);
      s.faire('tourner_robinet', {'debit': 'ferme'});
      s.mesurer('volume_equivalent_ml', 16.1, 'mL');
      s.mesurer('concentration_mol_l', 0.0805, 'mol/L');
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.labo.resultat(s.etat)['volume_equivalent_ml'], equals(16.1));
    });

    test('jet jusqu\'au bout : conseil, débit trop rapide, dépassement', () {
      final s = _pret();
      s.faire('tourner_robinet', {'debit': 'jet'});
      s.avancer(30); // 15 mL : proche de l'équivalence en jet
      expect(s.conseils.contains('volume_proche_equivalence'), isTrue);
      s.avancer(10); // 20 mL
      expect(s.erreurs.join(','),
          equals('debit_trop_rapide,depassement_equivalence'));
    });

    test('erreurs de volume d\'acide, de lecture et d\'unité', () {
      final s = _pret(acide: 15);
      expect(s.erreurs.contains('erreur_volume_acide'), isTrue);
      final t = _pret();
      t.faire('tourner_robinet', {'debit': 'jet'});
      t.avancer(32);
      t.faire('tourner_robinet', {'debit': 'ferme'});
      t.mesurer('volume_equivalent_ml', 14.0, 'mL');
      t.mesurer('concentration_mol_l', 0.08, 'mol');
      expect(t.erreurs.contains('lecture_burette'), isTrue);
      expect(t.erreurs.contains('unite_concentration'), isTrue);
    });

    test('burette de 25 mL : le volume ne dépasse pas la graduation', () {
      final s = _pret();
      s.faire('tourner_robinet', {'debit': 'jet'});
      s.avancer(500);
      expect(_a(s).volumeVerseMl, equals(25.0));
    });

    test('robinet fermé ou burette absente : rien ne coule', () {
      final s = _pret();
      s.avancer(100);
      expect(_a(s).volumeVerseMl, equals(0.0));
      final t = Sim(charger('titrage_acide_base'));
      t.placer('lunettes');
      expect(() => t.faire('tourner_robinet', {'debit': 'jet'}),
          throwsArgumentError);
    });
  });
}
