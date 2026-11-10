import 'electricite.dart';
import 'migration_ions.dart';
import 'noyau.dart';

/// Paramètres de la migration. HYPOTHÈSES À VALIDER : la fiche dit seulement « quelques dizaines
/// de mA » et « 10 à 15 minutes ». La résistance du papier, la plage du rhéostat et la vitesse de
/// migration en fonction du courant ne figurent pas dans la fiche.
class ParametresMigration {
  const ParametresMigration({
    this.resistancePapierOhm = 50.0,
    this.rheostatMaxOhm = 330.0,
    this.tensionMaxV = 12.0,
    this.calibresAmperemetreA = const [0.1, 0.3, 1.0, 3.0],
    this.divisionsCadran = 100.0,
    this.courantReferenceA = 0.030,
    this.dureeReferenceS = 600.0,
  });

  final double resistancePapierOhm;
  final double rheostatMaxOhm;
  final double tensionMaxV;
  final List<double> calibresAmperemetreA;
  final double divisionsCadran;

  /// Courant pour lequel les taches atteignent les électrodes en [dureeReferenceS].
  final double courantReferenceA;
  final double dureeReferenceS;
}

/// Ce que le papier-filtre doit dessiner. Positions entre -1 (électrode de gauche) et +1
/// (électrode de droite), 0 au centre (dépôt initial).
class AffichageMigration {
  const AffichageMigration({
    required this.courantA,
    required this.positionCuivre,
    required this.positionPermanganate,
    required this.aiguilleDiv,
    required this.horsEchelle,
  });
  final double courantA;
  final double positionCuivre;
  final double positionPermanganate;
  final double? aiguilleDiv;
  final bool horsEchelle;
}

/// Laboratoire migration_ions. `electrode_a` est reliée à la borne + (anode), `electrode_b` à la
/// borne - (cathode) ; l'élève choisit de quel côté du dépôt il place chacune.
class LaboMigration extends Laboratoire {
  LaboMigration(super.definition,
      {this.parametres = const ParametresMigration()}) {
    if (definition.id != 'migration_ions' ||
        definition.calcul != 'migration_ions') {
      throw ArgumentError(
          'LaboMigration ne gère pas ${definition.id} (${definition.calcul}).');
    }
  }

  final ParametresMigration parametres;

  static const _cristaux = ['cristal_sulfate_cuivre', 'cristal_permanganate'];

  @override
  Set<String> get actions => {
        'placer_materiel',
        'regler_tension',
        'regler_rheostat',
        'choisir_calibre',
        'deposer_cristal',
        'fermer_interrupteur',
        'ouvrir_interrupteur',
        'mesurer',
        'terminer',
      };

  @override
  Set<String> get grandeursMesurables =>
      {'courant_ma', 'duree_min', 'electrode_cu2_plus', 'electrode_mno4_moins'};

  @override
  Map<String, Set<String>> get emplacementsAutorises => {
        'electrode_a': {'gauche', 'droite'},
        'electrode_b': {'gauche', 'droite'},
        'fils': {'circuit', 'bornes_generateur'},
      };

  @override
  EtatLabo etatInitial() => EtatLabo(reglages: {
        'tension_generateur_v': 0.0,
        'interrupteur_ferme': false,
        'resistance_rheostat_ohm': parametres.rheostatMaxOhm,
        'progression_cuivre': 0.0,
        'progression_permanganate': 0.0,
        'temps_courant_s': 0.0,
      });

  @override
  void verifierMontageModifiable(EtatLabo etat) {
    if (etat.drapeau('interrupteur_ferme')) {
      throw ArgumentError('Ouvre K avant de modifier le montage.');
    }
  }

