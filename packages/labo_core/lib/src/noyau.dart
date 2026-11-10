import 'validation.dart';

// ---------------------------------------------------------------------------
// Noyau commun à tous les laboratoires : événements, état, définitions, moteur.
// Dart pur : pas d'horloge cachée (l'horodatage est un paramètre), pas de hasard,
// pas de génération d'identifiants (l'application ajoute `id` et `tentative_id`).
// ---------------------------------------------------------------------------

String _iso(DateTime t) =>
    t.toUtc().toIso8601String().replaceFirst(RegExp(r'\.0+Z$'), 'Z');

/// Un événement du journal d'une tentative (chapitre 2 du contrat : evenement_tentative).
/// Le téléphone ajoute `id` et `tentative_id` avec [toJsonAvecIds].
class Evenement {
  const Evenement({
    required this.rang,
    required this.horodatageUtc,
    required this.action,
    required this.valeurs,
  });

  final int rang;
  final DateTime horodatageUtc;
  final String action;
  final Map<String, Object?> valeurs;

  Map<String, Object?> toJson() => {
        'rang': rang,
        'horodatage': _iso(horodatageUtc),
        'action': action,
        'valeurs': valeurs,
      };

  Map<String, Object?> toJsonAvecIds(
          {required String id, required String tentativeId}) =>
      {'id': id, 'tentative_id': tentativeId, ...toJson()};
}

enum NiveauConseil { information, avertissement, validation }

NiveauConseil niveauConseilDepuisTexte(String texte) {
  for (final n in NiveauConseil.values) {
    if (n.name == texte) return n;
  }
  throw ArgumentError.value(
      texte, 'niveau', 'attendu : information, avertissement ou validation');
}

/// Un conseil de l'assistant, déclenché par l'état de l'expérience (jamais par un minuteur).
class Conseil {
  const Conseil(
      {required this.quand, required this.niveau, required this.message});
  final String quand;
  final NiveauConseil niveau;
  final String message;
}

/// Une règle de sécurité : [avant] cette action, il faut [exige] (un matériel placé
/// ou une condition nommée). Sinon l'action est bloquée avec [message].
class RegleSecurite {
  const RegleSecurite({
    required this.regleId,
    required this.avant,
    required this.exige,
    required this.message,
  });
  final String regleId;
  final String avant;
  final String exige;
  final String message;
}

/// Le fichier de définition d'une expérience (chapitre 6 du contrat).
class DefinitionExperience {
  const DefinitionExperience({
    required this.id,
    required this.matiere,
    required this.niveau,
    required this.materiel,
    required this.securite,
    required this.conseils,
    required this.calcul,
  });

  final String id;
  final String matiere;
  final String niveau;
  final List<String> materiel;
  final List<RegleSecurite> securite;
  final List<Conseil> conseils;
  final String calcul;

  static const _champs = {
    'id',
    'matiere',
    'niveau',
    'materiel',
    'securite',
    'conseils',
    'calcul'
  };

  factory DefinitionExperience.fromJson(Map<String, dynamic> j) {
    if (j.length != _champs.length || !j.keys.toSet().containsAll(_champs)) {
      throw ArgumentError(
          'Définition invalide : les champs attendus sont $_champs.');
    }
    return DefinitionExperience(
      id: j['id'] as String,
      matiere: j['matiere'] as String,
      niveau: j['niveau'] as String,
      materiel: (j['materiel'] as List).cast<String>(),
      securite: [
        for (final r in (j['securite'] as List).cast<Map<String, dynamic>>())
          RegleSecurite(
            regleId: r['regle_id'] as String,
            avant: r['avant'] as String,
            exige: r['exige'] as String,
            message: r['message'] as String,
          ),
      ],
      conseils: [
        for (final c in (j['conseils'] as List).cast<Map<String, dynamic>>())
          Conseil(
            quand: c['quand'] as String,
            niveau: niveauConseilDepuisTexte(c['niveau'] as String),
            message: c['message'] as String,
          ),
      ],
      calcul: j['calcul'] as String,
    );
  }
}

/// Une mesure notée par l'élève (action `mesurer`), avec la valeur réelle au moment de la saisie.
class Mesure {
  const Mesure({
    required this.grandeurId,
    required this.saisie,
    required this.unite,
    required this.reelle,
    required this.contexte,
  });

  final String grandeurId;

  /// Ce que l'élève a écrit : un nombre ou un texte (ex. « anode »).
  final Object saisie;
  final String unite;

  /// La valeur physique exacte au moment de la saisie (null si elle n'a pas de sens).
  final double? reelle;

  /// Informations utiles au bilan (aiguille hors échelle, image nette...).
  final Map<String, Object?> contexte;
}

