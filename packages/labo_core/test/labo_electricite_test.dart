import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';
import 'simulation_aide.dart';

Sim _montageIntensite(
    {String ampere = 'amperemetre_aiguille', String emplacement = 'point_1'}) {
  final s = Sim(charger('mesure_intensite'));
  s.placer('alimentation');
  s.placer('resistor_r1', 'serie');
  s.placer('resistor_r2', 'serie');
  s.placer('interrupteur_k');
  s.placer(ampere, emplacement);
  s.faire('regler_tension', {'tension_v': 6});
  return s;
}

LectureAppareil _lecture(Sim s, String id) =>
    (s.labo as LaboElectricite).lectureAppareil(s.etat, id);

void _calibre(Sim s, double a, [String id = 'amperemetre_aiguille']) =>
    s.faire('choisir_calibre', {'materiel_id': id, 'calibre_a': a});

void main() {
  group('mesure_intensite', () {
    test('K ne se ferme pas tant que le calibre n\'est pas le plus grand', () {
      final s = _montageIntensite();
      final r = s.faire('fermer_interrupteur');
      expect(r.bloquee, isTrue);
      expect(r.evenement.action, equals('action_bloquee'));
      expect(
          r.evenement.valeurs['regle_id'], equals('grand_calibre_en_premier'));
      expect(
          r.message,
          equals(
              'Choisis d\'abord le plus grand calibre, puis diminue-le progressivement.'));
      expect(s.etat.drapeau('interrupteur_ferme'), isFalse);
      expect(r.evenement.rang, equals(s.journal.length));
      expect(s.erreurs.join(','), equals('grand_calibre_oublie'));
    });

    test(
        'déroulé complet de la fiche : grand calibre, fermer, diminuer, lire, incertitude',
        () {
      final s = _montageIntensite();
      _calibre(s, 3.0);
      expect(s.faire('fermer_interrupteur').bloquee, isFalse);
      expect(
          _lecture(s, 'amperemetre_aiguille').aiguilleDiv!, closeTo(0.8, 1e-9));
      expect(s.conseils.contains('calibre_reductible'), isTrue);

      _calibre(s, 0.3);
      expect(
          _lecture(s, 'amperemetre_aiguille').aiguilleDiv!, closeTo(8, 1e-9));
      expect(s.conseils.contains('calibre_reductible'), isTrue);

      _calibre(s, 0.1);
      final l = _lecture(s, 'amperemetre_aiguille');
      expect(l.aiguilleDiv!, closeTo(24, 1e-9));
      expect(l.horsEchelle, isFalse);
      expect(s.conseils.contains('calibre_optimal_atteint'), isTrue);
      expect(s.conseils.contains('calibre_reductible'), isFalse);

      s.mesurer('intensite_aiguille_a', 0.024, 'A');
      expect(s.erreurs.isEmpty, isTrue);
      final r = s.labo.resultat(s.etat);
      expect(r['intensite_aiguille_a'], equals(0.024));
      expect(r['delta_i_a'] as double, closeTo(0.0015, 1e-12));
      expect(r['tau'] as double, closeTo(0.0625, 1e-9));
      s.faire('terminer');
      expect(s.etat.termine, isTrue);
    });

    test('une lecture fausse est détectée au bilan', () {
      final s = _montageIntensite();
      _calibre(s, 3.0);
      s.faire('fermer_interrupteur');
      _calibre(s, 0.1);
      s.mesurer('intensite_aiguille_a', 0.040, 'A');
      expect(s.erreurs.join(','), equals('lecture_cadran'));
    });

    test('lecture à une division près acceptée', () {
      final s = _montageIntensite();
      _calibre(s, 3.0);
      s.faire('fermer_interrupteur');
      _calibre(s, 0.1);
      s.mesurer('intensite_aiguille_a', 0.0245, 'A');
      expect(s.erreurs.isEmpty, isTrue);
    });

    test('ampèremètre en dérivation : action bloquée, erreur au bilan', () {
      final s = _montageIntensite(emplacement: 'bornes_r1');
      _calibre(s, 3.0);
      final r = s.faire('fermer_interrupteur');
      expect(r.bloquee, isTrue);
      expect(r.evenement.valeurs['regle_id'], equals('amperemetre_en_serie'));
      expect(s.erreurs.join(','), equals('amperemetre_en_derivation'));
    });

    test('fil entre les bornes du générateur : court-circuit bloqué', () {
      final s = _montageIntensite();
      s.placer('fils', 'bornes_generateur');
      _calibre(s, 3.0);
      final r = s.faire('fermer_interrupteur');
      expect(r.bloquee, isTrue);
      expect(r.evenement.valeurs['regle_id'], equals('pas_de_court_circuit'));
      expect(s.erreurs.join(','), equals('court_circuit_generateur'));
    });

    test('multimètre : affichage arrondi au milliampère', () {
      final s = _montageIntensite(ampere: 'multimetre');
      s.faire('fermer_interrupteur');
      expect(_lecture(s, 'multimetre').affichage!, closeTo(0.024, 1e-9));
      s.mesurer('intensite_multimetre_a', 0.024, 'A');
      expect(s.erreurs.isEmpty, isTrue);
    });

    test('le multimètre n\'a pas de calibre à choisir', () {
      final s = _montageIntensite(ampere: 'multimetre');
      expect(() => _calibre(s, 3.0, 'multimetre'), throwsArgumentError);
    });

    test('on ne modifie pas le montage quand K est fermé', () {
      final s = _montageIntensite();
      _calibre(s, 3.0);
      s.faire('fermer_interrupteur');
      expect(() => s.placer('fils', 'circuit'), throwsArgumentError);
    });

    test('actions et valeurs invalides refusées', () {
      final s = _montageIntensite();
      expect(() => s.faire('regler_gbf', {'frequence_hz': 200}),
          throwsArgumentError);
      expect(() => s.placer('amperemetre_aiguille', 'point_9'),
          throwsArgumentError);
      expect(() => s.placer('oscilloscope'), throwsArgumentError);
      expect(() => s.faire('regler_tension', {'tension_v': 50}),
          throwsArgumentError);
      expect(() => _calibre(s, 2.0), throwsArgumentError);
      expect(() => s.mesurer('i_point_1_a', 0.02, 'A'), throwsArgumentError);
    });

    test('après « terminer », plus aucune action', () {
      final s = _montageIntensite();
      s.faire('terminer');
      expect(() => s.faire('ouvrir_interrupteur'), throwsStateError);
    });

    test('mêmes actions, même journal (déterminisme)', () {
      String rejouer() {
        final s = _montageIntensite();
        _calibre(s, 3.0);
        s.faire('fermer_interrupteur');
        s.mesurer('intensite_aiguille_a', 0.024, 'A');
        return s.journal.map((e) => e.toJson().toString()).join('|');
      }

      expect(rejouer(), equals(rejouer()));
    });

    test('format de l\'événement : contrat chapitre 2', () {
      final s = _montageIntensite();
      final j = s.journal.first.toJson();
      expect(j['rang'], equals(1));
      expect(j['horodatage'], equals('2026-11-08T07:30:00Z'));
      expect(j['action'], equals('placer_materiel'));
      expect(j['valeurs'].toString(), equals('{materiel_id: alimentation}'));
      final avecIds =
          s.journal.first.toJsonAvecIds(id: 'u1', tentativeId: 't1');
      expect(avecIds.keys.join(','),
          equals('id,tentative_id,rang,horodatage,action,valeurs'));
    });
  });

  group('lois_courant', () {
    Sim montageSerie() {
      final s = Sim(charger('lois_courant'));
      s.placer('alimentation');
      s.placer('resistor_r1', 'serie');
      s.placer('resistor_r2', 'serie');
      s.placer('interrupteur_k');
      s.placer('amperemetre', 'point_1');
      s.faire('regler_tension', {'tension_v': 6});
      _calibre(s, 3.0, 'amperemetre');
      s.faire('fermer_interrupteur');
      return s;
    }

    test('loi d\'unicité : même intensité aux points 1, 2 et 3', () {
      final s = montageSerie();
      final valeurs = <double>[];
      for (final p in ['point_1', 'point_2', 'point_3']) {
        if (p != 'point_1') {
          s.faire('ouvrir_interrupteur');
          s.placer('amperemetre', p);
          _calibre(s, 3.0, 'amperemetre');
          s.faire('fermer_interrupteur');
        }
        valeurs.add(_lecture(s, 'amperemetre').valeur!);
        s.mesurer('i_${p}_a', 0.024, 'A');
      }
      expect(valeurs[0], closeTo(valeurs[1], 1e-12));
      expect(valeurs[1], closeTo(valeurs[2], 1e-12));
      expect(s.conseils.contains('courants_serie_mesures'), isTrue);
      expect(s.erreurs.isEmpty, isTrue);
    });

    test('loi des nœuds en dérivation : I0 = I1 + I2, courants inégaux', () {
      final s = montageSerie();
      s.faire('ouvrir_interrupteur');
      s.placer('resistor_r1', 'derivation');
      s.placer('resistor_r2', 'derivation');
      final lecture = <String, double>{};
      for (final p in ['branche_principale', 'branche_r1', 'branche_r2']) {
        s.faire('ouvrir_interrupteur');
        s.placer('amperemetre', p);
        _calibre(s, 3.0, 'amperemetre');
        s.faire('fermer_interrupteur');
        lecture[p] = _lecture(s, 'amperemetre').valeur!;
      }
      expect(lecture['branche_principale']!, closeTo(0.1, 1e-9));
      expect(lecture['branche_r1']!, closeTo(0.06, 1e-9));
      expect(lecture['branche_r2']!, closeTo(0.04, 1e-9));
      expect(lecture['branche_principale']!,
          closeTo(lecture['branche_r1']! + lecture['branche_r2']!, 1e-12));
    });

    test('aiguille hors échelle : conseil, puis erreur calibre_trop_petit', () {
      final s = montageSerie();
      s.faire('ouvrir_interrupteur');
      s.placer('resistor_r1', 'derivation');
      s.placer('resistor_r2', 'derivation');
      s.placer('amperemetre', 'branche_principale');
      s.faire('regler_tension', {'tension_v': 8});
      _calibre(s, 3.0, 'amperemetre');
      s.faire('fermer_interrupteur');
      _calibre(s, 0.1, 'amperemetre');
      expect(_lecture(s, 'amperemetre').horsEchelle, isTrue);
      expect(s.conseils.contains('aiguille_hors_echelle'), isTrue);
      s.mesurer('i_branche_principale_a', 0.133, 'A');
      expect(s.erreurs.contains('calibre_trop_petit'), isTrue);
    });
  });

  group('mesure_tension_masse', () {
    Sim montage({double tension = 6.0}) {
      final s = Sim(charger('mesure_tension_masse'));
      s.placer('alimentation');
      s.placer('resistor_r1', 'serie');
      s.placer('resistor_r2', 'serie');
      s.placer('interrupteur_k');
      s.placer('voltmetre_aiguille', 'bornes_r1');
      s.faire('regler_tension', {'tension_v': tension});
      s.faire('choisir_calibre',
          {'materiel_id': 'voltmetre_aiguille', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      return s;
    }

    test(
        'U_PA aux bornes de R1 = 2,4 V ; inversé : signe moins et aiguille à l\'envers',
        () {
      final s = montage();
      expect(_lecture(s, 'voltmetre_aiguille').valeur!, closeTo(2.4, 1e-9));
      s.faire('inverser_branchement', {'materiel_id': 'voltmetre_aiguille'});
      final l = _lecture(s, 'voltmetre_aiguille');
      expect(l.valeur!, closeTo(-2.4, 1e-9));
      expect(l.sensInverse, isTrue);
      expect(s.conseils.contains('branchement_inverse'), isTrue);
    });

    test('tension aux bornes de l\'interrupteur : 6 V ouvert, 0 V fermé', () {
      final s = montage();
      s.faire('ouvrir_interrupteur');
      s.placer('voltmetre_aiguille', 'bornes_k');
      expect(_lecture(s, 'voltmetre_aiguille').valeur!, closeTo(6, 1e-9));
      s.faire('choisir_calibre',
          {'materiel_id': 'voltmetre_aiguille', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      expect(_lecture(s, 'voltmetre_aiguille').valeur!, closeTo(0, 1e-9));
    });

    test(
        'notion de masse avec une pile de 4,5 V : V_P = 4,5 V, V_A = 2,7 V, V_P - V_A = U_PA',
        () {
      final s = montage(tension: 4.5);
      s.faire('ouvrir_interrupteur');
      s.faire('relier_masse', {'point_id': 'n'});
      s.placer('multimetre', 'point_p');
      s.faire('fermer_interrupteur');
      final vp = _lecture(s, 'multimetre').valeur!;
      s.faire('ouvrir_interrupteur');
      s.placer('multimetre', 'point_a');
      s.faire('fermer_interrupteur');
      final va = _lecture(s, 'multimetre').valeur!;
      expect(vp, closeTo(4.5, 1e-9));
      expect(va, closeTo(2.7, 1e-9));
      expect(vp - va, closeTo(1.8, 1e-9));
    });

    test('sans masse reliée, pas de potentiel lu', () {
      final s = montage();
      s.faire('ouvrir_interrupteur');
      s.placer('multimetre', 'point_p');
      expect(_lecture(s, 'multimetre').valeur, isNull);
    });

    test('voltmètre en série : pas de courant, conseil, erreur au bilan', () {
      final s = montage();
      s.faire('ouvrir_interrupteur');
      s.placer('voltmetre_aiguille', 'point_1');
      s.faire('choisir_calibre',
          {'materiel_id': 'voltmetre_aiguille', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      expect(s.conseils.contains('voltmetre_en_serie'), isTrue);
      s.mesurer('u_pn_v', 6.0, 'V');
      expect(s.erreurs.contains('voltmetre_en_serie'), isTrue);
    });

    test('actions réservées à ce TP', () {
      final s = Sim(charger('mesure_intensite'));
      expect(() => s.faire('relier_masse', {'point_id': 'n'}),
          throwsArgumentError);
    });
  });

  group('lois_tensions', () {
    test('série : U_PA + U_AN = U_PN ; dérivation : U_PN = U1 = U2', () {
      final s = Sim(charger('lois_tensions'));
      s.placer('alimentation');
      s.placer('resistor_r1', 'serie');
      s.placer('resistor_r2', 'serie');
      s.placer('interrupteur_k');
      s.placer('voltmetre', 'bornes_r1');
      s.faire('regler_tension', {'tension_v': 6});
      s.faire(
          'choisir_calibre', {'materiel_id': 'voltmetre', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      final upa = _lecture(s, 'voltmetre').valeur!;
      s.mesurer('u_pa_v', 2.4, 'V');
      s.faire('ouvrir_interrupteur');
      s.placer('voltmetre', 'bornes_r2');
      s.faire(
          'choisir_calibre', {'materiel_id': 'voltmetre', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      final uan = _lecture(s, 'voltmetre').valeur!;
      s.mesurer('u_an_v', 3.6, 'V');
      s.faire('ouvrir_interrupteur');
      s.placer('voltmetre', 'bornes_generateur');
      s.faire(
          'choisir_calibre', {'materiel_id': 'voltmetre', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      final upn = _lecture(s, 'voltmetre').valeur!;
      s.mesurer('u_pn_v', 6.0, 'V');
      expect(upa + uan, closeTo(upn, 1e-12));
      expect(s.conseils.contains('somme_tensions_mesurees'), isTrue);

      s.faire('ouvrir_interrupteur');
      s.placer('resistor_r1', 'derivation');
      s.placer('resistor_r2', 'derivation');
      s.placer('voltmetre', 'bornes_r1');
      s.faire(
          'choisir_calibre', {'materiel_id': 'voltmetre', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      expect(_lecture(s, 'voltmetre').valeur!, closeTo(6, 1e-9));
      s.mesurer('u1_v', 6.0, 'V');
      s.faire('ouvrir_interrupteur');
      s.placer('voltmetre', 'bornes_r2');
      s.faire(
          'choisir_calibre', {'materiel_id': 'voltmetre', 'calibre_v': 30.0});
      s.faire('fermer_interrupteur');
      expect(_lecture(s, 'voltmetre').valeur!, closeTo(6, 1e-9));
      s.mesurer('u2_v', 6.0, 'V');
      expect(s.conseils.contains('tensions_derivation_mesurees'), isTrue);
      expect(s.erreurs.isEmpty, isTrue);
      expect(s.labo.resultat(s.etat)['u1_v'], equals(6.0));
    });
  });
}
