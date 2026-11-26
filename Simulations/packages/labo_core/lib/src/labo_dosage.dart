import 'noyau.dart';
import 'titrage.dart';

/// Paramètres du dosage. Le brief donne Ca, Va, Cb. HYPOTHÈSES à valider : débits du robinet,
/// seuil « proche de l'équivalence », tolérances, zone de virage de la phénolphtaléine.
class ParametresDosage {
  const ParametresDosage({
    this.caMolL = 0.080,
    this.vaMl = 20.0,
    this.cbMolL = 0.10,
    this.buretteMl = 25.0,
    this.debitGouttesMlParS = 0.05,
    this.debitJetMlParS = 0.5,
    this.seuilProcheMl = 1.0,
    this.toleranceDepassementMl = 0.2,
    this.toleranceLectureMl = 0.1,
    this.toleranceVolumeAcideMl = 0.05,
    this.phVirage = 8.2,
  });
  final double caMolL,
      vaMl,
      cbMolL,
      buretteMl,
      debitGouttesMlParS,
      debitJetMlParS;
  final double seuilProcheMl,
      toleranceDepassementMl,
      toleranceLectureMl,
      toleranceVolumeAcideMl,
      phVirage;
}

/// Ce que le dosage doit dessiner.
class AffichageDosage {
  const AffichageDosage({
    required this.volumeVerseMl,
    required this.ph,
    required this.couleur,
    required this.debit,
  });
  final double volumeVerseMl;
  final double? ph;

  /// 'incolore' ou 'rose' (null sans indicateur).
  final String? couleur;
  final String debit;
}

/// Laboratoire titrage_acide_base : 20 mL d'acide chlorhydrique dosés par de la soude.
class LaboDosage extends Laboratoire {
  LaboDosage(super.definition, {this.parametres = const ParametresDosage()}) {
    if (definition.id != 'titrage_acide_base' ||
        definition.calcul != 'titrage') {
      throw ArgumentError('LaboDosage ne gère pas ${definition.id}.');
    }
  }

  final ParametresDosage parametres;
  static const debits = ['ferme', 'goutte_a_goutte', 'jet'];

  @override
  Set<String> get actions => {
    'placer_materiel',
    'verser',
    'tourner_robinet',
    'mesurer',
    'terminer',
  };

  @override
  Set<String> get grandeursMesurables => {
    'volume_equivalent_ml',
    'concentration_mol_l',
  };

  @override
  EtatLabo etatInitial() => const EtatLabo(
    reglages: {
      'volume_verse_ml': 0.0,
      'debit': 'ferme',
      'volume_acide_ml': 0.0,
    },
  );

  double get equivalenceMl => volumeEquivalentMl(
    caMolL: parametres.caMolL,
    vaMl: parametres.vaMl,
    cbMolL: parametres.cbMolL,
  );

  double? _ph(EtatLabo e) {
    final va = e.nombre('volume_acide_ml') ?? 0.0;
    if (va <= 0) return null;
    return phTitrage(
      caMolL: parametres.caMolL,
      vaMl: va,
      cbMolL: parametres.cbMolL,
      volumeVerseMl: e.nombre('volume_verse_ml') ?? 0.0,
    );
  }

  AffichageDosage affichage(EtatLabo e) {
    final ph = _ph(e);
    return AffichageDosage(
      volumeVerseMl: e.nombre('volume_verse_ml') ?? 0.0,
      ph: ph,
      couleur: e.materiel.containsKey('phenolphtaleine') && ph != null
          ? (ph >= parametres.phVirage ? 'rose' : 'incolore')
          : null,
      debit: e.texte('debit') ?? 'ferme',
    );
  }

  @override
  EtatLabo avancer(EtatLabo etat, double deltaS) {
    final suivant = super.avancer(etat, deltaS);
    final debit = etat.texte('debit') ?? 'ferme';
    if (debit == 'ferme' ||
        !etat.materiel.containsKey('soude') ||
        !etat.materiel.containsKey('burette'))
      return suivant;
    final taux = debit == 'jet'
        ? parametres.debitJetMlParS
        : parametres.debitGouttesMlParS;
    final v0 = etat.nombre('volume_verse_ml') ?? 0.0;
    final v1 = (v0 + taux * deltaS).clamp(0.0, parametres.buretteMl);
    final jetProche =
        debit == 'jet' && v1 >= equivalenceMl - parametres.seuilProcheMl;
    return suivant.avecReglages({
      'volume_verse_ml': v1,
      if (jetProche || etat.drapeau('jet_pres_equivalence'))
        'jet_pres_equivalence': true,
    });
  }

