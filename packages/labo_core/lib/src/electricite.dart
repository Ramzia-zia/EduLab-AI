import 'validation.dart';

// ---------------------------------------------------------------------------
// Résistances, loi d'Ohm
// ---------------------------------------------------------------------------

/// Résistance équivalente de résistors en série (ohms).
double resistanceSerieOhm(List<double> resistancesOhm) {
  if (resistancesOhm.isEmpty)
    throw ArgumentError('Il faut au moins un résistor.');
  var somme = 0.0;
  for (final r in resistancesOhm) {
    exigerPositif('resistanceOhm', r);
    somme += r;
  }
  return somme;
}

/// Résistance équivalente de résistors en dérivation (ohms).
double resistanceDerivationOhm(List<double> resistancesOhm) {
  if (resistancesOhm.isEmpty)
    throw ArgumentError('Il faut au moins un résistor.');
  var sommeInverses = 0.0;
  for (final r in resistancesOhm) {
    exigerPositif('resistanceOhm', r);
    sommeInverses += 1 / r;
  }
  return 1 / sommeInverses;
}

/// I = U / R (ampères).
double intensiteLoiOhmA(
    {required double tensionV, required double resistanceOhm}) {
  exigerPositifOuNul('tensionV', tensionV);
  exigerPositif('resistanceOhm', resistanceOhm);
  return tensionV / resistanceOhm;
}

/// U = R x I (volts).
double tensionLoiOhmV(
    {required double intensiteA, required double resistanceOhm}) {
  exigerPositifOuNul('intensiteA', intensiteA);
  exigerPositif('resistanceOhm', resistanceOhm);
  return intensiteA * resistanceOhm;
}

// ---------------------------------------------------------------------------
// Circuit en série : R1 et R2 (TP courant n°2 et n°3, TP tension n°1 et n°2)
// ---------------------------------------------------------------------------

/// Intensité dans un circuit série générateur + R1 + R2 (même valeur en tout point : loi d'unicité).
double intensiteSerieA({
  required double tensionGenerateurV,
  required double r1Ohm,
  required double r2Ohm,
}) {
  return intensiteLoiOhmA(
    tensionV: tensionGenerateurV,
    resistanceOhm: resistanceSerieOhm([r1Ohm, r2Ohm]),
  );
}

/// Tensions d'un circuit série (figure du TP tension n°2) : U_PA aux bornes de R1,
/// U_AN aux bornes de R2, U_PN aux bornes du générateur.
class TensionsSerie {
  const TensionsSerie(
      {required this.uPaV, required this.uAnV, required this.uPnV});
  final double uPaV;
  final double uAnV;
  final double uPnV;
}

TensionsSerie tensionsSerie({
  required double tensionGenerateurV,
  required double r1Ohm,
  required double r2Ohm,
}) {
  final i = intensiteSerieA(
      tensionGenerateurV: tensionGenerateurV, r1Ohm: r1Ohm, r2Ohm: r2Ohm);
  return TensionsSerie(
    uPaV: tensionLoiOhmV(intensiteA: i, resistanceOhm: r1Ohm),
    uAnV: tensionLoiOhmV(intensiteA: i, resistanceOhm: r2Ohm),
    uPnV: tensionGenerateurV,
  );
}

/// Potentiels quand le point N (borne -) est la masse (TP tension n°1, partie B).
class PotentielsSerie {
  const PotentielsSerie({
    required this.potentielPV,
    required this.potentielAV,
    required this.potentielNV,
  });
  final double potentielPV;
  final double potentielAV;
  final double potentielNV;
}

PotentielsSerie potentielsSerie({
  required double tensionGenerateurV,
  required double r1Ohm,
  required double r2Ohm,
}) {
  final t = tensionsSerie(
      tensionGenerateurV: tensionGenerateurV, r1Ohm: r1Ohm, r2Ohm: r2Ohm);
  return PotentielsSerie(
    potentielPV: t.uPnV,
    potentielAV: t.uAnV, // V_A = U_AN car V_N = 0
    potentielNV: 0.0,
  );
}

// ---------------------------------------------------------------------------
// Circuit en dérivation : R1 et R2 (TP courant n°3 partie B, TP tension n°2 partie B)
// ---------------------------------------------------------------------------

/// Courants du montage en dérivation : I0 (branche principale), I1 (R1), I2 (R2).
class CourantsDerivation {
  const CourantsDerivation(
      {required this.i0A, required this.i1A, required this.i2A});
  final double i0A;
  final double i1A;
  final double i2A;
}

CourantsDerivation courantsDerivation({
  required double tensionGenerateurV,
  required double r1Ohm,
  required double r2Ohm,
}) {
  final i1 =
      intensiteLoiOhmA(tensionV: tensionGenerateurV, resistanceOhm: r1Ohm);
  final i2 =
      intensiteLoiOhmA(tensionV: tensionGenerateurV, resistanceOhm: r2Ohm);
  return CourantsDerivation(i0A: i1 + i2, i1A: i1, i2A: i2);
}

/// Loi d'unicité de la tension en dérivation : U_PN = U1 = U2.
class TensionsDerivation {
  const TensionsDerivation(
      {required this.uPnV, required this.u1V, required this.u2V});
  final double uPnV;
  final double u1V;
  final double u2V;
}