  @override
  EtatLabo placerMateriel(
      EtatLabo etat, String materielId, String? emplacementId) {
    if (_cristaux.contains(materielId)) {
      throw ArgumentError.value(
          materielId, 'materiel_id', 'utilise deposer_cristal pour un cristal');
    }
    if ((materielId == 'electrode_a' || materielId == 'electrode_b') &&
        emplacementId == null) {
      throw ArgumentError.value(
          null, 'emplacement_id', 'obligatoire pour $materielId');
    }
    var suivant = etat.avecMateriel(materielId, emplacementId);
    if (materielId == 'amperemetre') {
      suivant = suivant.avecReglage(
          'calibre_amperemetre', parametres.calibresAmperemetreA.first);
    }
    return suivant;
  }

  // -- Physique ---------------------------------------------------------------------

  bool _complet(EtatLabo e) {
    const requis = [
      'alimentation',
      'interrupteur_k',
      'rheostat',
      'amperemetre',
      'papier_filtre',
      'electrode_a',
      'electrode_b',
    ];
    final a = e.materiel['electrode_a'];
    final b = e.materiel['electrode_b'];
    return requis.every(e.materiel.containsKey) &&
        a != null &&
        b != null &&
        a != b &&
        condition('montage_sans_court_circuit', e);
  }

  double courantA(EtatLabo e) {
    if (!_complet(e) || !e.drapeau('interrupteur_ferme')) return 0.0;
    final u = e.nombre('tension_generateur_v') ?? 0.0;
    return intensiteLoiOhmA(
      tensionV: u,
      resistanceOhm:
          (e.nombre('resistance_rheostat_ohm') ?? parametres.rheostatMaxOhm) +
              parametres.resistancePapierOhm,
    );
  }

  double _cote(String? emplacement) => emplacement == 'droite' ? 1.0 : -1.0;

  /// Description du papier-filtre pour le dessin.
  AffichageMigration affichage(EtatLabo e) {
    final i = courantA(e);
    LectureAiguille? l;
    if (e.materiel.containsKey('amperemetre')) {
      l = lectureAiguilleIntensite(
        intensiteA: i,
        calibreA: e.nombre('calibre_amperemetre')!,
        divisionsTotal: parametres.divisionsCadran,
      );
    }
    // Les ions positifs (Cu²⁺) vont vers la cathode (electrode_b), les ions négatifs (MnO₄⁻) vers l'anode (electrode_a).
    final versCathode = _cote(e.materiel['electrode_b']);
    final versAnode = _cote(e.materiel['electrode_a']);
    return AffichageMigration(
      courantA: i,
      positionCuivre: (e.nombre('progression_cuivre') ?? 0) * versCathode,
      positionPermanganate:
          (e.nombre('progression_permanganate') ?? 0) * versAnode,
      aiguilleDiv: l?.divisions,
      horsEchelle: l?.horsEchelle ?? false,
    );
  }

  @override
  EtatLabo avancer(EtatLabo etat, double deltaS) {
    final suivant = super.avancer(etat, deltaS);
    final i = courantA(etat);
    if (i <= 0 || deltaS == 0) return suivant;
    final pas = (i / parametres.courantReferenceA) *
        deltaS /
        parametres.dureeReferenceS;
    double avance(String cle, bool depose) {
      final p = etat.nombre(cle) ?? 0.0;
      return depose ? (p + pas > 1.0 ? 1.0 : p + pas) : p;
    }

    return suivant.avecReglages({
      'temps_courant_s': (etat.nombre('temps_courant_s') ?? 0.0) + deltaS,
      'progression_cuivre': avance('progression_cuivre',
          etat.materiel.containsKey('cristal_sulfate_cuivre')),
      'progression_permanganate': avance('progression_permanganate',
          etat.materiel.containsKey('cristal_permanganate')),
    });
  }

  // -- Conditions et conseils ------------------------------------------------------

  @override
  bool condition(String id, EtatLabo e) {
    switch (id) {
      case 'montage_sans_court_circuit':
        return e.materiel['fils'] != 'bornes_generateur';
      case 'plus_grand_calibre':
        return !e.materiel.containsKey('amperemetre') ||
            e.nombre('calibre_amperemetre') ==
                parametres.calibresAmperemetreA.last;
    }
    throw ArgumentError.value(
        id, 'exige', 'condition inconnue pour ${definition.id}');
  }

