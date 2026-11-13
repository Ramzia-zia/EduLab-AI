// Zone 4 : résultat. Volume, pH et courbe du pH ; les valeurs viennent de labo_core.
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/format.dart';
import '../../../core/theme/theme.dart';
import '../../../core/widgets/carte.dart';
import '../etat_laboratoire.dart';

class ZoneResultat extends StatelessWidget {
  const ZoneResultat({
    super.key,
    required this.volumeMl,
    required this.ph,
    required this.tempsS,
    required this.courbe,
    required this.enCours,
    required this.termine,
  });

  final double volumeMl;
  final double ph;
  final double tempsS;
  final List<PointCourbe> courbe;
  final bool enCours;
  final bool termine;

  String get _statut => termine
      ? 'terminé'
      : enCours
          ? 'en cours'
          : 'en attente';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tempsMax = math.max(60, (tempsS / 30).ceil() * 30).toDouble();
    final resume =
        'V = ${formaterNombre(volumeMl, 2)} mL · pH = ${formaterNombre(ph, 1)}';
    return Semantics(
      container: true,
      label: 'Zone résultat, $_statut. $resume',
      child: Carte(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              runSpacing: Espace.x1,
              children: [
                Semantics(
                  header: true,
                  child: Text('Résultat · $_statut',
                      style: theme.textTheme.titleMedium),
                ),
                Text(resume, style: theme.textTheme.bodyMedium),
              ],
            ),
            const SizedBox(height: Espace.x2),
            SizedBox(
              height: Tailles.hauteurCourbe,
              child: Row(
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      for (final v in const ['14', '7', '0'])
                        Text(v, style: theme.textTheme.bodySmall),
                    ],
                  ),
                  const SizedBox(width: Espace.x1),
                  Expanded(
                    child: Semantics(
                      label: 'Courbe du pH en fonction du temps',
                      excludeSemantics: true,
                      child: RepaintBoundary(
                        child: CustomPaint(
                          painter: CourbePh(points: courbe, tempsMaxS: tempsMax),
                          child: const SizedBox.expand(),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: Espace.x1),
            Padding(
              padding: const EdgeInsets.only(left: Espace.x3),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('0', style: theme.textTheme.bodySmall),
                  Text('${(tempsMax / 2).round()} s', style: theme.textTheme.bodySmall),
                  Text('${tempsMax.round()} s', style: theme.textTheme.bodySmall),
                ],
              ),
            ),
            const SizedBox(height: Espace.x1),
            Text('t = ${formaterNombre(tempsS, 0)} s', style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class CourbePh extends CustomPainter {
  const CourbePh({required this.points, required this.tempsMaxS});

  final List<PointCourbe> points;
  final double tempsMaxS;

  static const _phMax = 14.0;

  @override
  void paint(Canvas canvas, Size size) {
    final grille = Paint()
      ..color = Couleurs.bordure
      ..strokeWidth = Tailles.traitFin;
    for (final ph in const [0.0, 7.0, 14.0]) {
      final y = size.height * (1 - ph / _phMax);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grille);
    }
    if (points.isEmpty) return;
    final trait = Paint()
      ..color = Couleurs.teal
      ..style = PaintingStyle.stroke
      ..strokeWidth = Tailles.trait
      ..strokeJoin = StrokeJoin.round;
    final chemin = Path();
    for (var i = 0; i < points.length; i++) {
      final p = points[i];
      final x = size.width * (p.tempsS / tempsMaxS).clamp(0.0, 1.0);
      final y = size.height * (1 - (p.ph / _phMax).clamp(0.0, 1.0));
      i == 0 ? chemin.moveTo(x, y) : chemin.lineTo(x, y);
    }
    canvas.drawPath(chemin, trait);
  }

  @override
  bool shouldRepaint(CourbePh oldDelegate) =>
      oldDelegate.points != points || oldDelegate.tempsMaxS != tempsMaxS;
}
