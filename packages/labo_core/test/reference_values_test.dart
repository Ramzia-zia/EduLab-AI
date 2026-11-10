// Lit reference_values.json (l'arbitre) et vérifie chaque cas dont labo_core calcule la sortie.
// Les cas d'autres expériences (titrage, pendule, affaissement, pH) sont signalés « ignorés ».
// Chemin du fichier : variable d'environnement REFERENCE_VALUES, sinon ../../reference_values.json,
// sinon reference_values.json (dossier courant), sinon reference_values_ajouts.json.
import 'dart:convert';
import 'dart:io';

import 'package:labo_core/labo_core.dart';

import 'mini_test.dart';

typedef Calcul = Map<String, Object> Function(Map<String, dynamic> e);

double _n(Map<String, dynamic> e, String cle) => (e[cle] as num).toDouble();

final Map<String, Calcul> _calculs = {
  'electricite_serie_resistance': (e) => {
        'resistance_ohm': resistanceSerieOhm([_n(e, 'r1_ohm'), _n(e, 'r2_ohm')])
      },
  'electricite_derivation_resistance': (e) => {
        'resistance_ohm':
            resistanceDerivationOhm([_n(e, 'r1_ohm'), _n(e, 'r2_ohm')])
      },
  'electricite_serie_intensite_6v': (e) => {
        'intensite_a': intensiteSerieA(
            tensionGenerateurV: _n(e, 'tension_generateur_v'),
            r1Ohm: _n(e, 'r1_ohm'),
            r2Ohm: _n(e, 'r2_ohm')),
      },
  'electricite_derivation_courants_6v': (e) {
    final c = courantsDerivation(
        tensionGenerateurV: _n(e, 'tension_generateur_v'),
        r1Ohm: _n(e, 'r1_ohm'),
        r2Ohm: _n(e, 'r2_ohm'));
    return {'i0_a': c.i0A, 'i1_a': c.i1A, 'i2_a': c.i2A};
  },
  'electricite_serie_tensions_6v': _tensionsSerie,
  'electricite_serie_tensions_4_5v': _tensionsSerie,
  'electricite_masse_potentiels_4_5v': (e) {
    final p = potentielsSerie(
        tensionGenerateurV: _n(e, 'tension_generateur_v'),
        r1Ohm: _n(e, 'r1_ohm'),
        r2Ohm: _n(e, 'r2_ohm'));
    return {
      'potentiel_p_v': p.potentielPV,
      'potentiel_a_v': p.potentielAV,
      'potentiel_n_v': p.potentielNV
    };
  },
  'electricite_derivation_tensions_6v': (e) {
    final t =
        tensionsDerivation(tensionGenerateurV: _n(e, 'tension_generateur_v'));
    return {'u_pn_v': t.uPnV, 'u1_v': t.u1V, 'u2_v': t.u2V};
  },
  'electricite_interrupteur_ouvert_6v': _interrupteur,
  'electricite_interrupteur_ferme_6v': _interrupteur,
  'electricite_voltmetre_branchement_normal': _voltmetre,
  'electricite_voltmetre_branchement_inverse': _voltmetre,
  'electricite_aiguille_calibre_0_1a': _aiguille,
  'electricite_aiguille_calibre_0_3a': _aiguille,
  'electricite_aiguille_pleine_echelle': _aiguille,
  'electricite_intensite_depuis_lecture': (e) => {
        'intensite_a': intensiteDepuisLectureA(
            calibreA: _n(e, 'calibre_a'),
            lectureDiv: _n(e, 'lecture_div'),
            divisionsTotal: _n(e, 'divisions_total')),
      },
  'electricite_incertitude_calibre_0_1a': _incertitude,
  'electricite_incertitude_calibre_0_3a': _incertitude,
  'optique_bilbermann_foyer': (e) => {
        'f_prime_cm': foyerBilbermannCm(
            positionObjetCm: _n(e, 'position_objet_cm'),
            positionLentilleCm: _n(e, 'position_lentille_cm')),
      },
  'optique_bessel_foyer': (e) => {
        'f_prime_cm': foyerBesselCm(
            distanceObjetEcranCm: _n(e, 'distance_objet_ecran_cm'),
            ecartPositionsCm: _n(e, 'ecart_positions_cm')),
      },
  'optique_bessel_positions': _bessel,
  'optique_bessel_impossible': _bessel,
  'optique_descartes_oa_moins_30': _descartesDirect,
  'optique_descartes_oa_moins_20': _descartesDirect,
  'optique_descartes_oa_moins_60': _descartesDirect,
  'optique_descartes_foyer': (e) => {
        'f_prime_cm': foyerDescartesCm(
            oaCm: _n(e, 'oa_cm'), oaPrimeCm: _n(e, 'oa_prime_cm'))
      },
  'optique_vergence': (e) =>
      {'vergence_dioptries': vergenceDioptries(fPrimeCm: _n(e, 'f_prime_cm'))},
  'optique_statistiques': (e) {
    final v =
        (e['valeurs_cm'] as List).map((x) => (x as num).toDouble()).toList();
    return {'moyenne_cm': moyenne(v), 'ecart_type_cm': ecartTypeEchantillon(v)};
  },
  'oscilloscope_tension_continue': (e) => {
        'tension_v': tensionContinueDepuisDeviationV(
            sensibiliteVParDiv: _n(e, 'sensibilite_v_par_div'),
            deviationDiv: _n(e, 'deviation_div')),
      },
  'oscilloscope_sinus_200hz': (e) {
    final t = periodeDepuisDivisionsS(
        divisionsParPeriode: _n(e, 'divisions_par_periode'),
        baseTempsSParDiv: _n(e, 'base_temps_s_par_div'));
    final um = valeurMaximaleDepuisDivisionsV(
        sensibiliteVParDiv: _n(e, 'sensibilite_v_par_div'),
        divisionsSommet: _n(e, 'divisions_sommet'));
    return {
      'periode_s': t,
      'frequence_hz': frequenceDepuisPeriodeHz(periodeS: t),
      'valeur_maximale_v': um,
      'valeur_efficace_v': valeurEfficaceDepuisMaximaleV(valeurMaximaleV: um),
    };
  },
  'oscilloscope_frequence_doublee': (e) => {
        'divisions_par_periode': divisionsParPeriode(
            frequenceHz: _n(e, 'frequence_hz'),
            baseTempsSParDiv: _n(e, 'base_temps_s_par_div')),
      },
  'migration_ion_cuivre': _migration,
  'migration_ion_permanganate': _migration,
};

