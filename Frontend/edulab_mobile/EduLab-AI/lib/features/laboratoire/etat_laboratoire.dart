// État du laboratoire (dosage). Aucune formule : tout calcul passe par SessionTitrage (labo_core).
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/fournisseurs.dart';
import '../../core/labo/moteur.dart';
import '../experiences/etat_experiences.dart';
import '../horsligne/etat_sync.dart';
import 'definition.dart';

/// Niveaux du robinet : 0 fermé, 1 jet (contrat). La valeur « goutte à goutte »
/// n'est pas définie dans le contrat : 0,2 est une hypothèse à confirmer.
abstract final class NiveauxRobinet {
  static const ferme = 0.0;
  static const goutte = 0.2;
  static const jet = 1.0;
}

/// Hypothèses à confirmer dans le contrat (chapitre 5) :
/// ouvrir le robinet correspond à l'étape « verser_soude » des règles de sécurité,
/// et la solution versée du dosage est la soude.
const _etapesRobinet = {'tourner_robinet', 'verser_soude'};
const _solutionTitrage = 'soude';

class PointCourbe {
  const PointCourbe(this.tempsS, this.ph);
  final double tempsS;
  final double ph;
}

const _inchange = Object();

class EtatLaboratoire {
  const EtatLaboratoire({
    this.indisponible,
    this.materielPlace = const {},
    this.niveauRobinet = NiveauxRobinet.ferme,
    this.volumeVerseMl = 0,
    this.tempsS = 0,
    this.ph = 0,
    this.volumeMaxMl = 1,
    this.courbe = const [],
    this.blocage,
    this.exigeManquant,
    this.conseil,
    this.reponseAssistant,
    this.niveauIndice = 0,
    this.assistantEnCours = false,
    this.erreurAssistant,
    this.tentativeId,
    this.termine = false,
  });

  /// Message affiché à la place du laboratoire (simulation non branchée, expérience non gérée).
  final String? indisponible;
  final Set<String> materielPlace;
  final double niveauRobinet;
  final double volumeVerseMl;
  final double tempsS;
  final double ph;
  final double volumeMaxMl;
  final List<PointCourbe> courbe;
  final String? blocage;
  final String? exigeManquant;
  final String? conseil;
  final String? reponseAssistant;
  final int niveauIndice;
  final bool assistantEnCours;
  final String? erreurAssistant;
  final String? tentativeId;
  final bool termine;

  EtatLaboratoire copyWith({
    Set<String>? materielPlace,
    double? niveauRobinet,
    double? volumeVerseMl,
    double? tempsS,
    double? ph,
    List<PointCourbe>? courbe,
    Object? blocage = _inchange,
    Object? exigeManquant = _inchange,
    Object? conseil = _inchange,
    Object? reponseAssistant = _inchange,
    int? niveauIndice,
    bool? assistantEnCours,
    Object? erreurAssistant = _inchange,
    String? tentativeId,
    bool? termine,
  }) =>
      EtatLaboratoire(
        indisponible: indisponible,
        materielPlace: materielPlace ?? this.materielPlace,
        niveauRobinet: niveauRobinet ?? this.niveauRobinet,
        volumeVerseMl: volumeVerseMl ?? this.volumeVerseMl,
        tempsS: tempsS ?? this.tempsS,
        ph: ph ?? this.ph,
        volumeMaxMl: volumeMaxMl,
        courbe: courbe ?? this.courbe,
        blocage: identical(blocage, _inchange) ? this.blocage : blocage as String?,
        exigeManquant: identical(exigeManquant, _inchange)
            ? this.exigeManquant
            : exigeManquant as String?,
        conseil: identical(conseil, _inchange) ? this.conseil : conseil as String?,
        reponseAssistant: identical(reponseAssistant, _inchange)
            ? this.reponseAssistant
            : reponseAssistant as String?,
        niveauIndice: niveauIndice ?? this.niveauIndice,
        assistantEnCours: assistantEnCours ?? this.assistantEnCours,
        erreurAssistant: identical(erreurAssistant, _inchange)
            ? this.erreurAssistant
            : erreurAssistant as String?,
        tentativeId: tentativeId ?? this.tentativeId,
        termine: termine ?? this.termine,
      );
}

