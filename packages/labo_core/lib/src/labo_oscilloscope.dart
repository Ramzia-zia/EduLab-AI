import 'dart:math' as math;

import 'noyau.dart';
import 'oscilloscope.dart';

/// Paramètres de l'oscilloscope et du GBF. HYPOTHÈSES à valider : la fiche donne seulement
/// Sv = 2 V/div et Sb = 5 ms/div en exemple et « quelques centaines de hertz » pour le GBF.
class ParametresOscilloscope {
  const ParametresOscilloscope({
    this.sensibilitesVParDiv = const [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0],
    this.basesTempsSParDiv = const [
      0.0001,
      0.0002,
      0.0005,
      0.001,
      0.002,
      0.005,
      0.01,
      0.02
    ],
    this.demiHauteurEcranDiv = 4.0,
    this.largeurEcranDiv = 10.0,
    this.valeurMaximaleGbfV = 6.0,
    this.frequenceMinHz = 50.0,
    this.frequenceMaxHz = 2000.0,
    this.tensionMaxV = 12.0,
    this.toleranceLectureDiv = 0.5,
    this.resolutionMultimetreV = 0.01,
  });

  final List<double> sensibilitesVParDiv;
  final List<double> basesTempsSParDiv;
  final double demiHauteurEcranDiv;
  final double largeurEcranDiv;
  final double valeurMaximaleGbfV;
  final double frequenceMinHz;
  final double frequenceMaxHz;
  final double tensionMaxV;
  final double toleranceLectureDiv;
  final double resolutionMultimetreV;
}

/// Ce que l'écran de l'oscilloscope doit dessiner.
class AffichageOscilloscope {
  const AffichageOscilloscope({
    required this.source,
    required this.couplage,
    required this.signalPresent,
    required this.amplitudeV,
    required this.deviationDiv,
    required this.divisionsParPeriode,
    required this.traceVisible,
  });

  /// 'alimentation', 'gbf' ou null.
  final String? source;
  final String couplage;
  final bool signalPresent;

  /// Tension continue ou valeur maximale du signal sinusoïdal, en volts.
  final double amplitudeV;

  /// Déviation de la tension continue, ou du sommet de la sinusoïde, en divisions.
  final double deviationDiv;

  /// Nombre de divisions occupées par une période (null pour une tension continue).
  final double? divisionsParPeriode;
  final bool traceVisible;
}

/// Laboratoire oscilloscope_tension.
class LaboOscilloscope extends Laboratoire {
  LaboOscilloscope(super.definition,
      {this.parametres = const ParametresOscilloscope()}) {
    if (definition.id != 'oscilloscope_tension' ||
        definition.calcul != 'oscilloscope') {
      throw ArgumentError(
          'LaboOscilloscope ne gère pas ${definition.id} (${definition.calcul}).');
    }
  }

  final ParametresOscilloscope parametres;

  @override
  Set<String> get actions => {
        'placer_materiel',
        'regler_tension',
        'relier_masse',
        'choisir_couplage',
        'regler_sensibilite',
        'regler_base_temps',
        'regler_gbf',
        'mesurer',
        'terminer',
      };

  @override
  Set<String> get grandeursMesurables => {
        'u_continue_v',
        'n_div',
        'ym_div',
        'u_multimetre_v',
        'periode_s',
        'frequence_hz',
        'um_v',
        'ueff_v',
      };

  @override
  Map<String, Set<String>> get emplacementsAutorises => {
        'alimentation': {'entree_y1'},
        'gbf': {'entree_y1'},
        'multimetre': {'bornes_gbf'},
      };

  @override
  EtatLabo etatInitial() => EtatLabo(reglages: {
        'couplage': 'dc',
        'reference_reglee': false,
        'sensibilite_v_par_div': parametres.sensibilitesVParDiv.last,
        'base_temps_s_par_div': 0.01,
        'frequence_gbf_hz': 100.0,
        'tension_alimentation_v': 0.0,
      });

