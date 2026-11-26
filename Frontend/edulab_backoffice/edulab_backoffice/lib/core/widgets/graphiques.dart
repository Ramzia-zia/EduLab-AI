import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../donnees/modeles_provisoires.dart';
import '../theme/theme.dart';

enum _Ancrage { gauche, centre, droite }

void _ecrire(Canvas canvas, String texte, Offset point,
    {_Ancrage ancrage = _Ancrage.centre,
    Color couleur = Couleurs.texte,
    FontWeight poids = FontWeight.w500}) {
  final tp = TextPainter(
    text: TextSpan(
        text: texte,
        style: TextStyle(
            fontSize: Taille.texte, color: couleur, fontWeight: poids)),
    textDirection: TextDirection.ltr,
  )..layout();
  double x = point.dx;
  if (ancrage == _Ancrage.centre) x -= tp.width / 2;
  if (ancrage == _Ancrage.droite) x -= tp.width;
  tp.paint(canvas, Offset(x, point.dy - tp.height / 2));
}

/// Courbe d'evolution avec aire legere (axe vertical de 0 a 100 %).
class GraphiqueCourbe extends StatelessWidget {
  const GraphiqueCourbe(
      {super.key, required this.libelles, required this.valeurs});
  final List<String> libelles;
  final List<double> valeurs;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label:
          'Courbe d\'évolution : ${valeurs.map((v) => '${v.round()} pour cent').join(', ')}',
      child: AspectRatio(
        aspectRatio: 2.2,
        child: CustomPaint(
            painter: _CourbePainter(libelles: libelles, valeurs: valeurs)),
      ),
    );
  }
}

class _CourbePainter extends CustomPainter {
  _CourbePainter({required this.libelles, required this.valeurs});
  final List<String> libelles;
  final List<double> valeurs;

  @override
  void paint(Canvas canvas, Size size) {
    const gauche = 48.0, bas = 32.0, haut = 8.0, droite = 16.0;
    final zone = Rect.fromLTRB(gauche, haut, size.width - droite, size.height - bas);
    final trait = Paint()
      ..color = Couleurs.bordure
      ..strokeWidth = 1;
    for (var i = 0; i <= 4; i++) {
      final y = zone.bottom - zone.height * i / 4;
      canvas.drawLine(Offset(zone.left, y), Offset(zone.right, y), trait);
      _ecrire(canvas, '${i * 25}%', Offset(gauche - 8, y),
          ancrage: _Ancrage.droite, couleur: Couleurs.texteDiscret);
    }
    final n = valeurs.length;
    if (n < 2) return;
    final points = <Offset>[
      for (var i = 0; i < n; i++)
        Offset(zone.left + zone.width * i / (n - 1),
            zone.bottom - zone.height * (valeurs[i].clamp(0, 100)) / 100),
    ];
    final aire = Path()..moveTo(points.first.dx, zone.bottom);
    for (final p in points) {
      aire.lineTo(p.dx, p.dy);
    }
    aire
      ..lineTo(points.last.dx, zone.bottom)
      ..close();
    canvas.drawPath(
        aire, Paint()..color = Couleurs.vertGraphique.withValues(alpha: 0.12));
    final ligne = Path()..moveTo(points.first.dx, points.first.dy);
    for (final p in points.skip(1)) {
      ligne.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(
        ligne,
        Paint()
          ..color = Couleurs.vertGraphique
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5
          ..strokeJoin = StrokeJoin.round);
    for (var i = 0; i < n; i++) {
      canvas.drawCircle(points[i], 5, Paint()..color = Couleurs.blanc);
      canvas.drawCircle(
          points[i],
          4,
          Paint()
            ..color = Couleurs.vertGraphique);
      if (i < libelles.length) {
        _ecrire(canvas, libelles[i], Offset(points[i].dx, zone.bottom + 16),
            couleur: Couleurs.texteDiscret);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _CourbePainter ancien) =>
      ancien.valeurs != valeurs || ancien.libelles != libelles;
}

/// Anneau de repartition par region.
class GraphiqueAnneau extends StatelessWidget {
  const GraphiqueAnneau({super.key, required this.parts, required this.couleurs});
  final List<PartRegion> parts;
  final List<Color> couleurs;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label:
          'Répartition par région : ${parts.map((p) => '${p.nom} ${p.pourcentage.round()} pour cent').join(', ')}',
      child: AspectRatio(
        aspectRatio: 1,
        child: CustomPaint(
            painter: _AnneauPainter(parts: parts, couleurs: couleurs)),
      ),
    );
  }
}

class _AnneauPainter extends CustomPainter {
  _AnneauPainter({required this.parts, required this.couleurs});
  final List<PartRegion> parts;
  final List<Color> couleurs;

