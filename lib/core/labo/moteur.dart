// Point de branchement du paquet labo_core. AUCUNE formule scientifique ici.
// Les interfaces ci-dessous sont une PROPOSITION d'API pour labo_core (à valider
// avec la personne des simulations) ; l'adaptateur réel s'écrit à un seul endroit.
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Une manipulation de dosage en cours. Les valeurs cachées (concentrations,
/// volume de la prise d'essai) restent à l'intérieur de labo_core.
abstract interface class SessionTitrage {
  double get volumeEquivalentMl;
  double get volumeMaxMl;
  double debitMlParS(double niveauRobinet);
  double ph(double volumeVerseMl);
  bool procheEquivalence(double volumeVerseMl);
}

abstract interface class MoteurTitrage {
  SessionTitrage demarrer();
}

class MoteurIndisponible implements Exception {
  const MoteurIndisponible([this.message = 'La simulation n\'est pas encore branchée.']);
  final String message;
}

/// Valeur par défaut tant que labo_core n'est pas branché : le laboratoire
/// affiche alors un état d'erreur lisible au lieu d'inventer un calcul.
class MoteurNonBranche implements MoteurTitrage {
  const MoteurNonBranche();

  @override
  SessionTitrage demarrer() => throw const MoteurIndisponible();
}

final moteurTitrageProvider =
    Provider<MoteurTitrage>((ref) => const MoteurNonBranche());