  @override
  EtatLabo placerMateriel(
      EtatLabo etat, String materielId, String? emplacementId) {
    var materiel = {...etat.materiel};
    if (emplacementId == 'entree_y1') {
      // Une seule source sur l'entrée Y1 : la nouvelle remplace l'ancienne.
      for (final autre in ['alimentation', 'gbf']) {
        if (autre != materielId && materiel[autre] == 'entree_y1')
          materiel[autre] = null;
      }
    }
    materiel[materielId] = emplacementId;
    return etat.copie(materiel: materiel);
  }

  // -- Signal et affichage -------------------------------------------------------

  String? _source(EtatLabo e) {
    for (final s in ['gbf', 'alimentation']) {
      if (e.materiel[s] == 'entree_y1') return s;
    }
    return null;
  }

  double _amplitudeV(EtatLabo e) => switch (_source(e)) {
        'gbf' => parametres.valeurMaximaleGbfV,
        'alimentation' => e.nombre('tension_alimentation_v') ?? 0.0,
        _ => 0.0,
      };

  /// Description de l'écran pour le dessin (calculée par labo_core, le dessin ne calcule rien).
  AffichageOscilloscope affichage(EtatLabo e) {
    final source = _source(e);
    final couplage = e.texte('couplage') ?? 'dc';
    final present = source != null && couplage != 'gnd';
    final sv = e.nombre('sensibilite_v_par_div')!;
    final amplitude = _amplitudeV(e);
    final deviation = present
        ? deviationDepuisTensionDiv(tensionV: amplitude, sensibiliteVParDiv: sv)
        : 0.0;
    double? n;
    if (source == 'gbf') {
      n = divisionsParPeriode(
        frequenceHz: e.nombre('frequence_gbf_hz')!,
        baseTempsSParDiv: e.nombre('base_temps_s_par_div')!,
      );
    }
    return AffichageOscilloscope(
      source: source,
      couplage: couplage,
      signalPresent: present,
      amplitudeV: amplitude,
      deviationDiv: deviation,
      divisionsParPeriode: n,
      traceVisible: traceVisible(
        deviationDiv: deviation,
        demiHauteurEcranDiv: parametres.demiHauteurEcranDiv,
      ),
    );
  }

  // -- Conditions et conseils ------------------------------------------------------

  @override
  bool condition(String id, EtatLabo e) {
    if (id == 'masse_commune') {
      final s = _source(e);
      return s != null && e.drapeau('masse_$s');
    }
    throw ArgumentError.value(
        id, 'exige', 'condition inconnue pour ${definition.id}');
  }

  @override
  bool conseilActif(String quand, EtatLabo e) {
    final a = affichage(e);
    switch (quand) {
      case 'reference_non_reglee':
        return a.couplage == 'dc' && !e.drapeau('reference_reglee');
      case 'trace_hors_ecran':
        return a.signalPresent && !a.traceVisible;
      case 'sensibilite_reductible':
        if (!a.signalPresent || !a.traceVisible || a.amplitudeV <= 0)
          return false;
        final sv = e.nombre('sensibilite_v_par_div')!;
        return parametres.sensibilitesVParDiv
            .where((s) => s < sv)
            .any((s) => a.amplitudeV / s <= parametres.demiHauteurEcranDiv);
    }
    throw ArgumentError.value(
        quand, 'quand', 'conseil inconnu pour ${definition.id}');
  }

  // -- Actions --------------------------------------------------------------------