  @override
  void paint(Canvas canvas, Size size) {
    final epaisseur = size.shortestSide * 0.26;
    final rect = Rect.fromCircle(
        center: size.center(Offset.zero),
        radius: size.shortestSide / 2 - epaisseur / 2);
    final total = parts.fold<double>(0, (s, p) => s + p.pourcentage);
    var debut = -math.pi / 2;
    for (var i = 0; i < parts.length; i++) {
      final angle = 2 * math.pi * parts[i].pourcentage / total;
      canvas.drawArc(
          rect,
          debut,
          angle,
          false,
          Paint()
            ..color = couleurs[i % couleurs.length]
            ..style = PaintingStyle.stroke
            ..strokeWidth = epaisseur);
      debut += angle;
    }
  }

  @override
  bool shouldRepaint(covariant _AnneauPainter ancien) =>
      ancien.parts != parts || ancien.couleurs != couleurs;
}

/// Barres verticales (performance nationale).
class GraphiqueBarres extends StatelessWidget {
  const GraphiqueBarres({super.key, required this.parts});
  final List<PartRegion> parts;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label:
          'Performance nationale : ${parts.map((p) => '${p.nom} ${p.pourcentage.round()} pour cent').join(', ')}',
      child: AspectRatio(
        aspectRatio: 1.7,
        child: CustomPaint(painter: _BarresPainter(parts: parts)),
      ),
    );
  }
}

class _BarresPainter extends CustomPainter {
  _BarresPainter({required this.parts});
  final List<PartRegion> parts;

  @override
  void paint(Canvas canvas, Size size) {
    const gauche = 48.0, bas = 32.0, haut = 24.0, droite = 8.0;
    final zone = Rect.fromLTRB(gauche, haut, size.width - droite, size.height - bas);
    final trait = Paint()
      ..color = Couleurs.bordure
      ..strokeWidth = 1;
    for (var i = 0; i <= 4; i++) {
      final y = zone.bottom - zone.height * i / 4;
      canvas.drawLine(Offset(zone.left, y), Offset(zone.right, y), trait);
      _ecrire(canvas, '${i * 25}%', Offset(gauche - 8, y),
          ancrage: _Ancrage.droite, couleur: Couleurs.texteDiscret);
    }
    final n = parts.length;
    if (n == 0) return;
    final pas = zone.width / n;
    final largeurBarre = math.min(pas * 0.5, 48.0);
    for (var i = 0; i < n; i++) {
      final centre = zone.left + pas * (i + 0.5);
      final hauteur = zone.height * parts[i].pourcentage.clamp(0, 100) / 100;
      final barre = RRect.fromRectAndCorners(
        Rect.fromLTWH(centre - largeurBarre / 2, zone.bottom - hauteur,
            largeurBarre, hauteur),
        topLeft: const Radius.circular(4),
        topRight: const Radius.circular(4),
      );
      canvas.drawRRect(barre, Paint()..color = Couleurs.vertGraphique);
      _ecrire(canvas, '${parts[i].pourcentage.round()}%',
          Offset(centre, zone.bottom - hauteur - 12),
          poids: FontWeight.w700);
      _ecrire(canvas, parts[i].nom, Offset(centre, zone.bottom + 16),
          couleur: Couleurs.texteDiscret);
    }
  }

