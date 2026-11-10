import 'noyau.dart';
import 'optique.dart';
import 'statistiques.dart';

/// Paramètres du banc d'optique. HYPOTHÈSES à valider : la fiche ne donne ni la distance focale
/// de la « lentille convergente inconnue », ni la tolérance de netteté ; le banc fait « env. 1 m ».
class ParametresOptique {
  const ParametresOptique({
    this.fPrimeCm = 15.0,
    this.longueurBancCm = 100.0,
    this.toleranceNetteteCm = 0.5,
  });

  /// Distance focale réelle de la lentille simulée. Cachée à l'élève : ne jamais l'afficher ni la donner.
  final double fPrimeCm;
  final double longueurBancCm;
  final double toleranceNetteteCm;
}

/// Ce que le banc d'optique doit dessiner.
class AffichageOptique {
  const AffichageOptique({
    required this.oaCm,
    required this.oaPrimeCm,
    required this.positionImageCm,
    required this.nette,
  });

  /// OA = position de l'objet - position de la lentille (négatif : objet devant la lentille).
  final double? oaCm;

  /// OA' (négatif : image virtuelle ; null : image à l'infini ou objet non réel).
  final double? oaPrimeCm;

  /// Position de l'image réelle sur le banc (null s'il n'y en a pas).
  final double? positionImageCm;

  /// Image nette sur l'écran (ou, avec le miroir, image nette dans le plan de l'objet).
  final bool nette;
}

/// Laboratoire focale_lentille : trois méthodes (Bilbermann, Bessel, Descartes).
class LaboOptique extends Laboratoire {
  LaboOptique(super.definition, {this.parametres = const ParametresOptique()}) {
    if (definition.id != 'focale_lentille' || definition.calcul != 'optique') {
      throw ArgumentError(
          'LaboOptique ne gère pas ${definition.id} (${definition.calcul}).');
    }
  }

  final ParametresOptique parametres;

  static const _mobiles = ['objet_lumineux', 'lentille_convergente', 'ecran'];

  @override
  Set<String> get actions =>
      {'placer_materiel', 'deplacer_materiel', 'mesurer', 'terminer'};

  @override
  Set<String> get grandeursMesurables => {
        'position_a_cm',
        'position_o_cm',
        'distance_objet_ecran_cm',
        'position_l1_cm',
        'position_l2_cm',
        'oa_cm',
        'oa_prime_cm',
        'f_prime_cm',
      };

  @override
  Map<String, Set<String>> get emplacementsAutorises => {
        'miroir_plan': {'derriere_lentille'},
      };

  @override
  EtatLabo etatInitial() => const EtatLabo();

  @override
  EtatLabo placerMateriel(
      EtatLabo etat, String materielId, String? emplacementId) {
    var suivant = etat.avecMateriel(materielId, emplacementId);
    // Positions de départ sur le banc, que l'élève déplace ensuite.
    const depart = {
      'objet_lumineux': 0.0,
      'lentille_convergente': 50.0,
      'ecran': 100.0
    };
    final p = depart[materielId];
    if (p != null && etat.nombre('position_${materielId}_cm') == null) {
      suivant = suivant.avecReglage('position_${materielId}_cm', p);
    }
    return suivant;
  }

  // -- Optique ---------------------------------------------------------------------

  double? _pos(EtatLabo e, String id) =>
      e.materiel.containsKey(id) ? e.nombre('position_${id}_cm') : null;

  double? _oa(EtatLabo e) {
    final a = _pos(e, 'objet_lumineux');
    final l = _pos(e, 'lentille_convergente');
    return (a == null || l == null) ? null : a - l;
  }

  /// Description du banc pour le dessin.
  AffichageOptique affichage(EtatLabo e) {
    final oa = _oa(e);
    final l = _pos(e, 'lentille_convergente');
    double? oaPrime;
    if (oa != null && oa < 0) {
      oaPrime = positionImageCm(oaCm: oa, fPrimeCm: parametres.fPrimeCm);
    }
    final reelle = oaPrime != null && oaPrime > 0 && l != null;
    final image = reelle ? l + oaPrime : null;
    var nette = false;
    final tol = parametres.toleranceNetteteCm;
    if (e.materiel['miroir_plan'] == 'derriere_lentille') {
      // Autocollimation : l'image revient nette, dans le plan de l'objet, si l'objet est au foyer.
      nette =
          oa != null && oa < 0 && (oa.abs() - parametres.fPrimeCm).abs() <= tol;
    } else {
      final ecran = _pos(e, 'ecran');
      nette = image != null && ecran != null && (ecran - image).abs() <= tol;
    }
    return AffichageOptique(
        oaCm: oa, oaPrimeCm: oaPrime, positionImageCm: image, nette: nette);
  }

  double? _distanceObjetEcran(EtatLabo e) {
    final a = _pos(e, 'objet_lumineux');
    final s = _pos(e, 'ecran');
    return (a == null || s == null) ? null : s - a;
  }

  // -- Conditions et conseils ---------------------------------------------------------

  @override
  bool condition(String id, EtatLabo e) => throw ArgumentError.value(
      id, 'exige', 'aucune condition pour ${definition.id}');

  bool _a(EtatLabo e, List<String> ids) {
    final faits = e.mesures.map((m) => m.grandeurId).toSet();
    return ids.every(faits.contains);
  }

