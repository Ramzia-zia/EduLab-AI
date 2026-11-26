import 'dart:math' as math;

// Dosage manuel (HCl par NaOH, phénolphtaléine) : modèle de la SPEC section 7.
// Volumes en mL, concentrations en mol/L. Rien ici n'est affiché.

class SerieDosage {
  const SerieDosage({this.caMolL = 0.080, this.cbMolL = 0.10, this.vaMl = 20.0});
  final double caMolL;
  final double cbMolL;
  final double vaMl;

  /// Volume équivalent : Ve = Ca·Va / Cb.
  double get veMl => caMolL * vaMl / cbMolL;
}

/// pH du mélange pour un volume de soude versé `vbMl`.
double phDosage(SerieDosage s, double vbMl) {
  final na = s.caMolL * s.vaMl;
  final nb = s.cbMolL * vbMl;
  final v = s.vaMl + vbMl;
  if ((na - nb).abs() < 1e-9) return 7.0;
  if (nb < na) return -(math.log((na - nb) / v) / math.ln10);
  return 14 + math.log((nb - na) / v) / math.ln10;
}

/// Intensité du rose de la phénolphtaléine (0 incolore, 1 fuchsia intense) : apparaît dès pH 8,2.
double intensiteRose(double ph) {
  if (ph <= 8.2) return 0.0;
  final i = ((ph - 8.2) / 2.8).clamp(0.0, 1.0);
  return math.pow(i, 1.4) * 0.9 + (i >= 1 ? 0.1 : 0.0);
}

/// Volume d'une goutte : 0,05 mL, variation de ± 5 % (`alea` entre -1 et 1).
double volumeGoutteMl(double alea) => 0.05 * (1 + 0.05 * alea.clamp(-1.0, 1.0));

/// Volume réel prélevé à la pipette selon l'écart du bas du ménisque au trait de jauge (mm).
/// Une erreur de 5 mm donne environ 0,2 mL.
double volumePipetteMl(double jaugeMl, double ecartMm) => jaugeMl + 0.04 * ecartMm;

/// Volume réellement versé quand une bulle d'air reste dans la pointe.
double volumeVerseAvecBulle(double luMl, bool bulle) => bulle ? math.max(0.0, luMl - 0.3) : luMl;

/// Décalage du virage : au-delà de 5 gouttes d'indicateur, le virage est retardé de 0,03 mL par goutte.
double decalageVirageMl(int gouttesIndicateur) => gouttesIndicateur > 5 ? 0.03 * (gouttesIndicateur - 5) : 0.0;

/// Erreur de lecture du ménisque : écart de hauteur de l'oeil (cm) par rapport au ménisque.
double erreurLectureMl(double ecartHauteurCm) => (ecartHauteurCm * 0.2).clamp(-0.3, 0.3);

/// Tache rose locale : s'estompe plus vite quand l'élève agite (`agitation` entre 0 et 1).
double tacheLocale(double intensite, double dtS, double agitation) =>
    intensite * math.exp(-(0.04 + 0.9 * agitation) * dtS);

/// Une goutte tombe : intensité locale de la tache rose selon le pH que verrait la goutte.
double intensiteTacheGoutte(SerieDosage s, double vbMl) => intensiteRose(phDosage(s, vbMl + 0.5));