  @override
  bool shouldRepaint(covariant _BarresPainter ancien) => ancien.parts != parts;
}

/// Carte simplifiee du Togo, coloree par region selon la performance.
/// Ordre des valeurs : Savanes, Kara, Centrale, Plateaux, Maritime (du nord au sud).
class CarteTogo extends StatelessWidget {
  const CarteTogo({super.key, required this.valeurs_nord_sud});
  final List<double> valeurs_nord_sud;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Carte du Togo colorée selon la performance par région',
      child: AspectRatio(
        aspectRatio: 0.55,
        child: CustomPaint(painter: _CartePainter(valeurs_nord_sud)),
      ),
    );
  }
}

class _CartePainter extends CustomPainter {
  _CartePainter(this.valeurs);
  final List<double> valeurs;

  static const _contour = <Offset>[
    Offset(0.22, 0.0), Offset(0.80, 0.0), Offset(0.82, 0.07),
    Offset(0.72, 0.13), Offset(0.74, 0.30), Offset(0.66, 0.42),
    Offset(0.74, 0.56), Offset(0.64, 0.72), Offset(0.62, 0.88),
    Offset(0.70, 1.0), Offset(0.48, 1.0), Offset(0.40, 0.86),
    Offset(0.36, 0.70), Offset(0.42, 0.58), Offset(0.30, 0.46),
    Offset(0.34, 0.34), Offset(0.28, 0.22), Offset(0.24, 0.12),
  ];
  static const _bandes = [0.0, 0.16, 0.38, 0.52, 0.80, 1.0];

  @override
  void paint(Canvas canvas, Size size) {
    final chemin = Path()..moveTo(_contour.first.dx * size.width, _contour.first.dy * size.height);
    for (final p in _contour.skip(1)) {
      chemin.lineTo(p.dx * size.width, p.dy * size.height);
    }
    chemin.close();
    canvas.save();
    canvas.clipPath(chemin);
    for (var i = 0; i < _bandes.length - 1; i++) {
      final valeur = i < valeurs.length ? valeurs[i] : 0.0;
      canvas.drawRect(
        Rect.fromLTRB(0, _bandes[i] * size.height, size.width,
            _bandes[i + 1] * size.height),
        Paint()..color = Couleurs.niveauPerformance(valeur),
      );
      if (i > 0) {
        canvas.drawLine(
            Offset(0, _bandes[i] * size.height),
            Offset(size.width, _bandes[i] * size.height),
            Paint()
              ..color = Couleurs.blanc
              ..strokeWidth = 2);
      }
    }
    canvas.restore();
    canvas.drawPath(
        chemin,
        Paint()
          ..color = Couleurs.blanc
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2);
  }

  @override
  bool shouldRepaint(covariant _CartePainter ancien) => ancien.valeurs != valeurs;
}

/// Bandes jaune et rouge du bas du menu lateral (maquette).
class BandeDrapeau extends StatelessWidget {
  const BandeDrapeau({super.key});

  @override
  Widget build(BuildContext context) => const ExcludeSemantics(
        child: SizedBox(height: 96, child: CustomPaint(painter: _DrapeauPainter())),
      );
}

class _DrapeauPainter extends CustomPainter {
  const _DrapeauPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width, h = size.height;
    final jaune = Path()
      ..moveTo(0, h * .55)
      ..quadraticBezierTo(w * .5, h * .55, w, h * .2)
      ..lineTo(w, h * .5)
      ..quadraticBezierTo(w * .5, h * .85, 0, h * .85)
      ..close();
    final rouge = Path()
      ..moveTo(0, h * .85)
      ..quadraticBezierTo(w * .5, h * .85, w, h * .5)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(jaune, Paint()..color = Couleurs.jaune);
    canvas.drawPath(rouge, Paint()..color = Couleurs.rouge);
  }

  @override
  bool shouldRepaint(covariant CustomPainter ancien) => false;
}
