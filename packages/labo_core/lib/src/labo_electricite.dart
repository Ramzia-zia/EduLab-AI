import 'electricite.dart';
import 'noyau.dart';

/// Paramètres de l'appareillage. Les valeurs par défaut viennent des fiches de TP quand elles y
/// figurent (R1, R2, calibres 0,1 / 0,3 / 1 / 3 A, cadran de 100 divisions) ; les autres sont des
/// HYPOTHÈSES à valider : calibres du voltmètre, classe de l'appareil, tolérance de lecture,
/// résolution du multimètre.
class ParametresElectricite {
  const ParametresElectricite({
    this.r1Ohm = 100.0,
    this.r2Ohm = 150.0,
    this.tensionMaxV = 12.0,
    this.calibresAmperemetreA = const [0.1, 0.3, 1.0, 3.0],
    this.calibresVoltmetreV = const [3.0, 10.0, 30.0],
    this.divisionsCadran = 100.0,
    this.classe = 1.5,
    this.toleranceLectureDiv = 1.0,
    this.resolutionMultimetre = 0.001,
  });

  final double r1Ohm;
  final double r2Ohm;
  final double tensionMaxV;
  final List<double> calibresAmperemetreA;
  final List<double> calibresVoltmetreV;
  final double divisionsCadran;
  final double classe;
  final double toleranceLectureDiv;
  final double resolutionMultimetre;
}

/// Ce qu'affiche un appareil de mesure.
class LectureAppareil {
  const LectureAppareil({
    this.valeur,
    this.affichage,
    this.aiguilleDiv,
    this.horsEchelle = false,
    this.sensInverse = false,
  });

  /// Grandeur physique exacte vue par l'appareil (null si l'appareil n'est pas dans le montage).
  final double? valeur;

  /// Valeur affichée par un multimètre (arrondie à sa résolution).
  final double? affichage;

  /// Position de l'aiguille en divisions (appareil à aiguille).
  final double? aiguilleDiv;
  final bool horsEchelle;
  final bool sensInverse;
}

class _Circuit {
  const _Circuit({
    required this.topologie,
    required this.actif,
    required this.u,
    required this.i0,
    required this.i1,
    required this.i2,
    required this.chute1,
    required this.chute2,
  });
  final String? topologie; // 'serie', 'derivation' ou null (montage incomplet)
  final bool actif; // un courant circule
  final double u;
  final double i0;
  final double i1;
  final double i2;
  final double chute1; // tension aux bornes de R1
  final double chute2; // tension aux bornes de R2
}

/// Laboratoire des TP de courant et de tension continus : mesure_intensite, lois_courant,
/// mesure_tension_masse, lois_tensions.
class LaboElectricite extends Laboratoire {
  LaboElectricite(super.definition,
      {this.parametres = const ParametresElectricite()}) {
    if (!_ids.contains(definition.id) || definition.calcul != 'electricite') {
      throw ArgumentError(
          'LaboElectricite ne gère pas ${definition.id} (${definition.calcul}).');
    }
  }

  static const _ids = {
    'mesure_intensite',
    'lois_courant',
    'mesure_tension_masse',
    'lois_tensions'
  };

  final ParametresElectricite parametres;

  bool get _courant =>
      definition.id == 'mesure_intensite' || definition.id == 'lois_courant';
  bool get _derivationPermise =>
      definition.id == 'lois_courant' || definition.id == 'lois_tensions';
  bool get _masse => definition.id == 'mesure_tension_masse';

  @override
  Set<String> get actions => {
        'placer_materiel',
        'regler_tension',
        'fermer_interrupteur',
        'ouvrir_interrupteur',
        'choisir_calibre',
        'mesurer',
        'terminer',
        if (_masse) ...{'inverser_branchement', 'relier_masse'},
      };

  @override
  Set<String> get grandeursMesurables => switch (definition.id) {
        'mesure_intensite' => {
            'intensite_aiguille_a',
            'intensite_multimetre_a'
          },
        'lois_courant' => {
            'i_point_1_a',
            'i_point_2_a',
            'i_point_3_a',
            'i_branche_principale_a',
            'i_branche_r1_a',
            'i_branche_r2_a',
          },
        'mesure_tension_masse' => {
            'u_pa_v',
            'u_an_v',
            'u_pn_v',
            'u_ap_v',
            'u_k_ouvert_v',
            'u_k_ferme_v',
            'v_p_v',
            'v_a_v',
          },
        _ => {'u_pa_v', 'u_an_v', 'u_pn_v', 'u1_v', 'u2_v'},
      };