/// État immuable d'une expérience. Chaque action produit un nouvel état.
/// Les clés de [reglages] sont décrites dans le skill de chaque expérience.
class EtatLabo {
  const EtatLabo({
    this.rang = 1,
    this.materiel = const {},
    this.reglages = const {},
    this.mesures = const [],
    this.blocages = const [],
    this.tempsS = 0.0,
    this.termine = false,
  });

  /// Rang du prochain événement (commence à 1).
  final int rang;

  /// Matériel placé : identifiant -> emplacement (null si placé sans emplacement).
  final Map<String, String?> materiel;
  final Map<String, Object> reglages;
  final List<Mesure> mesures;

  /// Identifiants des règles de sécurité déclenchées, dans l'ordre.
  final List<String> blocages;

  /// Temps écoulé dans l'expérience, en secondes (fourni par l'application).
  final double tempsS;
  final bool termine;

  EtatLabo copie({
    int? rang,
    Map<String, String?>? materiel,
    Map<String, Object>? reglages,
    List<Mesure>? mesures,
    List<String>? blocages,
    double? tempsS,
    bool? termine,
  }) =>
      EtatLabo(
        rang: rang ?? this.rang,
        materiel: materiel == null ? this.materiel : Map.unmodifiable(materiel),
        reglages: reglages == null ? this.reglages : Map.unmodifiable(reglages),
        mesures: mesures == null ? this.mesures : List.unmodifiable(mesures),
        blocages:
            blocages == null ? this.blocages : List.unmodifiable(blocages),
        tempsS: tempsS ?? this.tempsS,
        termine: termine ?? this.termine,
      );

  EtatLabo avecMateriel(String id, String? emplacement) =>
      copie(materiel: {...materiel, id: emplacement});

  EtatLabo avecReglage(String cle, Object valeur) =>
      copie(reglages: {...reglages, cle: valeur});

  EtatLabo avecReglages(Map<String, Object> autres) =>
      copie(reglages: {...reglages, ...autres});

  EtatLabo avecMesure(Mesure m) => copie(mesures: [...mesures, m]);

  EtatLabo avecBlocage(String regleId) =>
      copie(blocages: [...blocages, regleId]);

  double? nombre(String cle) {
    final v = reglages[cle];
    return v is num ? v.toDouble() : null;
  }

  bool drapeau(String cle) => reglages[cle] == true;

  String? texte(String cle) {
    final v = reglages[cle];
    return v is String ? v : null;
  }

  /// Dernière mesure notée pour chaque grandeur.
  Map<String, Mesure> get dernieresMesures =>
      {for (final m in mesures) m.grandeurId: m};
}

/// Ce que renvoie [Laboratoire.appliquer].
class ResultatAction {
  const ResultatAction({
    required this.etat,
    required this.evenement,
    required this.bloquee,
    this.message,
  });

  final EtatLabo etat;

  /// L'événement à enregistrer (`action_bloquee` si la sécurité a bloqué l'action).
  final Evenement evenement;
  final bool bloquee;

  /// Explication courte à afficher à l'élève quand l'action est bloquée.
  final String? message;
}

String texteRequis(Map<String, Object?> valeurs, String cle) {
  final v = valeurs[cle];
  if (v is! String || v.isEmpty)
    throw ArgumentError.value(v, cle, 'texte attendu');
  return v;
}

double nombreRequis(Map<String, Object?> valeurs, String cle) {
  final v = valeurs[cle];
  if (v is! num || v.isNaN || v.isInfinite)
    throw ArgumentError.value(v, cle, 'nombre attendu');
  return v.toDouble();
}

bool _dans(Iterable<double> liste, double v) =>
    liste.any((x) => (x - v).abs() < 1e-12);

/// Vérifie qu'un nombre fait partie d'une liste de valeurs permises.
double nombrePermis(
    Map<String, Object?> valeurs, String cle, Iterable<double> permises) {
  final v = nombreRequis(valeurs, cle);
  if (!_dans(permises, v)) {
    throw ArgumentError.value(
        v, cle, 'valeur non proposée par l\'appareil ($permises)');
  }
  return v;
}

/// Un laboratoire : applique les actions de l'élève sur un [EtatLabo] immuable.
/// Fonctions pures : mêmes entrées, mêmes sorties.
abstract class Laboratoire {
  Laboratoire(this.definition);

  final DefinitionExperience definition;

  /// Actions que ce laboratoire accepte (chapitre 5 du contrat).
  Set<String> get actions;

  /// Identifiants de grandeurs acceptés par `mesurer`.
  Set<String> get grandeursMesurables;

  /// Emplacements permis par matériel. Un matériel absent de la table n'a pas d'emplacement.
  Map<String, Set<String>> get emplacementsAutorises => const {};

  EtatLabo etatInitial();

  /// Condition nommée (valeur possible de `exige` dans une règle de sécurité).
  bool condition(String id, EtatLabo etat);