final laboratoireProvider = NotifierProvider.autoDispose
    .family<LaboratoireNotifier, EtatLaboratoire, String>(
  LaboratoireNotifier.new,
);

class LaboratoireNotifier
    extends AutoDisposeFamilyNotifier<EtatLaboratoire, String> {
  static const _uuid = Uuid();
  static const _intervallePointS = 0.25;
  static const _niveauMax = 3;

  late DefinitionExperience _definition;
  late int _versionExperience;
  SessionTitrage? _session;
  Future<void> _file = Future.value();
  int _rang = 0;
  double _depuisDernierPointS = 0;
  double _volumeDepuisOuvertureMl = 0;
  final List<MessageAssistant> _historique = [];

  @override
  EtatLaboratoire build(String arg) {
    final pack = ref.read(packProvider(arg)).requireValue;
    _definition = DefinitionExperience.depuisJson(pack.definition);
    _versionExperience = pack.version;

    if (_definition.calcul != 'titrage') {
      return const EtatLaboratoire(
        indisponible:
            'Cette expérience n\'est pas encore disponible sur le téléphone.',
      );
    }
    try {
      _session = ref.read(moteurTitrageProvider).demarrer();
    } on MoteurIndisponible catch (e) {
      return EtatLaboratoire(indisponible: e.message);
    }
    final ph0 = _session!.ph(0);
    return EtatLaboratoire(
      ph: ph0,
      volumeMaxMl: _session!.volumeMaxMl,
      courbe: [PointCourbe(0, ph0)],
    );
  }

  // ---- journal des actions (événements non modifiables) -------------------

  void _enfiler(Future<void> Function() tache) {
    _file = _file.then((_) => tache());
  }

  Future<String> _assurerTentative() async {
    final existant = state.tentativeId;
    if (existant != null) return existant;
    final id = _uuid.v4();
    state = state.copyWith(tentativeId: id);
    await ref.read(depotLocalProvider).creerTentative(Tentative(
          id: id,
          experienceId: arg,
          versionExperience: _versionExperience,
          debut: DateTime.now().toUtc(),
          statut: 'en_cours',
        ));
    _rang = 0;
    return id;
  }

  void _evenement(String action, Map<String, dynamic> valeurs) {
    final horodatage = DateTime.now().toUtc();
    _enfiler(() async {
      final tentativeId = await _assurerTentative();
      _rang += 1;
      await ref.read(depotLocalProvider).ajouterEvenement(EvenementTentative(
            id: _uuid.v4(),
            tentativeId: tentativeId,
            rang: _rang,
            horodatage: horodatage,
            action: action,
            valeurs: valeurs,
          ));
    });
  }

  // ---- actions de l'élève -------------------------------------------------

  void placerMateriel(String id) {
    if (state.termine || state.materielPlace.contains(id)) return;
    state = state.copyWith(
      materielPlace: {...state.materielPlace, id},
      blocage: state.exigeManquant == id ? null : state.blocage,
      exigeManquant: state.exigeManquant == id ? null : state.exigeManquant,
    );
    _evenement('placer_materiel', {'materiel_id': id});
  }

  void choisirRobinet(double niveau) {
    if (state.termine || _session == null) return;
    if (niveau > 0) {
      for (final r in _definition.securite) {
        if (_etapesRobinet.contains(r.avant) &&
            !state.materielPlace.contains(r.exige)) {
          state = state.copyWith(blocage: r.message, exigeManquant: r.exige);
          _evenement('action_bloquee', {'regle_id': r.regleId});
          return;
        }
      }
    }
    if (niveau == 0 && _volumeDepuisOuvertureMl > 0) {
      _evenement('verser',
          {'solution': _solutionTitrage, 'volume_ml': _volumeDepuisOuvertureMl});
      _volumeDepuisOuvertureMl = 0;
    }
    state = state.copyWith(
        niveauRobinet: niveau, blocage: null, exigeManquant: null);
    _evenement('tourner_robinet', {'niveau': niveau});
  }

  /// Appelé à chaque image par un Ticker, seulement quand le robinet est ouvert.
  void avancer(double dtS) {
    final session = _session;
    if (session == null || state.termine || state.niveauRobinet == 0) return;

    final max = session.volumeMaxMl;
    var volume = state.volumeVerseMl +
        session.debitMlParS(state.niveauRobinet) * dtS;
    var niveau = state.niveauRobinet;
    var ajoute = volume - state.volumeVerseMl;
    if (volume >= max) {
      ajoute -= volume - max;
      volume = max;
      niveau = NiveauxRobinet.ferme;
    }
    _volumeDepuisOuvertureMl += ajoute;
    final temps = state.tempsS + dtS;
    final ph = session.ph(volume);

    var courbe = state.courbe;
    _depuisDernierPointS += dtS;
    if (_depuisDernierPointS >= _intervallePointS) {
      _depuisDernierPointS = 0;
      courbe = [...courbe, PointCourbe(temps, ph)];
    }

    final proche = session.procheEquivalence(volume);
    final conseil = proche
        ? _definition.conseils
            .where((c) => c.quand == 'volume_proche_equivalence')
            .map((c) => c.message)
            .firstOrNull
        : null;

    state = state.copyWith(
      volumeVerseMl: volume,
      tempsS: temps,
      ph: ph,
      courbe: courbe,
      niveauRobinet: niveau,
      conseil: conseil ?? state.conseil,
    );
    if (niveau == NiveauxRobinet.ferme) {
      _evenement('verser',
          {'solution': _solutionTitrage, 'volume_ml': _volumeDepuisOuvertureMl});
      _volumeDepuisOuvertureMl = 0;
    }
  }

  /// Termine la tentative et retourne son identifiant (pour l'écran résultat).
  Future<String?> terminer() async {
    final session = _session;
    if (session == null || state.termine) return state.tentativeId;
    if (state.niveauRobinet > 0) choisirRobinet(NiveauxRobinet.ferme);
    _evenement('terminer', const {});
    final resultat = {
      'volume_equivalent_ml': session.volumeEquivalentMl,
      'volume_verse_ml': state.volumeVerseMl,
    };
    state = state.copyWith(termine: true);
    late String id;
    _enfiler(() async {
      id = await _assurerTentative();
      // Le score n'est pas défini dans le contrat : laissé vide.
      await ref.read(depotLocalProvider).terminerTentative(
            id: id,
            fin: DateTime.now().toUtc(),
            statut: 'terminee',
            resultat: resultat,
          );
    });
    await _file;
    ref.read(synchroniserProvider)();
    return id;
  }

  // ---- assistant (route /assistant uniquement) ------------------------------

  Future<void> demanderIndice() async {
    if (state.assistantEnCours || state.niveauIndice >= _niveauMax) return;
    final niveau = state.niveauIndice + 1;
    const message = 'J\'ai besoin d\'un indice.';
    state = state.copyWith(assistantEnCours: true, erreurAssistant: null);
    try {
      await _file;
      final tentativeId = await _assurerTentative();
      final reponse = await ref.read(apiProvider).assistant(AssistantDemande(
            experienceId: arg,
            tentativeId: tentativeId,
            niveauIndice: niveau,
            message: message,
            historique: List.of(_historique),
            etatExperience: {'volume_verse_ml': state.volumeVerseMl},
          ));
      _historique
        ..add(const MessageAssistant(role: 'eleve', contenu: message))
        ..add(MessageAssistant(role: 'assistant', contenu: reponse.reponse));
      while (_historique.length > 6) {
        _historique.removeAt(0);
      }
      state = state.copyWith(
        assistantEnCours: false,
        reponseAssistant: reponse.reponse,
        niveauIndice: niveau,
      );
    } on ErreurReseau {
      state = state.copyWith(
        assistantEnCours: false,
        erreurAssistant:
            'Pas de réseau : seuls les conseils du laboratoire sont disponibles.',
      );
    } on ErreurApi catch (e) {
      state = state.copyWith(assistantEnCours: false, erreurAssistant: e.message);
    }
  }
}
