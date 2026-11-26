import 'noyau.dart';
import 'statistiques.dart';

// Valeurs de simulation tirées du guide TP de SVT (DESG, Togo). Les durées d'évolution
// (linéaires) et les tolérances de lecture sont des HYPOTHÈSES à faire valider.

/// TP « échanges d'eau des cellules de pomme de terre » (Première).
class LaboOsmose extends Laboratoire {
  LaboOsmose(super.definition) {
    if (definition.id != 'osmose_pomme_de_terre' ||
        definition.calcul != 'svt_osmose') {
      throw ArgumentError('LaboOsmose ne gère pas ${definition.id}.');
    }
  }

  static const tubes = ['tube_1', 'tube_2', 'tube_3', 'tube_4'];
  static const solutions = [
    'eau_distillee',
    'solution_saccharose_125',
    'solution_saccharose_250',
    'solution_saccharose_375',
  ];

  /// Longueur de chacune des 4 tranches après 2 h (cm), d'après le guide.
  static const longueursFinalesCm = {
    'eau_distillee': [3.1, 3.2, 3.1, 3.1],
    'solution_saccharose_125': [2.7, 2.7, 2.7, 2.7],
    'solution_saccharose_250': [2.4, 2.5, 2.3, 2.4],
    'solution_saccharose_375': [2.2, 2.1, 2.1, 2.2],
  };
  static const longueurInitialeCm = 2.7;
  static const dureeS = 7200.0;
  static const toleranceCm = 0.05;

  @override
  Set<String> get actions => {
    'placer_materiel',
    'introduire_tranches',
    'mesurer',
    'terminer',
  };

  @override
  Set<String> get grandeursMesurables => {
    'longueur_initiale_cm',
    for (var i = 1; i <= 4; i++) 'longueur_moyenne_tube_${i}_cm',
  };

  @override
  Map<String, Set<String>> get emplacementsAutorises => {
    for (final t in tubes) t: solutions.toSet(),
  };

  @override
  EtatLabo etatInitial() => const EtatLabo();

  @override
  EtatLabo placerMateriel(
    EtatLabo etat,
    String materielId,
    String? emplacementId,
  ) {
    if (tubes.contains(materielId)) {
      if (emplacementId == null)
        throw ArgumentError.value(
          null,
          'emplacement_id',
          'solution du tube obligatoire',
        );
      if (etat.nombre('debut_$materielId') != null)
        throw ArgumentError('Les tranches sont déjà dans $materielId.');
    }
    return etat.avecMateriel(materielId, emplacementId);
  }

  /// Longueur moyenne des tranches d'un tube à l'instant courant (null si pas de tranches).
  double? longueurMoyenneCm(EtatLabo e, String tube) {
    final debut = e.nombre('debut_$tube'), solution = e.materiel[tube];
    if (debut == null || solution == null) return null;
    final f = ((e.tempsS - debut) / dureeS).clamp(0.0, 1.0);
    final fin = moyenne(longueursFinalesCm[solution]!);
    return longueurInitialeCm + (fin - longueurInitialeCm) * f;
  }

  bool _identiques(EtatLabo e) {
    final c = [
      for (final t in tubes)
        if (e.materiel[t] != null) e.materiel[t]!,
    ];
    return c.length != c.toSet().length;
  }

  @override
  bool condition(String id, EtatLabo e) => throw ArgumentError.value(
    id,
    'exige',
    'aucune condition pour ${definition.id}',
  );

  @override
  bool conseilActif(String quand, EtatLabo e) {
    switch (quand) {
      case 'deux_heures_ecoulees':
        return tubes.any(
          (t) =>
              e.nombre('debut_$t') != null &&
              e.tempsS - e.nombre('debut_$t')! >= dureeS,
        );
      case 'tubes_identiques':
        return _identiques(e);
    }
    throw ArgumentError.value(
      quand,
      'quand',
      'conseil inconnu pour ${definition.id}',
    );
  }

  @override
  EtatLabo transitionSpecifique(
    EtatLabo e,
    String action,
    Map<String, Object?> v,
  ) {
    if (action == 'introduire_tranches') {
      final t = texteRequis(v, 'tube_id');
      if (!tubes.contains(t) || e.materiel[t] == null)
        throw ArgumentError.value(t, 'tube_id', 'tube rempli attendu');
      if (e.nombre('debut_$t') != null)
        throw ArgumentError('Les tranches sont déjà dans $t.');
      return e.avecReglage('debut_$t', e.tempsS);
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    if (saisie is! num)
      throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
    double? reelle;
    var tropTot = false;
    if (g == 'longueur_initiale_cm') {
      reelle = longueurInitialeCm;
    } else {
      final t = 'tube_${g.split('_')[3]}';
      reelle = longueurMoyenneCm(e, t);
      final d = e.nombre('debut_$t');
      tropTot = d != null && e.tempsS - d < dureeS;
    }
    return Mesure(
      grandeurId: g,
      saisie: saisie,
      unite: unite,
      reelle: reelle,
      contexte: {'tropTot': tropTot, 'tolerance': toleranceCm},
    );
  }

  @override
  List<String> erreursBilan(EtatLabo e) {
    final c = <String>[];
    void a(String x) {
      if (!c.contains(x)) c.add(x);
    }

    if (_identiques(e)) a('tubes_identiques');
    for (final m in e.mesures) {
      if (m.contexte['tropTot'] == true) a('mesure_trop_tot');
      final r = m.reelle, s = m.saisie;
      if (r != null &&
          s is num &&
          (s - r).abs() > (m.contexte['tolerance'] as double))
        a('lecture_longueur');
    }
    return c;
  }

  @override
  Map<String, Object?> resultat(EtatLabo e) => {
    for (final m in e.dernieresMesures.values) m.grandeurId: m.saisie,
  };
}

/// TP « constituants d'un sol » (Seconde) : sédimentation en trois couches.
class LaboSol extends Laboratoire {
  LaboSol(super.definition) {
    if (definition.id != 'sol_constituants' || definition.calcul != 'svt_sol') {
      throw ArgumentError('LaboSol ne gère pas ${definition.id}.');
    }
  }