  @override
  bool conseilActif(String quand, EtatLabo e) {
    switch (quand) {
      case 'courant_nul':
        return e.drapeau('interrupteur_ferme') && courantA(e) <= 0;
      case 'duree_observation_atteinte':
        return (e.nombre('temps_courant_s') ?? 0.0) >=
            parametres.dureeReferenceS;
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
      case 'regler_rheostat':
        final r = nombreRequis(v, 'resistance_ohm');
        if (r < 0 || r > parametres.rheostatMaxOhm) {
          throw ArgumentError.value(r, 'resistance_ohm',
              'entre 0 et ${parametres.rheostatMaxOhm} ohms');
        }
        if (!e.materiel.containsKey('rheostat'))
          throw ArgumentError('Place d\'abord le rhéostat.');
        return e.avecReglage('resistance_rheostat_ohm', r);
      case 'choisir_calibre':
        if (!e.materiel.containsKey('amperemetre') ||
            texteRequis(v, 'materiel_id') != 'amperemetre') {
          throw ArgumentError('Ampèremètre non placé.');
        }
        return e.avecReglage(
          'calibre_amperemetre',
          nombrePermis(v, 'calibre_a', parametres.calibresAmperemetreA),
        );
      case 'deposer_cristal':
        final id = texteRequis(v, 'materiel_id');
        if (!_cristaux.contains(id))
          throw ArgumentError.value(id, 'materiel_id', 'cristal inconnu');
        if (!e.materiel.containsKey('papier_filtre')) {
          throw ArgumentError('Place d\'abord le papier-filtre.');
        }
        verifierMontageModifiable(e);
        return e.avecMateriel(id, 'centre');
      case 'fermer_interrupteur':
        if (!e.materiel.containsKey('interrupteur_k')) {
          throw ArgumentError('Place d\'abord l\'interrupteur K.');
        }
        return e.avecReglage('interrupteur_ferme', true);
      case 'ouvrir_interrupteur':
        return e.avecReglage('interrupteur_ferme', false);
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  static int _charge(String grandeur) =>
      grandeur == 'electrode_cu2_plus' ? 2 : -1;

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    switch (g) {
      case 'courant_ma':
        if (saisie is! num)
          throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
        return Mesure(
          grandeurId: g,
          saisie: saisie,
          unite: unite,
          reelle: courantA(e) * 1000,
          contexte: const {},
        );
      case 'duree_min':
        if (saisie is! num)
          throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
        return Mesure(
          grandeurId: g,
          saisie: saisie,
          unite: unite,
          reelle: (e.nombre('temps_courant_s') ?? 0.0) / 60,
          contexte: const {},
        );
      default:
        if (saisie is! String || (saisie != 'anode' && saisie != 'cathode')) {
          throw ArgumentError.value(
              saisie, 'valeur', 'anode ou cathode attendu');
        }
        final juste =
            electrodeVersLaquelleMigre(chargeElementaire: _charge(g)).name;
        return Mesure(
          grandeurId: g,
          saisie: saisie,
          unite: unite,
          reelle: null,
          contexte: {'electrodeJuste': juste},
        );
    }
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
        case 'gants_avant_cristaux':
          ajouter('gants_oublies');
        case 'pas_de_court_circuit':
          ajouter('court_circuit_generateur');
        case 'grand_calibre_en_premier':
          ajouter('grand_calibre_oublie');
      }
    }
    for (final m in e.mesures) {
      final juste = m.contexte['electrodeJuste'];
      if (juste != null && m.saisie != juste) ajouter('electrode_inversee');
    }
    return codes;
  }

  @override
  Map<String, Object?> resultat(EtatLabo e) {
    final d = e.dernieresMesures;
    return {
      for (final g in grandeursMesurables)
        if (d.containsKey(g)) g: d[g]!.saisie
    };
  }
}