  @override
  Map<String, Set<String>> get emplacementsAutorises {
    const courant = {
      'point_1',
      'point_2',
      'point_3',
      'branche_principale',
      'branche_r1',
      'branche_r2',
      'bornes_r1',
      'bornes_r2',
      'bornes_generateur',
    };
    final tension = {...courant, 'bornes_k', 'point_p', 'point_a'};
    final table = <String, Set<String>>{
      'resistor_r1': _derivationPermise ? {'serie', 'derivation'} : {'serie'},
      'resistor_r2': _derivationPermise ? {'serie', 'derivation'} : {'serie'},
      'fils': {'circuit', 'bornes_generateur'},
    };
    for (final id in definition.materiel) {
      if (_role(id) != null) table[id] = _courant ? courant : tension;
    }
    return table;
  }

  // -- Appareils ------------------------------------------------------------

  /// 'ammetre' ou 'voltmetre' : le rôle d'un appareil dans cette expérience.
  String? _role(String id) {
    if (id == 'amperemetre' || id == 'amperemetre_aiguille') return 'ammetre';
    if (id == 'voltmetre' || id == 'voltmetre_aiguille') return 'voltmetre';
    if (id == 'multimetre') return _courant ? 'ammetre' : 'voltmetre';
    return null;
  }

  bool _aiguille(String id) => _role(id) != null && id != 'multimetre';

  List<double> _calibres(String id) => _role(id) == 'ammetre'
      ? parametres.calibresAmperemetreA
      : parametres.calibresVoltmetreV;

  Iterable<String> _instruments(EtatLabo e) =>
      e.materiel.keys.where((id) => _role(id) != null);

  bool _dansBoucle(String? emplacement) =>
      emplacement != null &&
      ((emplacement.startsWith('point_') &&
              emplacement != 'point_p' &&
              emplacement != 'point_a') ||
          emplacement.startsWith('branche_'));

  // -- Initialisation et placement --------------------------------------------

  @override
  EtatLabo etatInitial() => const EtatLabo(
      reglages: {'tension_generateur_v': 0.0, 'interrupteur_ferme': false});

  @override
  void verifierMontageModifiable(EtatLabo etat) {
    if (etat.drapeau('interrupteur_ferme')) {
      throw ArgumentError('Ouvre K avant de modifier le montage.');
    }
  }

  @override
  EtatLabo placerMateriel(
      EtatLabo etat, String materielId, String? emplacementId) {
    final besoinEmplacement = materielId == 'resistor_r1' ||
        materielId == 'resistor_r2' ||
        _role(materielId) != null;
    if (besoinEmplacement && emplacementId == null) {
      throw ArgumentError.value(
          null, 'emplacement_id', 'obligatoire pour $materielId');
    }
    var suivant = etat.avecMateriel(materielId, emplacementId);
    if (_aiguille(materielId)) {
      // L'appareil est posé sur son plus petit calibre : à l'élève de choisir le plus grand d'abord.
      suivant = suivant.avecReglages({
        'calibre_$materielId': _calibres(materielId).first,
        'inverse_$materielId': false,
      });
    } else if (_role(materielId) != null) {
      suivant = suivant.avecReglage('inverse_$materielId', false);
    }
    return suivant;
  }

  // -- Physique du circuit -------------------------------------------------------

  String? _topologie(EtatLabo e) {
    final a = e.materiel['resistor_r1'];
    final b = e.materiel['resistor_r2'];
    if (a == null || b == null || a != b) return null;
    return a;
  }