TensionsDerivation tensionsDerivation({required double tensionGenerateurV}) {
  exigerPositifOuNul('tensionGenerateurV', tensionGenerateurV);
  return TensionsDerivation(
    uPnV: tensionGenerateurV,
    u1V: tensionGenerateurV,
    u2V: tensionGenerateurV,
  );
}

// ---------------------------------------------------------------------------
// Interrupteur et branchement du voltmètre
// ---------------------------------------------------------------------------

/// Tension aux bornes de l'interrupteur K d'un circuit série : toute la tension du
/// générateur si K est ouvert, zéro s'il est fermé.
double tensionInterrupteurV(
    {required bool ferme, required double tensionGenerateurV}) {
  exigerPositifOuNul('tensionGenerateurV', tensionGenerateurV);
  return ferme ? 0.0 : tensionGenerateurV;
}

/// Tension lue par un voltmètre : potentiel de la borne V moins potentiel de la borne COM.
/// Un résultat négatif correspond à un branchement inversé.
double tensionMesureeV({
  required double potentielBorneVV,
  required double potentielBorneComV,
}) {
  return potentielBorneVV - potentielBorneComV;
}

// ---------------------------------------------------------------------------
// Appareil à aiguille : lecture et incertitude (TP courant n°2)
// ---------------------------------------------------------------------------

/// Position de l'aiguille sur le cadran.
class LectureAiguille {
  const LectureAiguille({
    required this.divisions,
    required this.horsEchelle,
    required this.sensInverse,
  });

  /// Nombre de divisions lues (entre 0 et le nombre total de divisions).
  final double divisions;

  /// Vrai si la grandeur dépasse le calibre : l'aiguille bute en fin d'échelle.
  final bool horsEchelle;

  /// Vrai si la grandeur est négative (polarité inversée) : l'aiguille part à l'envers.
  final bool sensInverse;
}

LectureAiguille _lectureAiguille(
    double valeur, double calibre, double divisionsTotal) {
  exigerPositif('calibre', calibre);
  exigerPositif('divisionsTotal', divisionsTotal);
  if (valeur < 0) {
    return const LectureAiguille(
        divisions: 0, horsEchelle: false, sensInverse: true);
  }
  final brute = valeur * divisionsTotal / calibre;
  if (brute > divisionsTotal * (1 + 1e-9)) {
    return LectureAiguille(
        divisions: divisionsTotal, horsEchelle: true, sensInverse: false);
  }
  return LectureAiguille(
    divisions: brute > divisionsTotal ? divisionsTotal : brute,
    horsEchelle: false,
    sensInverse: false,
  );
}

/// Où se place l'aiguille d'un ampèremètre pour une intensité donnée.
LectureAiguille lectureAiguilleIntensite({
  required double intensiteA,
  required double calibreA,
  required double divisionsTotal,
}) =>
    _lectureAiguille(intensiteA, calibreA, divisionsTotal);

/// Où se place l'aiguille d'un voltmètre pour une tension donnée.
LectureAiguille lectureAiguilleTension({
  required double tensionV,
  required double calibreV,
  required double divisionsTotal,
}) =>
    _lectureAiguille(tensionV, calibreV, divisionsTotal);

/// Ce que calcule l'élève : I = C x l / D (formule de la fiche de TP courant n°2).
double intensiteDepuisLectureA({
  required double calibreA,
  required double lectureDiv,
  required double divisionsTotal,
}) {
  exigerPositif('calibreA', calibreA);
  exigerPositif('divisionsTotal', divisionsTotal);
  exigerPositifOuNul('lectureDiv', lectureDiv);
  return calibreA * lectureDiv / divisionsTotal;
}

/// Même formule pour un voltmètre : U = C x l / D.
double tensionDepuisLectureV({
  required double calibreV,
  required double lectureDiv,
  required double divisionsTotal,
}) {
  exigerPositif('calibreV', calibreV);
  exigerPositif('divisionsTotal', divisionsTotal);
  exigerPositifOuNul('lectureDiv', lectureDiv);
  return calibreV * lectureDiv / divisionsTotal;
}

/// Incertitude absolue d'un ampèremètre à aiguille : ΔI = classe x calibre / 100.
/// La fiche de TP ne donne pas la formule : à valider par le professeur.
double incertitudeAbsolueA({required double classe, required double calibreA}) {
  exigerPositif('classe', classe);
  exigerPositif('calibreA', calibreA);
  return classe * calibreA / 100;
}

/// Même formule pour un voltmètre : ΔU = classe x calibre / 100.
double incertitudeAbsolueV({required double classe, required double calibreV}) {
  exigerPositif('classe', classe);
  exigerPositif('calibreV', calibreV);
  return classe * calibreV / 100;
}

/// Incertitude relative (précision) : Δx / x, en fraction (0,0625 = 6,25 %).
/// L'incertitude et la valeur sont dans la même unité.
double incertitudeRelative(
    {required double incertitudeAbsolue, required double valeurMesuree}) {
  exigerPositifOuNul('incertitudeAbsolue', incertitudeAbsolue);
  exigerPositif('valeurMesuree', valeurMesuree);
  return incertitudeAbsolue / valeurMesuree;
}

/// Encadrement x - Δx <= x <= x + Δx.
({double minimum, double maximum}) encadrement({
  required double valeurMesuree,
  required double incertitudeAbsolue,
}) {
  exigerPositifOuNul('incertitudeAbsolue', incertitudeAbsolue);
  return (
    minimum: valeurMesuree - incertitudeAbsolue,
    maximum: valeurMesuree + incertitudeAbsolue,
  );
}