  /// Condition nommée d'un conseil (valeur de `quand`).
  bool conseilActif(String quand, EtatLabo etat);

  /// Actions propres à l'expérience (tout sauf placer_materiel, mesurer, terminer).
  EtatLabo transitionSpecifique(
      EtatLabo etat, String action, Map<String, Object?> valeurs);

  Mesure evaluerMesure(
      EtatLabo etat, String grandeurId, Object saisie, String unite);

  /// Codes d'erreur du bilan (chapitre 5 du contrat), sans doublon, dans l'ordre de détection.
  List<String> erreursBilan(EtatLabo etat);

  /// Contenu de `tentative.resultat`.
  Map<String, Object?> resultat(EtatLabo etat);

  /// Fait passer le temps. Le temps vient toujours d'un paramètre.
  EtatLabo avancer(EtatLabo etat, double deltaS) {
    exigerPositifOuNul('deltaS', deltaS);
    return etat.copie(tempsS: etat.tempsS + deltaS);
  }

  /// Appelé avant de placer du matériel : lève une erreur si le montage ne peut pas être modifié.
  void verifierMontageModifiable(EtatLabo etat) {}

  /// Place du matériel (peut être surchargé pour des réglages par défaut).
  EtatLabo placerMateriel(
          EtatLabo etat, String materielId, String? emplacementId) =>
      etat.avecMateriel(materielId, emplacementId);

  /// Les conseils dont la condition est vraie dans cet état.
  List<Conseil> conseilsActifs(EtatLabo etat) => [
        for (final c in definition.conseils)
          if (conseilActif(c.quand, etat)) c,
      ];

  /// Applique une action de l'élève.
  /// - Action inconnue ou valeurs invalides : [ArgumentError] (erreur de programmation de l'interface).
  /// - Action interdite par une règle de sécurité : résultat `bloquee`, événement `action_bloquee`.
  ResultatAction appliquer(
    EtatLabo etat,
    String action,
    Map<String, Object?> valeurs,
    DateTime horodatageUtc,
  ) {
    if (etat.termine) throw StateError('L\'expérience est terminée.');
    if (!actions.contains(action)) {
      throw ArgumentError.value(
          action, 'action', 'inconnue pour ${definition.id}');
    }
    for (final r in definition.securite) {
      if (r.avant != action) continue;
      final ok = definition.materiel.contains(r.exige)
          ? etat.materiel.containsKey(r.exige)
          : condition(r.exige, etat);
      if (!ok) {
        return ResultatAction(
          etat: etat.avecBlocage(r.regleId).copie(rang: etat.rang + 1),
          evenement: Evenement(
            rang: etat.rang,
            horodatageUtc: horodatageUtc,
            action: 'action_bloquee',
            valeurs: {'regle_id': r.regleId},
          ),
          bloquee: true,
          message: r.message,
        );
      }
    }
    final suivant = _transition(etat, action, valeurs);
    return ResultatAction(
      etat: suivant.copie(rang: etat.rang + 1),
      evenement: Evenement(
        rang: etat.rang,
        horodatageUtc: horodatageUtc,
        action: action,
        valeurs: Map.unmodifiable(Map.of(valeurs)),
      ),
      bloquee: false,
    );
  }

  EtatLabo _transition(
      EtatLabo etat, String action, Map<String, Object?> valeurs) {
    switch (action) {
      case 'placer_materiel':
        final id = texteRequis(valeurs, 'materiel_id');
        if (!definition.materiel.contains(id)) {
          throw ArgumentError.value(
              id, 'materiel_id', 'matériel inconnu pour ${definition.id}');
        }
        final emp = valeurs['emplacement_id'];
        if (emp != null) {
          if (emp is! String ||
              !(emplacementsAutorises[id]?.contains(emp) ?? false)) {
            throw ArgumentError.value(
                emp, 'emplacement_id', 'emplacement non permis pour $id');
          }
        }
        verifierMontageModifiable(etat);
        return placerMateriel(etat, id, emp as String?);
      case 'mesurer':
        final g = texteRequis(valeurs, 'grandeur_id');
        if (!grandeursMesurables.contains(g)) {
          throw ArgumentError.value(
              g, 'grandeur_id', 'grandeur inconnue pour ${definition.id}');
        }
        final saisie = valeurs['valeur'];
        if (saisie is! num && saisie is! String) {
          throw ArgumentError.value(
              saisie, 'valeur', 'nombre ou texte attendu');
        }
        final unite = (valeurs['unite'] as String?) ?? '';
        return etat.avecMesure(evaluerMesure(etat, g, saisie!, unite));
      case 'terminer':
        return etat.copie(termine: true);
      default:
        return transitionSpecifique(etat, action, valeurs);
    }
  }
}