  _Circuit _circuit(EtatLabo e) {
    final u = e.nombre('tension_generateur_v') ?? 0.0;
    final topo = _topologie(e);
    final complet = topo != null &&
        e.materiel.containsKey('alimentation') &&
        e.materiel.containsKey('interrupteur_k') &&
        condition('montage_sans_court_circuit', e);
    final voltmetreEnSerie = _instruments(e)
        .any((id) => _role(id) == 'voltmetre' && _dansBoucle(e.materiel[id]));
    final actif =
        complet && e.drapeau('interrupteur_ferme') && !voltmetreEnSerie;
    final r1 = parametres.r1Ohm;
    final r2 = parametres.r2Ohm;
    if (actif && topo == 'serie') {
      final i = intensiteSerieA(tensionGenerateurV: u, r1Ohm: r1, r2Ohm: r2);
      return _Circuit(
        topologie: topo,
        actif: true,
        u: u,
        i0: i,
        i1: i,
        i2: i,
        chute1: i * r1,
        chute2: i * r2,
      );
    }
    if (actif && topo == 'derivation') {
      final c = courantsDerivation(tensionGenerateurV: u, r1Ohm: r1, r2Ohm: r2);
      return _Circuit(
        topologie: topo,
        actif: true,
        u: u,
        i0: c.i0A,
        i1: c.i1A,
        i2: c.i2A,
        chute1: u,
        chute2: u,
      );
    }
    return _Circuit(
      topologie: topo,
      actif: false,
      u: u,
      i0: 0,
      i1: 0,
      i2: 0,
      chute1: 0,
      chute2: 0,
    );
  }

  double? _tensionVoltmetre(EtatLabo e, _Circuit c, String emplacement) {
    switch (emplacement) {
      case 'bornes_r1':
        return c.chute1;
      case 'bornes_r2':
        return c.chute2;
      case 'bornes_generateur':
        return c.u;
      case 'bornes_k':
        return e.drapeau('interrupteur_ferme') ? 0.0 : c.u;
      case 'point_p':
        return e.drapeau('masse_n') ? c.u : null;
      case 'point_a':
        return e.drapeau('masse_n') && c.topologie == 'serie' ? c.chute2 : null;
      default: // voltmètre placé dans la boucle : il se comporte comme un circuit ouvert
        return e.drapeau('interrupteur_ferme') ? c.u : 0.0;
    }
  }

  /// Ce que voit l'élève sur un appareil placé dans le montage.
  LectureAppareil lectureAppareil(EtatLabo e, String materielId) {
    final emp = e.materiel[materielId];
    final role = _role(materielId);
    if (role == null || emp == null) return const LectureAppareil();
    final c = _circuit(e);
    double? v;
    if (role == 'ammetre') {
      if (emp.startsWith('bornes_')) {
        v = null;
      } else if (c.topologie == 'derivation') {
        v = emp == 'branche_r1' ? c.i1 : (emp == 'branche_r2' ? c.i2 : c.i0);
      } else {
        v = c.i0;
      }
    } else {
      v = _tensionVoltmetre(e, c, emp);
      if (v != null && e.drapeau('inverse_$materielId')) v = -v;
    }
    if (v == null) return const LectureAppareil();
    if (_aiguille(materielId)) {
      final cal = e.nombre('calibre_$materielId')!;
      final l = role == 'ammetre'
          ? lectureAiguilleIntensite(
              intensiteA: v,
              calibreA: cal,
              divisionsTotal: parametres.divisionsCadran)
          : lectureAiguilleTension(
              tensionV: v,
              calibreV: cal,
              divisionsTotal: parametres.divisionsCadran);
      return LectureAppareil(
        valeur: v,
        aiguilleDiv: l.divisions,
        horsEchelle: l.horsEchelle,
        sensInverse: l.sensInverse,
      );
    }
    final res = parametres.resolutionMultimetre;
    return LectureAppareil(valeur: v, affichage: (v / res).round() * res);
  }

  // -- Conditions, conseils -------------------------------------------------------

  @override
  bool condition(String id, EtatLabo e) {
    switch (id) {
      case 'montage_sans_court_circuit':
        return e.materiel['fils'] != 'bornes_generateur' &&
            !_instruments(e).any((i) =>
                _role(i) == 'ammetre' && e.materiel[i] == 'bornes_generateur');
      case 'amperemetre_en_serie':
        return _instruments(e)
            .where((i) => _role(i) == 'ammetre')
            .every((i) => _dansBoucle(e.materiel[i]));
      case 'plus_grand_calibre':
        return _instruments(e)
            .where(_aiguille)
            .every((i) => e.nombre('calibre_$i') == _calibres(i).last);
    }
    throw ArgumentError.value(
        id, 'exige', 'condition inconnue pour ${definition.id}');
  }

