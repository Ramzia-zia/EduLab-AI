import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';
import 'simulation_aide.dart';

const _ids = [
  'mesure_intensite',
  'lois_courant',
  'mesure_tension_masse',
  'lois_tensions',
  'oscilloscope_tension',
  'focale_lentille',
  'migration_ions',
];

// ---------------------------------------------------------------- oscilloscope
Sim _oscillo({bool masse = true}) {
  final s = Sim(charger('oscilloscope_tension'));
  s.placer('oscilloscope');
  s.placer('alimentation', 'entree_y1');
  if (masse) s.faire('relier_masse', {'point_id': 'alimentation'});
  return s;
}

AffichageOscilloscope _ecran(Sim s) =>
    (s.labo as LaboOscilloscope).affichage(s.etat);

// --------------------------------------------------------------------- optique
Sim _banc() {
  final s = Sim(charger('focale_lentille'));
  for (final id in [
    'banc_optique',
    'lentille_convergente',
    'objet_lumineux',
    'ecran'
  ]) {
    s.placer(id);
  }
  return s;
}

void _deplacer(Sim s, String id, double cm) =>
    s.faire('deplacer_materiel', {'materiel_id': id, 'position_cm': cm});

AffichageOptique _optique(Sim s) => (s.labo as LaboOptique).affichage(s.etat);

// ------------------------------------------------------------------- migration
Sim _migration({bool gants = true, String a = 'droite', String b = 'gauche'}) {
  final s = Sim(charger('migration_ions'));
  for (final id in [
    'alimentation',
    'interrupteur_k',
    'rheostat',
    'amperemetre',
    'papier_filtre'
  ]) {
    s.placer(id);
  }
  s.placer('electrode_a', a);
  s.placer('electrode_b', b);
  if (gants) s.placer('gants');
  return s;
}

