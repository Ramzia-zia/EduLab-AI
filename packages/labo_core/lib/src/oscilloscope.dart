import 'dart:math' as math;

import 'validation.dart';

// Sensibilité verticale en V par division, base de temps en s par division
// (5 ms/div = 0.005 s/div dans les données ; l'affichage convertit).

/// Tension continue : U = Sv x y.
double tensionContinueDepuisDeviationV({
  required double sensibiliteVParDiv,
  required double deviationDiv,
}) {
  exigerPositif('sensibiliteVParDiv', sensibiliteVParDiv);
  return sensibiliteVParDiv * deviationDiv;
}

/// Déviation (en divisions) d'une trace pour une tension donnée : y = U / Sv.
double deviationDepuisTensionDiv({
  required double tensionV,
  required double sensibiliteVParDiv,
}) {
  exigerPositif('sensibiliteVParDiv', sensibiliteVParDiv);
  return tensionV / sensibiliteVParDiv;
}

/// Vrai si la trace reste dans l'écran. [demiHauteurEcranDiv] est le nombre de divisions
/// entre la ligne de référence et le bord de l'écran (donnée de la définition de l'appareil).
bool traceVisible(
    {required double deviationDiv, required double demiHauteurEcranDiv}) {
  exigerPositif('demiHauteurEcranDiv', demiHauteurEcranDiv);
  return deviationDiv.abs() <= demiHauteurEcranDiv;
}

/// Période : T = n x Sb.
double periodeDepuisDivisionsS({
  required double divisionsParPeriode,
  required double baseTempsSParDiv,
}) {
  exigerPositif('divisionsParPeriode', divisionsParPeriode);
  exigerPositif('baseTempsSParDiv', baseTempsSParDiv);
  return divisionsParPeriode * baseTempsSParDiv;
}

/// Fréquence : f = 1 / T.
double frequenceDepuisPeriodeHz({required double periodeS}) {
  exigerPositif('periodeS', periodeS);
  return 1 / periodeS;
}

/// Valeur maximale : Um = Sv x ym.
double valeurMaximaleDepuisDivisionsV({
  required double sensibiliteVParDiv,
  required double divisionsSommet,
}) {
  exigerPositif('sensibiliteVParDiv', sensibiliteVParDiv);
  exigerPositif('divisionsSommet', divisionsSommet);
  return sensibiliteVParDiv * divisionsSommet;
}

/// Valeur efficace d'une tension sinusoïdale : Ueff = Um / √2.
double valeurEfficaceDepuisMaximaleV({required double valeurMaximaleV}) {
  exigerPositif('valeurMaximaleV', valeurMaximaleV);
  return valeurMaximaleV / math.sqrt2;
}

/// Nombre de divisions occupées par une période : n = 1 / (f x Sb).
/// Doubler la fréquence divise n par 2 (question Q4 de la fiche).
double divisionsParPeriode(
    {required double frequenceHz, required double baseTempsSParDiv}) {
  exigerPositif('frequenceHz', frequenceHz);
  exigerPositif('baseTempsSParDiv', baseTempsSParDiv);
  return 1 / (frequenceHz * baseTempsSParDiv);
}

/// Tension sinusoïdale du GBF à l'instant [tempsS] : u = Um x sin(2π f t).
/// Le temps est un paramètre, jamais l'horloge de l'appareil.
double tensionSinusoidaleV({
  required double valeurMaximaleV,
  required double frequenceHz,
  required double tempsS,
}) {
  exigerPositifOuNul('valeurMaximaleV', valeurMaximaleV);
  exigerPositif('frequenceHz', frequenceHz);
  return valeurMaximaleV * math.sin(2 * math.pi * frequenceHz * tempsS);
}