  @override
  EtatLabo transitionSpecifique(
      EtatLabo e, String action, Map<String, Object?> v) {
    switch (action) {
      case 'regler_tension':
        final t = nombreRequis(v, 'tension_v');
        if (t < 0 || t > parametres.tensionMaxV) {
          throw ArgumentError.value(
              t, 'tension_v', 'entre 0 et ${parametres.tensionMaxV} V');
        }
        if (!e.materiel.containsKey('alimentation')) {
          throw ArgumentError('Place d\'abord l\'alimentation.');
        }
        return e.avecReglage('tension_alimentation_v', t);
      case 'relier_masse':
        final p = texteRequis(v, 'point_id');
        if ((p != 'alimentation' && p != 'gbf') || !e.materiel.containsKey(p)) {
          throw ArgumentError.value(
              p, 'point_id', 'alimentation ou gbf déjà placé');
        }
        return e.avecReglage('masse_$p', true);
      case 'choisir_couplage':
        final c = texteRequis(v, 'couplage');
        if (c != 'gnd' && c != 'dc')
          throw ArgumentError.value(c, 'couplage', 'gnd ou dc');
        return e.avecReglages(
            {'couplage': c, if (c == 'gnd') 'reference_reglee': true});
      case 'regler_sensibilite':
        return e.avecReglage(
          'sensibilite_v_par_div',
          nombrePermis(
              v, 'sensibilite_v_par_div', parametres.sensibilitesVParDiv),
        );
      case 'regler_base_temps':
        return e.avecReglage(
          'base_temps_s_par_div',
          nombrePermis(v, 'base_temps_s_par_div', parametres.basesTempsSParDiv),
        );
      case 'regler_gbf':
        final f = nombreRequis(v, 'frequence_hz');
        if (f < parametres.frequenceMinHz || f > parametres.frequenceMaxHz) {
          throw ArgumentError.value(f, 'frequence_hz',
              'entre ${parametres.frequenceMinHz} et ${parametres.frequenceMaxHz} Hz');
        }
        if (!e.materiel.containsKey('gbf'))
          throw ArgumentError('Place d\'abord le GBF.');
        return e.avecReglage('frequence_gbf_hz', f);
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    if (saisie is! num)
      throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
    final a = affichage(e);
    final sv = e.nombre('sensibilite_v_par_div')!;
    double? reelle;
    double tolerance = parametres.toleranceLectureDiv;
    switch (g) {
      case 'u_continue_v':
        if (a.source == 'alimentation') reelle = a.amplitudeV;
        tolerance = parametres.toleranceLectureDiv * sv;
      case 'n_div':
        reelle = a.divisionsParPeriode;
      case 'ym_div':
        if (a.source == 'gbf') reelle = a.amplitudeV / sv;
      case 'u_multimetre_v':
        if (a.source == 'gbf' && e.materiel['multimetre'] == 'bornes_gbf') {
          reelle = a.amplitudeV / math.sqrt2;
        }
        tolerance = parametres.resolutionMultimetreV * 5;
    }
    return Mesure(
      grandeurId: g,
      saisie: saisie,
      unite: unite,
      reelle: reelle,
      contexte: {
        'traceHorsEcran': a.signalPresent && !a.traceVisible,
        'tolerance': tolerance,
        'lecture': g == 'u_continue_v' || g == 'n_div' || g == 'ym_div',
      },
    );
  }

  // -- Bilan et résultat ----------------------------------------------------------

  @override
  List<String> erreursBilan(EtatLabo e) {
    final codes = <String>[];
    void ajouter(String c) {
      if (!codes.contains(c)) codes.add(c);
    }

    if (e.blocages.contains('masse_commune'))
      ajouter('masse_oscilloscope_oubliee');
    for (final m in e.mesures) {
      if (m.contexte['traceHorsEcran'] == true) ajouter('trace_hors_ecran');
      final reelle = m.reelle;
      final saisie = m.saisie;
      if (m.contexte['lecture'] == true && reelle != null && saisie is num) {
        if ((saisie - reelle).abs() > (m.contexte['tolerance'] as double)) {
          ajouter('lecture_oscillogramme');
        }
      }
    }
    final d = e.dernieresMesures;
    final um = d['um_v']?.saisie;
    final ueff = d['ueff_v']?.saisie;
    if (um is num && ueff is num && um > 0 && (ueff - um).abs() <= 0.02 * um) {
      ajouter('confusion_maximale_efficace');
    }
    return codes;
  }

  @override
  Map<String, Object?> resultat(EtatLabo e) {
    final d = e.dernieresMesures;
    const cles = [
      'u_continue_v',
      'periode_s',
      'frequence_hz',
      'um_v',
      'ueff_v'
    ];
    return {
      for (final k in cles)
        if (d.containsKey(k)) k: d[k]!.saisie
    };
  }
}
