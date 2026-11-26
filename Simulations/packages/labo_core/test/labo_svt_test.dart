import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';
import 'simulation_aide.dart';

Sim _osmose() {
  final s = Sim(charger('osmose_pomme_de_terre'));
  const c = [
    'eau_distillee',
    'solution_saccharose_125',
    'solution_saccharose_250',
    'solution_saccharose_375'
  ];
  for (var i = 0; i < 4; i++) {
    s.placer('tube_${i + 1}', c[i]);
  }
  for (var i = 1; i <= 4; i++) {
    s.faire('introduire_tranches', {'tube_id': 'tube_$i'});
  }
  return s;
}

Sim _sol() {
  final s = Sim(charger('sol_constituants'));
  for (final m in ['bocal', 'regle_graduee', 'terre', 'eau']) {
    s.placer(m);
  }
  return s;
}

void main() {
  group('osmose_pomme_de_terre', () {
    test(
        'après 2 h, les moyennes sont celles du guide (3,125 / 2,7 / 2,4 / 2,15 cm)',
        () {
      final s = _osmose();
      s.avancer(7200);
      final l = s.labo as LaboOsmose;
      final att = [3.125, 2.7, 2.4, 2.15];
      for (var i = 0; i < 4; i++) {
        expect(l.longueurMoyenneCm(s.etat, 'tube_${i + 1}')!,
            closeTo(att[i], 1e-9));
        s.mesurer('longueur_moyenne_tube_${i + 1}_cm', att[i], 'cm');
      }
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.conseils.contains('deux_heures_ecoulees'), isTrue);
      expect(
          s.labo.resultat(s.etat)['longueur_moyenne_tube_1_cm'], equals(3.125));
    });

    test('évolution progressive : à 1 h, la moitié de la variation', () {
      final s = _osmose();
      s.avancer(3600);
      expect((s.labo as LaboOsmose).longueurMoyenneCm(s.etat, 'tube_1')!,
          closeTo(2.9125, 1e-9));
    });

    test('mesure avant 2 h : erreur ; lecture fausse : erreur', () {
      final s = _osmose();
      s.avancer(1800);
      s.mesurer('longueur_moyenne_tube_1_cm', 2.8, 'cm');
      expect(s.erreurs.contains('mesure_trop_tot'), isTrue);
      s.avancer(5400);
      s.mesurer('longueur_moyenne_tube_3_cm', 2.9, 'cm');
      expect(s.erreurs.contains('lecture_longueur'), isTrue);
    });

    test('deux tubes avec la même solution : conseil et erreur', () {
      final s = Sim(charger('osmose_pomme_de_terre'));
      s.placer('tube_1', 'eau_distillee');
      s.placer('tube_2', 'eau_distillee');
      expect(s.conseils.contains('tubes_identiques'), isTrue);
      expect(s.erreurs.contains('tubes_identiques'), isTrue);
    });

    test('tube sans solution ou tranches déjà introduites refusés', () {
      final s = Sim(charger('osmose_pomme_de_terre'));
      expect(() => s.placer('tube_1'), throwsArgumentError);
      expect(() => s.faire('introduire_tranches', {'tube_id': 'tube_1'}),
          throwsArgumentError);
      s.placer('tube_1', 'eau_distillee');
      s.faire('introduire_tranches', {'tube_id': 'tube_1'});
      expect(() => s.faire('introduire_tranches', {'tube_id': 'tube_1'}),
          throwsArgumentError);
    });
  });

  group('sol_constituants', () {
    test(
        'agiter, laisser 24 h : couches 4,8 / 1,9 / 3,2 cm et pourcentages du guide',
        () {
      final s = _sol();
      expect(s.conseils.contains('agitation_a_faire'), isTrue);
      s.faire('agiter', {'duree_s': 180});
      s.avancer(1800);
      s.faire('agiter', {'duree_s': 180});
      s.avancer(86400);
      final l = s.labo as LaboSol;
      expect(l.hauteurCouchesCm(s.etat, 'sable'), closeTo(4.8, 1e-9));
      expect(s.conseils.contains('couches_visibles'), isTrue);
      s.mesurer('hauteur_sable_cm', 4.8, 'cm');
      s.mesurer('hauteur_limon_cm', 1.9, 'cm');
      s.mesurer('hauteur_argile_cm', 3.2, 'cm');
      s.mesurer('hauteur_terre_totale_cm', 9.9, 'cm');
      s.mesurer('pourcentage_sable', 48.5, '%');
      s.mesurer('pourcentage_limon', 19.2, '%');
      s.mesurer('pourcentage_argile', 32.3, '%');
      expect(s.erreurs.isEmpty, isTrue);
    });

    test('mesure trop tôt, sans agitation, pourcentage faux : erreurs', () {
      final s = _sol();
      s.mesurer('hauteur_sable_cm', 4.8, 'cm');
      expect(s.erreurs.contains('agitation_insuffisante'), isTrue);
      s.faire('agiter', {'duree_s': 200});
      s.avancer(3600);
      s.mesurer('hauteur_limon_cm', 1.9, 'cm');
      expect(s.erreurs.contains('mesure_trop_tot'), isTrue);
      s.avancer(86400);
      s.mesurer('pourcentage_sable', 40.0, '%');
      s.mesurer('hauteur_argile_cm', 2.0, 'cm');
      expect(s.erreurs.contains('pourcentage_faux'), isTrue);
      expect(s.erreurs.contains('lecture_hauteur'), isTrue);
    });

    test('agiter sans terre ni eau refusé ; durée invalide refusée', () {
      final s = Sim(charger('sol_constituants'));
      expect(() => s.faire('agiter', {'duree_s': 180}), throwsArgumentError);
      final t = _sol();
      expect(() => t.faire('agiter', {'duree_s': 0}), throwsArgumentError);
    });
  });
}