void main() {
  group('définitions JSON', () {
    for (final id in _ids) {
      test(
          '$id : toutes les conditions, conseils et actions sont connus du moteur',
          () {
        final labo = charger(id);
        final d = labo.definition;
        expect(d.id, equals(id));
        final etat = labo.etatInitial();
        for (final r in d.securite) {
          if (!d.materiel.contains(r.exige))
            labo.condition(r.exige, etat); // ne doit pas lever
          expect(labo.actions.contains(r.avant), isTrue);
        }
        for (final c in d.conseils) {
          labo.conseilActif(c.quand, etat); // ne doit pas lever
        }
        expect(d.matiere, equals('physique'));
      });
    }

    test('une définition avec un champ en trop ou en moins est refusée', () {
      expect(() => DefinitionExperience.fromJson({'id': 'x'}),
          throwsArgumentError);
    });

    test('un moteur inconnu est refusé', () {
      final d = definition('mesure_intensite');
      final autre = DefinitionExperience(
        id: d.id,
        matiere: d.matiere,
        niveau: d.niveau,
        materiel: d.materiel,
        securite: d.securite,
        conseils: d.conseils,
        calcul: 'inconnu',
      );
      expect(() => creerLaboratoire(autre), throwsArgumentError);
    });
  });

  group('oscilloscope_tension', () {
    test('la mesure est bloquée tant que les masses ne sont pas reliées', () {
      final s = _oscillo(masse: false);
      final r = s.mesurer('u_continue_v', 0, 'V');
      expect(r.bloquee, isTrue);
      expect(r.evenement.valeurs['regle_id'], equals('masse_commune'));
      expect(s.erreurs.join(','), equals('masse_oscilloscope_oubliee'));
    });

    test(
        'tension continue : GND puis DC, trace à 3 divisions pour 6 V avec 2 V/div',
        () {
      final s = _oscillo();
      expect(s.conseils.contains('reference_non_reglee'), isTrue);
      s.faire('choisir_couplage', {'couplage': 'gnd'});
      expect(s.conseils.contains('reference_non_reglee'), isFalse);
      expect(_ecran(s).signalPresent, isFalse);
      s.faire('regler_tension', {'tension_v': 6});
      s.faire('choisir_couplage', {'couplage': 'dc'});
      s.faire('regler_sensibilite', {'sensibilite_v_par_div': 2.0});
      expect(_ecran(s).deviationDiv, closeTo(3, 1e-9));
      s.mesurer('u_continue_v', 6.0, 'V');
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.labo.resultat(s.etat)['u_continue_v'], equals(6.0));
    });

    test('sensibilité trop petite : trace hors écran, conseil, erreur au bilan',
        () {
      final s = _oscillo();
      s.faire('choisir_couplage', {'couplage': 'gnd'});
      s.faire('regler_tension', {'tension_v': 6});
      s.faire('choisir_couplage', {'couplage': 'dc'});
      s.faire('regler_sensibilite', {'sensibilite_v_par_div': 1.0});
      expect(_ecran(s).traceVisible, isFalse);
      expect(s.conseils.contains('trace_hors_ecran'), isTrue);
      s.mesurer('u_continue_v', 6.0, 'V');
      expect(s.erreurs.contains('trace_hors_ecran'), isTrue);
    });

    test('sensibilité réductible : on peut gagner en précision', () {
      final s = _oscillo();
      s.faire('choisir_couplage', {'couplage': 'gnd'});
      s.faire('regler_tension', {'tension_v': 6});
      s.faire('choisir_couplage', {'couplage': 'dc'});
      s.faire('regler_sensibilite', {'sensibilite_v_par_div': 5.0});
      expect(s.conseils.contains('sensibilite_reductible'), isTrue);
      s.faire('regler_sensibilite', {'sensibilite_v_par_div': 2.0});
      expect(s.conseils.contains('sensibilite_reductible'), isFalse);
    });

    test(
        'GBF 200 Hz : T = 5 ms, 5 divisions par période à 1 ms/div, sommet à 3 divisions',
        () {
      final s = _oscillo();
      s.placer('gbf', 'entree_y1'); // remplace l'alimentation sur Y1
      expect(s.etat.materiel['alimentation'], isNull);
      s.faire('relier_masse', {'point_id': 'gbf'});
      s.faire('choisir_couplage', {'couplage': 'gnd'});
      s.faire('choisir_couplage', {'couplage': 'dc'});
      s.faire('regler_gbf', {'frequence_hz': 200});
      s.faire('regler_base_temps', {'base_temps_s_par_div': 0.001});
      s.faire('regler_sensibilite', {'sensibilite_v_par_div': 2.0});
      final e = _ecran(s);
      expect(e.divisionsParPeriode!, closeTo(5, 1e-9));
      expect(e.deviationDiv, closeTo(3, 1e-9));
      s.mesurer('n_div', 5, 'div');
      s.mesurer('ym_div', 3, 'div');
      s.mesurer('periode_s', 0.005, 's');
      s.mesurer('frequence_hz', 200, 'Hz');
      s.mesurer('um_v', 6.0, 'V');
      s.mesurer('ueff_v', 4.24, 'V');
      expect(s.erreurs.isEmpty, isTrue);
      final r = s.labo.resultat(s.etat);
      expect(r['um_v'], equals(6.0));
      expect(r['ueff_v'], equals(4.24));
    });

    test('Q4 : doubler la fréquence divise par deux les divisions par période',
        () {
      final s = _oscillo();
      s.placer('gbf', 'entree_y1');
      s.faire('regler_base_temps', {'base_temps_s_par_div': 0.001});
      s.faire('regler_gbf', {'frequence_hz': 200});
      final n1 = _ecran(s).divisionsParPeriode!;
      s.faire('regler_gbf', {'frequence_hz': 400});
      expect(_ecran(s).divisionsParPeriode!, closeTo(n1 / 2, 1e-9));
    });

    test('erreurs de lecture et confusion Um / Ueff détectées', () {
      final s = _oscillo();
      s.placer('gbf', 'entree_y1');
      s.faire('relier_masse', {'point_id': 'gbf'});
      s.faire('regler_gbf', {'frequence_hz': 200});
      s.faire('regler_base_temps', {'base_temps_s_par_div': 0.001});
      s.faire('regler_sensibilite', {'sensibilite_v_par_div': 2.0});
      s.faire('choisir_couplage', {'couplage': 'dc'});
      s.mesurer('n_div', 8, 'div'); // vraie valeur : 5
      s.mesurer('um_v', 6.0, 'V');
      s.mesurer('ueff_v', 6.0, 'V'); // pas divisée par racine de 2
      expect(s.erreurs.join(','),
          equals('lecture_oscillogramme,confusion_maximale_efficace'));
    });

    test('valeurs hors des réglages de l\'appareil refusées', () {
      final s = _oscillo();
      expect(
          () => s.faire('regler_sensibilite', {'sensibilite_v_par_div': 3.0}),
          throwsArgumentError);
      expect(() => s.faire('choisir_couplage', {'couplage': 'ac'}),
          throwsArgumentError);
      expect(() => s.faire('regler_gbf', {'frequence_hz': 200}),
          throwsArgumentError); // GBF absent
    });
  });

  group('focale_lentille', () {
    test(
        'Bilbermann : image nette quand l\'objet est au foyer (miroir derrière la lentille)',
        () {
      final s = _banc();
      s.placer('miroir_plan', 'derriere_lentille');
      _deplacer(s, 'objet_lumineux', 30); // OA = -20 : pas au foyer
      expect(_optique(s).nette, isFalse);
      _deplacer(s, 'objet_lumineux', 35); // OA = -15 = -f'
      expect(_optique(s).nette, isTrue);
      expect(s.conseils.contains('image_nette_obtenue'), isTrue);
      s.mesurer('position_a_cm', 35, 'cm');
      s.mesurer('position_o_cm', 50, 'cm');
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.labo.resultat(s.etat)['f_prime_bilbermann_cm'] as double,
          closeTo(15, 1e-9));
    });

    test('Bilbermann sans miroir : conseil', () {
      final s = _banc();
      _deplacer(s, 'objet_lumineux', 35);
      s.mesurer('position_a_cm', 35, 'cm');
      expect(s.conseils.contains('autocollimation_sans_miroir'), isTrue);
    });

    test(
        'Bessel : D = 80 cm donne deux positions nettes (20 et 60 cm de l\'objet)',
        () {
      final s = _banc();
      _deplacer(s, 'objet_lumineux', 0);
      _deplacer(s, 'ecran', 80);
      _deplacer(s, 'lentille_convergente', 20);
      expect(_optique(s).nette, isTrue);
      expect(_optique(s).oaPrimeCm!, closeTo(60, 1e-9));
      _deplacer(s, 'lentille_convergente', 30);
      expect(_optique(s).nette, isFalse);
      _deplacer(s, 'lentille_convergente', 60);
      expect(_optique(s).nette, isTrue);
      expect(s.conseils.contains('bessel_distance_insuffisante'), isFalse);
      s.mesurer('distance_objet_ecran_cm', 80, 'cm');
      _deplacer(s, 'lentille_convergente', 20);
      s.mesurer('position_l1_cm', 20, 'cm');
      _deplacer(s, 'lentille_convergente', 60);
      s.mesurer('position_l2_cm', 60, 'cm');
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.labo.resultat(s.etat)['f_prime_bessel_cm'] as double,
          closeTo(15, 1e-9));
    });

    test(
        'Bessel avec D < 4f\' : conseil, aucune position nette, erreur au bilan',
        () {
      final s = _banc();
      _deplacer(s, 'ecran', 50);
      expect(s.conseils.contains('bessel_distance_insuffisante'), isTrue);
      for (final x in [10.0, 20.0, 25.0, 30.0, 40.0]) {
        _deplacer(s, 'lentille_convergente', x);
        expect(_optique(s).nette, isFalse);
      }
      s.mesurer('distance_objet_ecran_cm', 50, 'cm');
      expect(s.erreurs.contains('distance_objet_ecran_trop_petite'), isTrue);
    });

    test('Descartes : OA = -30 cm donne OA\' = +30 cm, f\' = 15 cm', () {
      final s = _banc();
      _deplacer(s, 'objet_lumineux', 20); // lentille à 50 : OA = -30
      _deplacer(s, 'ecran', 80);
      expect(_optique(s).oaCm!, closeTo(-30, 1e-9));
      expect(_optique(s).nette, isTrue);
      s.mesurer('oa_cm', -30, 'cm');
      s.mesurer('oa_prime_cm', 30, 'cm');
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.labo.resultat(s.etat)['f_prime_descartes_cm'] as double,
          closeTo(15, 1e-9));
    });

    test('Descartes : mesure sans image nette et OA positif signalés', () {
      final s = _banc();
      _deplacer(s, 'objet_lumineux', 20);
      _deplacer(s, 'ecran', 95);
      s.mesurer('oa_cm', 30, 'cm');
      expect(s.erreurs.join(','),
          equals('image_non_nette,signe_distance_algebrique'));
    });

    test('trois méthodes terminées : conseil, f\' moyen et vergence', () {
      final s = _banc();
      s.placer('miroir_plan', 'derriere_lentille');
      _deplacer(s, 'objet_lumineux', 35);
      s.mesurer('position_a_cm', 35, 'cm');
      s.mesurer('position_o_cm', 50, 'cm');
      s.mesurer('distance_objet_ecran_cm', 80, 'cm');
      s.mesurer('position_l1_cm', 20, 'cm');
      s.mesurer('position_l2_cm', 60, 'cm');
      s.mesurer('oa_cm', -30, 'cm');
      s.mesurer('oa_prime_cm', 30, 'cm');
      expect(s.conseils.contains('trois_methodes_terminees'), isTrue);
      final r = s.labo.resultat(s.etat);
      expect(r['f_prime_moyenne_cm'] as double, closeTo(15, 1e-9));
      expect(r['vergence_dioptries'] as double, closeTo(6.6667, 1e-3));
    });

    test('la distance focale cachée n\'apparaît pas dans l\'état', () {
      final s = _banc();
      s.placer('miroir_plan', 'derriere_lentille');
      expect(s.etat.reglages.values.contains(15.0), isFalse);
    });

    test('déplacements invalides refusés', () {
      final s = _banc();
      expect(() => _deplacer(s, 'miroir_plan', 10), throwsArgumentError);
      expect(() => _deplacer(s, 'ecran', 150), throwsArgumentError);
    });
  });

  group('migration_ions', () {
    void preparer(Sim s) {
      s.placer('cristal_sulfate_cuivre', null);
    }

    test('les cristaux ne se posent pas avec placer_materiel', () {
      final s = _migration();
      expect(() => preparer(s), throwsArgumentError);
    });

    test('sans gants, le dépôt des cristaux est bloqué ; erreur gants_oublies',
        () {
      final s = _migration(gants: false);
      final r =
          s.faire('deposer_cristal', {'materiel_id': 'cristal_permanganate'});
      expect(r.bloquee, isTrue);
      expect(r.evenement.valeurs['regle_id'], equals('gants_avant_cristaux'));
      expect(s.erreurs.join(','), equals('gants_oublies'));
      s.placer('gants');
      expect(
          s.faire('deposer_cristal',
              {'materiel_id': 'cristal_permanganate'}).bloquee,
          isFalse);
    });

    Sim pret() {
      final s = _migration();
      s.faire('deposer_cristal', {'materiel_id': 'cristal_sulfate_cuivre'});
      s.faire('deposer_cristal', {'materiel_id': 'cristal_permanganate'});
      s.faire('regler_tension', {'tension_v': 12});
      return s;
    }

    test('K ne se ferme pas sans le plus grand calibre', () {
      final s = pret();
      final r = s.faire('fermer_interrupteur');
      expect(r.bloquee, isTrue);
      expect(
          r.evenement.valeurs['regle_id'], equals('grand_calibre_en_premier'));
      expect(s.erreurs.contains('grand_calibre_oublie'), isTrue);
    });

    test(
        'migration : Cu2+ vers la cathode, MnO4- vers l\'anode, selon les côtés choisis',
        () {
      final s = pret();
      s.faire(
          'choisir_calibre', {'materiel_id': 'amperemetre', 'calibre_a': 3.0});
      s.faire('fermer_interrupteur');
      final labo = s.labo as LaboMigration;
      expect(labo.courantA(s.etat), closeTo(12 / 380, 1e-9));
      expect(s.conseils.contains('duree_observation_atteinte'), isFalse);
      var avant = s.etat;
      s.avancer(300);
      expect(avant.nombre('progression_cuivre'),
          equals(0.0)); // l'ancien état ne change pas
      final mi = labo.affichage(s.etat);
      expect(mi.positionCuivre, lessThan(0));
      expect(mi.positionPermanganate, greaterThan(0));
      s.avancer(400);
      final fin = labo.affichage(s.etat);
      expect(
          fin.positionCuivre, closeTo(-1, 1e-9)); // vers electrode_b (gauche)
      expect(fin.positionPermanganate,
          closeTo(1, 1e-9)); // vers electrode_a (droite)
      expect(s.conseils.contains('duree_observation_atteinte'), isTrue);
      s.mesurer('electrode_cu2_plus', 'cathode', '');
      s.mesurer('electrode_mno4_moins', 'anode', '');
      expect(s.erreurs.isEmpty, isTrue);
      avant = s.etat;
      expect(s.labo.resultat(avant)['electrode_cu2_plus'], equals('cathode'));
    });

    test('électrodes permutées : la direction des taches s\'inverse', () {
      final s = _migration(a: 'gauche', b: 'droite');
      s.faire('deposer_cristal', {'materiel_id': 'cristal_sulfate_cuivre'});
      s.faire('deposer_cristal', {'materiel_id': 'cristal_permanganate'});
      s.faire('regler_tension', {'tension_v': 12});
      s.faire(
          'choisir_calibre', {'materiel_id': 'amperemetre', 'calibre_a': 3.0});
      s.faire('fermer_interrupteur');
      s.avancer(700);
      final mi = (s.labo as LaboMigration).affichage(s.etat);
      expect(mi.positionCuivre, closeTo(1, 1e-9));
      expect(mi.positionPermanganate, closeTo(-1, 1e-9));
    });

    test('mauvaise électrode : erreur electrode_inversee', () {
      final s = pret();
      s.mesurer('electrode_cu2_plus', 'anode', '');
      expect(s.erreurs.join(','), equals('electrode_inversee'));
    });

    test('deux électrodes du même côté : pas de courant, conseil courant_nul',
        () {
      final s = _migration(a: 'gauche', b: 'gauche');
      s.faire('regler_tension', {'tension_v': 12});
      s.faire(
          'choisir_calibre', {'materiel_id': 'amperemetre', 'calibre_a': 3.0});
      s.faire('fermer_interrupteur');
      expect((s.labo as LaboMigration).courantA(s.etat), equals(0.0));
      expect(s.conseils.contains('courant_nul'), isTrue);
    });

    test('rhéostat : moins de résistance, plus de courant ; plage vérifiée',
        () {
      final s = pret();
      s.faire(
          'choisir_calibre', {'materiel_id': 'amperemetre', 'calibre_a': 3.0});
      s.faire('fermer_interrupteur');
      final labo = s.labo as LaboMigration;
      final i1 = labo.courantA(s.etat);
      s.faire('regler_rheostat', {'resistance_ohm': 100});
      expect(labo.courantA(s.etat), greaterThan(i1));
      expect(() => s.faire('regler_rheostat', {'resistance_ohm': 1000}),
          throwsArgumentError);
    });

    test('le temps est un paramètre : delta négatif refusé', () {
      final s = pret();
      expect(() => s.avancer(-1), throwsArgumentError);
    });
  });
}