  /// Hauteurs des couches mesurées dans le guide (cm).
  static const hauteursCm = {'sable': 4.8, 'limon': 1.9, 'argile': 3.2};
  static const terreTotaleCm = 9.9;
  static const sedimentationS = 86400.0; // 24 h (guide)
  static const agitationMinS = 180.0; // 3 min (guide)

  @override
  Set<String> get actions => {
    'placer_materiel',
    'agiter',
    'mesurer',
    'terminer',
  };

  @override
  Set<String> get grandeursMesurables => {
    'hauteur_sable_cm',
    'hauteur_limon_cm',
    'hauteur_argile_cm',
    'hauteur_terre_totale_cm',
    'pourcentage_sable',
    'pourcentage_limon',
    'pourcentage_argile',
  };

  @override
  EtatLabo etatInitial() => const EtatLabo();

  /// Part de la sédimentation faite (0 à 1) : les couches grandissent jusqu'à 24 h de repos.
  double fraction(EtatLabo e) {
    final fin = e.nombre('fin_agitation_s');
    if (fin == null || (e.nombre('agitation_s') ?? 0) < agitationMinS)
      return 0.0;
    return ((e.tempsS - fin) / sedimentationS).clamp(0.0, 1.0);
  }

  double hauteurCouchesCm(EtatLabo e, String couche) =>
      fraction(e) * hauteursCm[couche]!;

  @override
  bool condition(String id, EtatLabo e) => throw ArgumentError.value(
    id,
    'exige',
    'aucune condition pour ${definition.id}',
  );

  @override
  bool conseilActif(String quand, EtatLabo e) {
    switch (quand) {
      case 'agitation_a_faire':
        return e.materiel.containsKey('terre') &&
            e.materiel.containsKey('eau') &&
            (e.nombre('agitation_s') ?? 0) == 0;
      case 'couches_visibles':
        return fraction(e) >= 1.0;
    }
    throw ArgumentError.value(
      quand,
      'quand',
      'conseil inconnu pour ${definition.id}',
    );
  }

  @override
  EtatLabo transitionSpecifique(
    EtatLabo e,
    String action,
    Map<String, Object?> v,
  ) {
    if (action == 'agiter') {
      final d = nombreRequis(v, 'duree_s');
      if (d <= 0) throw ArgumentError.value(d, 'duree_s', 'positive attendue');
      if (!e.materiel.containsKey('terre') || !e.materiel.containsKey('eau')) {
        throw ArgumentError(
          'Mets la terre puis l\'eau dans le bocal avant d\'agiter.',
        );
      }
      return e.avecReglages({
        'agitation_s': (e.nombre('agitation_s') ?? 0) + d,
        'fin_agitation_s': e.tempsS,
      });
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    if (saisie is! num)
      throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
    final f = fraction(e);
    final couche = g.split('_')[1];
    double? reelle;
    if (g == 'hauteur_terre_totale_cm') {
      reelle = e.materiel.containsKey('terre') ? terreTotaleCm : null;
    } else if (f > 0) {
      reelle = g.startsWith('hauteur_')
          ? hauteurCouchesCm(e, couche)
          : 100 * hauteursCm[couche]! / terreTotaleCm;
    }
    return Mesure(
      grandeurId: g,
      saisie: saisie,
      unite: unite,
      reelle: reelle,
      contexte: {
        'tolerance': g.startsWith('pourcentage_') ? 0.3 : 0.1,
        'pourcentage': g.startsWith('pourcentage_'),
        'agitationInsuffisante': (e.nombre('agitation_s') ?? 0) < agitationMinS,
        'tropTot':
            g != 'hauteur_terre_totale_cm' &&
            f < 1.0 &&
            (e.nombre('agitation_s') ?? 0) >= agitationMinS,
      },
    );
  }

  @override
  List<String> erreursBilan(EtatLabo e) {
    final c = <String>[];
    void a(String x) {
      if (!c.contains(x)) c.add(x);
    }

    for (final m in e.mesures) {
      if (m.grandeurId == 'hauteur_terre_totale_cm') continue;
      if (m.contexte['agitationInsuffisante'] == true)
        a('agitation_insuffisante');
      if (m.contexte['tropTot'] == true) a('mesure_trop_tot');
      final r = m.reelle, s = m.saisie;
      if (r != null &&
          s is num &&
          (s - r).abs() > (m.contexte['tolerance'] as double)) {
        a(
          m.contexte['pourcentage'] == true
              ? 'pourcentage_faux'
              : 'lecture_hauteur',
        );
      }
    }
    return c;
  }

  @override
  Map<String, Object?> resultat(EtatLabo e) => {
    for (final m in e.dernieresMesures.values) m.grandeurId: m.saisie,
  };
}
