import 'dart:math' as math;

import 'validation.dart';

// Toutes les longueurs sont en centimètres. Les distances algébriques suivent la fiche de TP :
// OA est négative (objet réel à gauche de la lentille), OA' est positive pour une image réelle.

/// Méthode de Bilbermann (autocollimation) : f' = |OA| quand l'image revient nette,
/// de même taille, dans le plan de l'objet.
double foyerBilbermannCm({
  required double positionObjetCm,
  required double positionLentilleCm,
}) {
  final f = (positionLentilleCm - positionObjetCm).abs();
  exigerPositif('distance entre l\'objet et la lentille', f);
  return f;
}

/// Méthode de Bessel : f' = (D² - d²) / (4D).
/// D = distance objet-écran, d = distance entre les deux positions de la lentille.
double foyerBesselCm({
  required double distanceObjetEcranCm,
  required double ecartPositionsCm,
}) {
  exigerPositif('distanceObjetEcranCm', distanceObjetEcranCm);
  exigerPositifOuNul('ecartPositionsCm', ecartPositionsCm);
  if (ecartPositionsCm >= distanceObjetEcranCm) {
    throw ArgumentError(
        'ecartPositionsCm doit être plus petit que distanceObjetEcranCm.');
  }
  final d = distanceObjetEcranCm;
  final e = ecartPositionsCm;
  return (d * d - e * e) / (4 * d);
}

/// Les deux positions de la lentille (mesurées depuis l'objet) qui donnent une image nette
/// sur l'écran dans la méthode de Bessel.
class PositionsBessel {
  const PositionsBessel({required this.l1Cm, required this.l2Cm});

  /// Première position : image agrandie.
  final double l1Cm;

  /// Seconde position : image réduite.
  final double l2Cm;

  /// d = distance entre les deux positions.
  double get ecartCm => l2Cm - l1Cm;
}

/// Renvoie null si D < 4f' : il n'existe alors aucune position qui donne une image nette.
/// Si D = 4f', les deux positions se confondent (d = 0).
PositionsBessel? positionsBessel({
  required double distanceObjetEcranCm,
  required double fPrimeCm,
}) {
  exigerPositif('distanceObjetEcranCm', distanceObjetEcranCm);
  exigerPositif('fPrimeCm', fPrimeCm);
  final d = distanceObjetEcranCm;
  final discriminant = d * d - 4 * d * fPrimeCm;
  if (discriminant < 0) return null;
  final racine = math.sqrt(discriminant);
  return PositionsBessel(l1Cm: (d - racine) / 2, l2Cm: (d + racine) / 2);
}

/// Relation de Descartes : 1/OA' - 1/OA = 1/f'. Renvoie OA'.
/// Renvoie null si l'objet est dans le plan focal objet (image à l'infini).
/// Un résultat négatif est une image virtuelle (objet entre le foyer et la lentille).
double? positionImageCm({required double oaCm, required double fPrimeCm}) {
  exigerPositif('fPrimeCm', fPrimeCm);
  if (!(oaCm < 0)) {
    throw ArgumentError.value(
        oaCm, 'oaCm', 'doit être négatif (objet réel devant la lentille)');
  }
  final inverse = 1 / oaCm + 1 / fPrimeCm;
  if (inverse.abs() < 1e-12) return null;
  return 1 / inverse;
}

/// f' = 1 / (1/OA' - 1/OA), pour une paire (OA, OA') mesurée.
double foyerDescartesCm({required double oaCm, required double oaPrimeCm}) {
  exigerNonNul('oaCm', oaCm);
  exigerNonNul('oaPrimeCm', oaPrimeCm);
  final difference = 1 / oaPrimeCm - 1 / oaCm;
  exigerNonNul('1/OA\' - 1/OA', difference);
  return 1 / difference;
}

/// Grandissement transversal : γ = OA' / OA.
double grandissement({required double oaCm, required double oaPrimeCm}) {
  exigerNonNul('oaCm', oaCm);
  return oaPrimeCm / oaCm;
}

/// Vergence en dioptries : V = 1 / f' avec f' en mètres.
double vergenceDioptries({required double fPrimeCm}) {
  exigerPositif('fPrimeCm', fPrimeCm);
  return 100 / fPrimeCm;
}
