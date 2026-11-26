import 'dart:math' as math;

// Banc d'optique interactif : modèle de l'image, de la netteté et des rayons.
// Unités : centimètres. Axe optique horizontal. f' est cachée à l'élève.
// Rien ici n'est affiché : la scène 3D relit ces fonctions à chaque image.

/// Valeurs de la simulation (hypothèses à valider, voir SIMULATIONS.md).
class ParametresBanc {
  const ParametresBanc({
    this.fPrimeCm = 15.0,
    this.hauteurObjetCm = 1.2,
    this.toleranceNetteteCm = 0.5,
    this.flouPxParCm = 2.4,
    this.distanceMiroirCm = 3.0,
    this.hauteursRayonsCm = const [2.0, 0.0, -2.0],
  });

  final double fPrimeCm;
  final double hauteurObjetCm;
  final double toleranceNetteteCm;

  /// Flou de l'image sur l'écran : pixels par centimètre d'écart (écran de 512 px pour 10 cm).
  final double flouPxParCm;

  /// Distance entre la lentille et le miroir plan (méthode de Bilbermann).
  final double distanceMiroirCm;
  final List<double> hauteursRayonsCm;
}

/// Ce que l'écran (ou le plan de l'objet avec le miroir) reçoit.
class ImageBanc {
  const ImageBanc({
    required this.positionImageCm,
    required this.grandissement,
    required this.tailleImageCm,
    required this.ecartCm,
    required this.flouPx,
    required this.nette,
  });

  /// Abscisse de l'image réelle. Null s'il n'y en a pas (objet au foyer ou entre le foyer et la lentille).
  final double? positionImageCm;
  final double? grandissement;

  /// Taille de l'image (positive), l'image est inversée.
  final double? tailleImageCm;

  /// |position de l'écran - position de l'image|.
  final double? ecartCm;

  /// Flou en pixels sur l'écran de 512 px. Très grand s'il n'y a pas d'image.
  final double flouPx;
  final bool nette;
}

class SegmentRayon {
  const SegmentRayon(this.x1, this.y1, this.x2, this.y2, {this.retour = false});
  final double x1, y1, x2, y2;

  /// Faux : trajet aller (jaune). Vrai : trajet retour (orange).
  final bool retour;
}

const double flouSansImagePx = 60.0;

/// Image sur l'écran (sans miroir) : 1/OA' - 1/OA = 1/f', avec p = OA > 0.
ImageBanc imageSurEcran({
  required double xObjetCm,
  required double xLentilleCm,
  required double xEcranCm,
  ParametresBanc parametres = const ParametresBanc(),
}) {
  final p = xLentilleCm - xObjetCm;
  final f = parametres.fPrimeCm;
  if (p <= f) return _sansImage();
  final pp = 1 / (1 / f - 1 / p);
  final gamma = pp / p;
  final ecart = (xEcranCm - (xLentilleCm + pp)).abs();
  return ImageBanc(
    positionImageCm: xLentilleCm + pp,
    grandissement: gamma,
    tailleImageCm: gamma * parametres.hauteurObjetCm,
    ecartCm: ecart,
    flouPx: parametres.flouPxParCm * ecart,
    nette: ecart < parametres.toleranceNetteteCm,
  );
}

