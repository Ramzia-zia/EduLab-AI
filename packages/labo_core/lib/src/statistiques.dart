import 'dart:math' as math;

import 'validation.dart';

/// Moyenne arithmétique.
double moyenne(List<double> valeurs) {
  if (valeurs.isEmpty) throw ArgumentError('Il faut au moins une valeur.');
  var somme = 0.0;
  for (final v in valeurs) {
    somme += v;
  }
  return somme / valeurs.length;
}

/// Écart-type d'échantillon (division par n - 1). Il faut au moins 2 valeurs.
/// Le choix n - 1 est celui de la touche σn-1 des calculatrices : à valider par le professeur.
double ecartTypeEchantillon(List<double> valeurs) {
  if (valeurs.length < 2) throw ArgumentError('Il faut au moins deux valeurs.');
  final m = moyenne(valeurs);
  var somme = 0.0;
  for (final v in valeurs) {
    somme += (v - m) * (v - m);
  }
  return math.sqrt(somme / (valeurs.length - 1));
}

/// Écart relatif |mesure - référence| / |référence|, en fraction (0,05 = 5 %).
double ecartRelatif({required double mesure, required double reference}) {
  exigerNonNul('reference', reference);
  return (mesure - reference).abs() / reference.abs();
}