  @override
  bool conseilActif(String quand, EtatLabo e) {
    switch (quand) {
      case 'autocollimation_sans_miroir':
        return !e.materiel.containsKey('miroir_plan') &&
            e.mesures.any((m) =>
                m.grandeurId == 'position_a_cm' ||
                m.grandeurId == 'position_o_cm');
      case 'bessel_distance_insuffisante':
        final d = _distanceObjetEcran(e);
        return !e.materiel.containsKey('miroir_plan') &&
            d != null &&
            d > 0 &&
            d < 4 * parametres.fPrimeCm;
      case 'image_nette_obtenue':
        return affichage(e).nette;
      case 'trois_methodes_terminees':
        return _a(e, ['position_a_cm', 'position_o_cm']) &&
            _a(e, [
              'distance_objet_ecran_cm',
              'position_l1_cm',
              'position_l2_cm'
            ]) &&
            _a(e, ['oa_cm', 'oa_prime_cm']);
    }
    throw ArgumentError.value(
        quand, 'quand', 'conseil inconnu pour ${definition.id}');
  }

  // -- Actions --------------------------------------------------------------------

  @override
  EtatLabo transitionSpecifique(
      EtatLabo e, String action, Map<String, Object?> v) {
    if (action == 'deplacer_materiel') {
      final id = texteRequis(v, 'materiel_id');
      if (!_mobiles.contains(id) || !e.materiel.containsKey(id)) {
        throw ArgumentError.value(
            id, 'materiel_id', 'matériel mobile non placé');
      }
      final p = nombreRequis(v, 'position_cm');
      if (p < 0 || p > parametres.longueurBancCm) {
        throw ArgumentError.value(
            p, 'position_cm', 'entre 0 et ${parametres.longueurBancCm} cm');
      }
      return e.avecReglage('position_${id}_cm', p);
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  static const _avecImageNette = {
    'position_a_cm',
    'position_o_cm',
    'position_l1_cm',
    'position_l2_cm',
    'oa_cm',
    'oa_prime_cm',
  };

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    if (saisie is! num)
      throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
    final d = _distanceObjetEcran(e);
    return Mesure(
      grandeurId: g,
      saisie: saisie,
      unite: unite,
      reelle: null,
      contexte: {
        'imageNetteRequise': _avecImageNette.contains(g),
        'nette': affichage(e).nette,
        'dTropPetit': g == 'distance_objet_ecran_cm' &&
            d != null &&
            d < 4 * parametres.fPrimeCm,
        'oaPositif': g == 'oa_cm' && saisie > 0,
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

    for (final m in e.mesures) {
      if (m.contexte['dTropPetit'] == true)
        ajouter('distance_objet_ecran_trop_petite');
      if (m.contexte['imageNetteRequise'] == true &&
          m.contexte['nette'] == false) {
        ajouter('image_non_nette');
      }
      if (m.contexte['oaPositif'] == true) ajouter('signe_distance_algebrique');
    }
    return codes;
  }

  List<double> _valeurs(EtatLabo e, String g) => [
        for (final m in e.mesures)
          if (m.grandeurId == g && m.saisie is num) (m.saisie as num).toDouble()
      ];

  double? _moyenneOuNull(List<double> v) => v.isEmpty ? null : moyenne(v);

  @override
  Map<String, Object?> resultat(EtatLabo e) {
    final a = _valeurs(e, 'position_a_cm');
    final o = _valeurs(e, 'position_o_cm');
    final bilbermann = <double>[];
    for (var i = 0; i < a.length && i < o.length; i++) {
      if (a[i] != o[i]) bilbermann.add((o[i] - a[i]).abs());
    }

    final dd = _valeurs(e, 'distance_objet_ecran_cm');
    final l1 = _valeurs(e, 'position_l1_cm');
    final l2 = _valeurs(e, 'position_l2_cm');
    final bessel = <double>[];
    for (var i = 0; i < dd.length && i < l1.length && i < l2.length; i++) {
      try {
        bessel.add(foyerBesselCm(
            distanceObjetEcranCm: dd[i],
            ecartPositionsCm: (l2[i] - l1[i]).abs()));
      } on ArgumentError {
        // essai inutilisable (valeurs incohérentes) : ignoré
      }
    }

    final oa = _valeurs(e, 'oa_cm');
    final oaPrime = _valeurs(e, 'oa_prime_cm');
    final descartes = <double>[];
    for (var i = 0; i < oa.length && i < oaPrime.length; i++) {
      try {
        descartes.add(foyerDescartesCm(oaCm: oa[i], oaPrimeCm: oaPrime[i]));
      } on ArgumentError {
        // essai inutilisable : ignoré
      }
    }

    final fb = _moyenneOuNull(bilbermann);
    final fe = _moyenneOuNull(bessel);
    final fd = _moyenneOuNull(descartes);
    final disponibles = <double>[
      if (fb != null) fb,
      if (fe != null) fe,
      if (fd != null) fd
    ];
    final sortie = <String, Object?>{
      if (fb != null) 'f_prime_bilbermann_cm': fb,
      if (fe != null) 'f_prime_bessel_cm': fe,
      if (fd != null) 'f_prime_descartes_cm': fd,
    };
    if (disponibles.isNotEmpty) {
      final fm = moyenne(disponibles);
      sortie['f_prime_moyenne_cm'] = fm;
      sortie['vergence_dioptries'] = vergenceDioptries(fPrimeCm: fm);
    }
    return sortie;
  }
}