/// Bilbermann : l'image revient dans le plan de l'objet après le miroir plan.
/// Le miroir est à `distanceMiroirCm` derrière la lentille. L'écart est mesuré dans le plan de l'objet.
ImageBanc imageAutocollimation({
  required double xObjetCm,
  required double xLentilleCm,
  ParametresBanc parametres = const ParametresBanc(),
}) {
  final p = xLentilleCm - xObjetCm;
  final f = parametres.fPrimeCm;
  if (p < f - 1e-9) return _sansImage();
  final dm = parametres.distanceMiroirCm;
  final invPp = 1 / f - 1 / p; // 1/p' (nul si l'objet est au foyer)
  double invP2; // 1/P2 pour le passage retour
  if (invPp.abs() < 1e-9) {
    invP2 = 0;
  } else {
    final p2 = 2 * dm - 1 / invPp;
    if (p2.abs() < 1e-9) return _sansImage();
    invP2 = 1 / p2;
  }
  final invImg = 1 / f - invP2; // 1/p2'
  if (invImg <= 1e-9) return _sansImage();
  final xImage = xLentilleCm - 1 / invImg;
  final ecart = (xImage - xObjetCm).abs();
  // Grandissement total aller-retour : au foyer, p' est infini et le produit vaut p2'/p.
  final total = invPp.abs() < 1e-9
      ? (1 / invImg) / p
      : ((1 / invPp) / p * (1 / invImg) * invP2).abs();
  return ImageBanc(
    positionImageCm: xImage,
    grandissement: total,
    tailleImageCm: total * parametres.hauteurObjetCm,
    ecartCm: ecart,
    flouPx: parametres.flouPxParCm * ecart,
    nette: ecart < parametres.toleranceNetteteCm,
  );
}

ImageBanc _sansImage() => const ImageBanc(
      positionImageCm: null,
      grandissement: null,
      tailleImageCm: null,
      ecartCm: null,
      flouPx: flouSansImagePx,
      nette: false,
    );

/// Rayons issus du sommet B de l'objet (abscisse xObjet, hauteur hauteurObjetCm).
/// Pente avant la lentille = (h - yB) / (xO - xA). Pente après = pente avant - h / f'.
/// Sans miroir : les rayons vont jusqu'à l'écran. Avec miroir (xMiroirCm non nul) :
/// aller jusqu'au miroir, puis retour dans le plan de l'objet (rayons dépliés autour du miroir).
List<SegmentRayon> rayons({
  required double xObjetCm,
  required double xLentilleCm,
  double? xEcranCm,
  double? xMiroirCm,
  ParametresBanc parametres = const ParametresBanc(),
}) {
  final f = parametres.fPrimeCm;
  final yb = parametres.hauteurObjetCm;
  final dx = xLentilleCm - xObjetCm;
  final sortie = <SegmentRayon>[];
  if (dx <= 1e-6) return sortie;
  for (final h in parametres.hauteursRayonsCm) {
    final s1 = (h - yb) / dx;
    final s2 = s1 - h / f;
    sortie.add(SegmentRayon(xObjetCm, yb, xLentilleCm, h));
    if (xMiroirCm != null) {
      final dm = xMiroirCm - xLentilleCm;
      final ym = h + s2 * dm;
      sortie.add(SegmentRayon(xLentilleCm, h, xMiroirCm, ym));
      final hr = ym + s2 * dm; // hauteur au retour sur la lentille
      final s3 = s2 - hr / f;
      sortie.add(SegmentRayon(xMiroirCm, ym, xLentilleCm, hr, retour: true));
      sortie.add(SegmentRayon(xLentilleCm, hr, xObjetCm, hr + s3 * dx,
          retour: true));
    } else if (xEcranCm != null && xEcranCm > xLentilleCm) {
      sortie.add(SegmentRayon(
          xLentilleCm, h, xEcranCm, h + s2 * (xEcranCm - xLentilleCm)));
    }
  }
  return sortie;
}

/// Lecture d'une position sur la règle graduée au millimètre. L'élève lit à ± 0,5 mm près.
/// `parallaxeMm` simule une lecture de travers.
double lectureRegleCm(double positionCm, {double parallaxeMm = 0}) {
  final mm = (positionCm * 10).roundToDouble() + parallaxeMm;
  return mm / 10;
}

/// Positions de la lentille (depuis l'objet) pour une distance D objet-écran.
/// Renvoie null si D < 4f'.
List<double>? positionsBesselBanc(double dCm, ParametresBanc p) {
  final disc = dCm * dCm - 4 * dCm * p.fPrimeCm;
  if (disc < 0) return null;
  final r = math.sqrt(disc);
  return [(dCm - r) / 2, (dCm + r) / 2];
}