Map<String, Object> _tensionsSerie(Map<String, dynamic> e) {
  final t = tensionsSerie(
      tensionGenerateurV: _n(e, 'tension_generateur_v'),
      r1Ohm: _n(e, 'r1_ohm'),
      r2Ohm: _n(e, 'r2_ohm'));
  return {'u_pa_v': t.uPaV, 'u_an_v': t.uAnV, 'u_pn_v': t.uPnV};
}

Map<String, Object> _interrupteur(Map<String, dynamic> e) => {
      'tension_interrupteur_v': tensionInterrupteurV(
          ferme: e['ferme'] as bool,
          tensionGenerateurV: _n(e, 'tension_generateur_v')),
    };

Map<String, Object> _voltmetre(Map<String, dynamic> e) => {
      'tension_mesuree_v': tensionMesureeV(
          potentielBorneVV: _n(e, 'potentiel_borne_v_v'),
          potentielBorneComV: _n(e, 'potentiel_borne_com_v')),
    };

Map<String, Object> _aiguille(Map<String, dynamic> e) {
  final l = lectureAiguilleIntensite(
      intensiteA: _n(e, 'intensite_a'),
      calibreA: _n(e, 'calibre_a'),
      divisionsTotal: _n(e, 'divisions_total'));
  return {'lecture_div': l.divisions, 'hors_echelle': l.horsEchelle};
}