  @override
  bool condition(String id, EtatLabo e) => throw ArgumentError.value(
    id,
    'exige',
    'aucune condition pour ${definition.id}',
  );

  @override
  bool conseilActif(String quand, EtatLabo e) {
    final v = e.nombre('volume_verse_ml') ?? 0.0, ve = equivalenceMl;
    switch (quand) {
      case 'volume_proche_equivalence':
        return (e.nombre('volume_acide_ml') ?? 0) > 0 &&
            v >= ve - parametres.seuilProcheMl &&
            v < ve + parametres.toleranceDepassementMl &&
            e.texte('debit') == 'jet';
      case 'equivalence_atteinte':
        final ph = _ph(e);
        return ph != null &&
            ph >= parametres.phVirage &&
            v <= ve + parametres.toleranceDepassementMl;
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
    switch (action) {
      case 'verser':
        final s = texteRequis(v, 'solution');
        if (s != 'acide' && s != 'phenolphtaleine')
          throw ArgumentError.value(s, 'solution', 'acide ou phenolphtaleine');
        if (!e.materiel.containsKey('erlenmeyer'))
          throw ArgumentError('Place d\'abord l\'erlenmeyer.');
        final vol = nombreRequis(v, 'volume_ml');
        if (vol <= 0)
          throw ArgumentError.value(vol, 'volume_ml', 'positif attendu');
        return s == 'acide'
            ? e.avecReglage(
                'volume_acide_ml',
                (e.nombre('volume_acide_ml') ?? 0) + vol,
              )
            : e.avecMateriel('phenolphtaleine', 'erlenmeyer');
      case 'tourner_robinet':
        final d = texteRequis(v, 'debit');
        if (!debits.contains(d))
          throw ArgumentError.value(d, 'debit', '$debits');
        if (!e.materiel.containsKey('burette'))
          throw ArgumentError('Place d\'abord la burette.');
        return e.avecReglage('debit', d);
    }
    throw ArgumentError.value(action, 'action', 'inconnue');
  }

  @override
  Mesure evaluerMesure(EtatLabo e, String g, Object saisie, String unite) {
    if (saisie is! num)
      throw ArgumentError.value(saisie, 'valeur', 'nombre attendu');
    final vb = e.nombre('volume_verse_ml') ?? 0.0;
    final reelle = g == 'volume_equivalent_ml'
        ? vb
        : concentrationAcideMolL(
            cbMolL: parametres.cbMolL,
            vbMl: vb,
            vaMl: e.nombre('volume_acide_ml') ?? parametres.vaMl,
          );
    return Mesure(
      grandeurId: g,
      saisie: saisie,
      unite: unite,
      reelle: reelle,
      contexte: {
        'tolerance': g == 'volume_equivalent_ml'
            ? parametres.toleranceLectureMl
            : 0.005,
        'mauvaiseUnite': g == 'concentration_mol_l' && unite != 'mol/L',
      },
    );
  }

  @override
  List<String> erreursBilan(EtatLabo e) {
    final c = <String>[];
    void a(String x) {
      if (!c.contains(x)) c.add(x);
    }

    final va = e.nombre('volume_acide_ml') ?? 0.0;
    if (va > 0 &&
        (va - parametres.vaMl).abs() > parametres.toleranceVolumeAcideMl)
      a('erreur_volume_acide');
    if (e.blocages.isNotEmpty && e.blocages.contains('lunettes_avant_soude'))
      a('lunettes_oubliees');
    if (e.drapeau('jet_pres_equivalence')) a('debit_trop_rapide');
    if ((e.nombre('volume_verse_ml') ?? 0) >
        equivalenceMl + parametres.toleranceDepassementMl)
      a('depassement_equivalence');
    for (final m in e.mesures) {
      if (m.contexte['mauvaiseUnite'] == true) a('unite_concentration');
      final r = m.reelle, s = m.saisie;
      if (r != null &&
          s is num &&
          (s - r).abs() > (m.contexte['tolerance'] as double))
        a(
          m.grandeurId == 'volume_equivalent_ml'
              ? 'lecture_burette'
              : 'calcul_concentration',
        );
    }
    return c;
  }

  @override
  Map<String, Object?> resultat(EtatLabo e) => {
    for (final m in e.dernieresMesures.values) m.grandeurId: m.saisie,
  };
}