  String? _amperemetreAiguille(EtatLabo e) {
    for (final i in _instruments(e)) {
      if (_aiguille(i) && _role(i) == 'ammetre') return i;
    }
    return null;
  }

  bool _aMesure(EtatLabo e, List<String> ids) {
    final faits = e.mesures.map((m) => m.grandeurId).toSet();
    return ids.every(faits.contains);
  }

  @override
  bool conseilActif(String quand, EtatLabo e) {
    switch (quand) {
      case 'aiguille_hors_echelle':
        return _instruments(e)
            .where(_aiguille)
            .any((i) => lectureAppareil(e, i).horsEchelle);
      case 'calibre_reductible':
      case 'calibre_optimal_atteint':
        final id = _amperemetreAiguille(e);
        if (id == null || !_dansBoucle(e.materiel[id])) return false;
        final l = lectureAppareil(e, id);
        final i = l.valeur ?? 0;
        if (l.horsEchelle || i <= 0) return false;
        final cal = e.nombre('calibre_$id')!;
        final plusPetit =
            _calibres(id).where((c) => c < cal && i <= c * (1 + 1e-9));
        return quand == 'calibre_reductible'
            ? plusPetit.isNotEmpty
            : plusPetit.isEmpty;
      case 'courants_serie_mesures':
        return _aMesure(e, ['i_point_1_a', 'i_point_2_a', 'i_point_3_a']);
      case 'derivation_mesuree':
        return _aMesure(
            e, ['i_branche_principale_a', 'i_branche_r1_a', 'i_branche_r2_a']);
      case 'voltmetre_en_serie':
        return _instruments(e)
            .any((i) => _role(i) == 'voltmetre' && _dansBoucle(e.materiel[i]));
      case 'branchement_inverse':
        return e.drapeau('interrupteur_ferme') &&
            _instruments(e).any((i) =>
                _role(i) == 'voltmetre' &&
                e.drapeau('inverse_$i') &&
                (lectureAppareil(e, i).valeur ?? 0) < 0);
      case 'somme_tensions_mesurees':
        return _aMesure(e, ['u_pa_v', 'u_an_v', 'u_pn_v']);
      case 'tensions_derivation_mesurees':
        return _aMesure(e, ['u1_v', 'u2_v', 'u_pn_v']);
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
        return e.avecReglage('tension_generateur_v', t);
      case 'fermer_interrupteur':
        if (!e.materiel.containsKey('interrupteur_k')) {
          throw ArgumentError('Place d\'abord l\'interrupteur K.');
        }
        return e.avecReglage('interrupteur_ferme', true);
      case 'ouvrir_interrupteur':
        return e.avecReglage('interrupteur_ferme', false);
      case 'choisir_calibre':
        final id = texteRequis(v, 'materiel_id');
        if (!e.materiel.containsKey(id) || !_aiguille(id)) {
          throw ArgumentError.value(
              id, 'materiel_id', 'appareil à aiguille non placé');
        }
        final cle = _role(id) == 'ammetre' ? 'calibre_a' : 'calibre_v';
        final cal = nombrePermis(v, cle, _calibres(id));
        return e.avecReglage('calibre_$id', cal);
      case 'inverser_branchement':
        final id = texteRequis(v, 'materiel_id');
        if (!e.materiel.containsKey(id) || _role(id) != 'voltmetre') {
          throw ArgumentError.value(id, 'materiel_id', 'voltmètre non placé');
        }
        return e.avecReglage('inverse_$id', !e.drapeau('inverse_$id'));
      case 'relier_masse':
        if (texteRequis(v, 'point_id') != 'n') {
          throw ArgumentError.value(
              v['point_id'], 'point_id', 'seul le point n peut être la masse');
        }
        return e.avecReglage('masse_n', true);
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  double? _verite(EtatLabo e, String g) {
    final c = _circuit(e);
    final serie = c.topologie == 'serie';
    final derivation = c.topologie == 'derivation';
    switch (g) {
      case 'intensite_aiguille_a':
      case 'intensite_multimetre_a':
      case 'i_point_1_a':
      case 'i_point_2_a':
      case 'i_point_3_a':
      case 'i_branche_principale_a':
        return c.i0;
      case 'i_branche_r1_a':
        return derivation ? c.i1 : null;
      case 'i_branche_r2_a':
        return derivation ? c.i2 : null;
      case 'u_pa_v':
        return serie ? c.chute1 : null;
      case 'u_an_v':
        return serie ? c.chute2 : null;
      case 'u_pn_v':
      case 'v_p_v':
      case 'u_k_ouvert_v':
        return c.u;
      case 'u1_v':
        return derivation ? c.chute1 : null;
      case 'u2_v':
        return derivation ? c.chute2 : null;
      case 'u_ap_v':
        return serie ? -c.chute1 : null;
      case 'u_k_ferme_v':
        return 0.0;
      case 'v_a_v':
        return serie ? c.chute2 : null;
    }
    return null;
  }

  double _tolerance(EtatLabo e, String g) {
    final tension = g.startsWith('u') || g.startsWith('v_');
    final role = tension ? 'voltmetre' : 'ammetre';
    if (g == 'intensite_multimetre_a') return parametres.resolutionMultimetre;
    for (final i in _instruments(e)) {
      if (_aiguille(i) && _role(i) == role) {
        return parametres.toleranceLectureDiv *
            e.nombre('calibre_$i')! /
            parametres.divisionsCadran;
      }
    }
    return parametres.resolutionMultimetre;
  }

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    if (saisie is! num)
      throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
    final ammetre = _amperemetreAiguille(e);
    return Mesure(
      grandeurId: g,
      saisie: saisie,
      unite: unite,
      reelle: _verite(e, g),
      contexte: {
        'horsEchelle': _instruments(e)
            .where(_aiguille)
            .any((i) => lectureAppareil(e, i).horsEchelle),
        'voltmetreEnSerie': _instruments(e)
            .any((i) => _role(i) == 'voltmetre' && _dansBoucle(e.materiel[i])),
        'tolerance': _tolerance(e, g),
        'calibreA': ammetre == null ? null : e.nombre('calibre_$ammetre'),
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

    for (final b in e.blocages) {
      switch (b) {
        case 'amperemetre_en_serie':
          ajouter('amperemetre_en_derivation');
        case 'pas_de_court_circuit':
          ajouter('court_circuit_generateur');
        case 'grand_calibre_en_premier':
          ajouter('grand_calibre_oublie');
      }
    }
    for (final m in e.mesures) {
      if (m.contexte['horsEchelle'] == true) ajouter('calibre_trop_petit');
      if (m.contexte['voltmetreEnSerie'] == true) ajouter('voltmetre_en_serie');
      final reelle = m.reelle;
      final saisie = m.saisie;
      if (reelle != null && saisie is num) {
        final tol = (m.contexte['tolerance'] as double?) ??
            parametres.resolutionMultimetre;
        if ((saisie - reelle).abs() > tol) ajouter('lecture_cadran');
      }
    }
    return codes;
  }

  @override
  Map<String, Object?> resultat(EtatLabo e) {
    final derniere = e.dernieresMesures;
    final sortie = <String, Object?>{
      for (final g in grandeursMesurables)
        if (derniere.containsKey(g) &&
            g != 'u_ap_v' &&
            g != 'u_k_ouvert_v' &&
            g != 'u_k_ferme_v')
          g: derniere[g]!.saisie,
    };
    final m = derniere['intensite_aiguille_a'];
    if (definition.id == 'mesure_intensite' && m != null) {
      final cal = m.contexte['calibreA'] as double?;
      final i = (m.saisie as num).toDouble();
      if (cal != null && i > 0) {
        final delta =
            incertitudeAbsolueA(classe: parametres.classe, calibreA: cal);
        sortie['delta_i_a'] = delta;
        sortie['tau'] =
            incertitudeRelative(incertitudeAbsolue: delta, valeurMesuree: i);
      }
    }
    return sortie;
  }
}