Map<String, Object> _incertitude(Map<String, dynamic> e) {
  final delta = incertitudeAbsolueA(
      classe: _n(e, 'classe'), calibreA: _n(e, 'calibre_a'));
  return {
    'delta_i_a': delta,
    'tau': incertitudeRelative(
        incertitudeAbsolue: delta, valeurMesuree: _n(e, 'intensite_a')),
  };
}

Map<String, Object> _bessel(Map<String, dynamic> e) {
  final p = positionsBessel(
      distanceObjetEcranCm: _n(e, 'distance_objet_ecran_cm'),
      fPrimeCm: _n(e, 'f_prime_cm'));
  if (p == null) return {'existe': false};
  return {
    'existe': true,
    'position_l1_cm': p.l1Cm,
    'position_l2_cm': p.l2Cm,
    'ecart_positions_cm': p.ecartCm
  };
}

Map<String, Object> _descartesDirect(Map<String, dynamic> e) {
  final oa = _n(e, 'oa_cm');
  final oaPrime = positionImageCm(oaCm: oa, fPrimeCm: _n(e, 'f_prime_cm'))!;
  return {
    'oa_prime_cm': oaPrime,
    'grandissement': grandissement(oaCm: oa, oaPrimeCm: oaPrime)
  };
}

Map<String, Object> _migration(Map<String, dynamic> e) {
  final q = (e['charge_elementaire'] as num).toInt();
  return {
    'electrode': electrodeVersLaquelleMigre(chargeElementaire: q).name,
    'meme_sens_que_courant_conventionnel':
        memeSensQueCourantConventionnel(chargeElementaire: q),
  };
}

File _trouverFichier() {
  final candidats = <String>[
    if (Platform.environment['REFERENCE_VALUES'] != null)
      Platform.environment['REFERENCE_VALUES']!,
    '../../reference_values.json',
    'reference_values.json',
    'reference_values_ajouts.json',
  ];
  for (final chemin in candidats) {
    final f = File(chemin);
    if (f.existsSync()) return f;
  }
  throw StateError(
      'reference_values.json introuvable (essayé : ${candidats.join(', ')}).');
}

void main() {
  final fichier = _trouverFichier();
  stdout.writeln('Valeurs de référence lues dans : ${fichier.path}');
  final cas = (jsonDecode(fichier.readAsStringSync())
      as Map<String, dynamic>)['cas'] as List;
  var ignores = 0;

  group('reference_values.json', () {
    for (final c in cas.cast<Map<String, dynamic>>()) {
      final id = c['id'] as String;
      final calcul = _calculs[id];
      if (calcul == null) {
        ignores++;
        continue;
      }
      test(id, () {
        final obtenu = calcul(c['entrees'] as Map<String, dynamic>);
        final attendu = c['sortie'] as Map<String, dynamic>;
        final tolerance = (c['tolerance'] as num).toDouble();
        expect(obtenu.keys.toSet().containsAll(attendu.keys), isTrue);
        for (final cle in attendu.keys) {
          final a = attendu[cle];
          expect(obtenu[cle], a is num ? closeTo(a, tolerance) : equals(a));
        }
      });
    }
  });
  stdout.writeln(
      '$ignores cas d\'autres expériences ignorés (non calculés par ce paquet).');

  // Chaque calcul du paquet doit avoir son cas dans le fichier de référence.
  group('couverture', () {
    test('chaque calcul testé a un cas dans le fichier', () {
      final ids = cas.map((c) => (c as Map)['id'] as String).toSet();
      final manquants = _calculs.keys.where((k) => !ids.contains(k)).toList();
      expect(manquants.isEmpty, isTrue);
    });
  });
}
