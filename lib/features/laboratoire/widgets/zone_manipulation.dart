// Zone 2 : manipulation. L'élève règle lui-même le robinet : aucun bouton ne verse à sa place.
import 'package:flutter/material.dart';

import '../../../core/format.dart';
import '../../../core/theme/theme.dart';
import '../../../core/widgets/carte.dart';
import '../etat_laboratoire.dart';

class ZoneManipulation extends StatelessWidget {
  const ZoneManipulation({
    super.key,
    required this.niveau,
    required this.onChoisir,
    required this.volumeMl,
    required this.volumeMaxMl,
    this.desactive = false,
  });

  final double niveau;
  final ValueChanged<double> onChoisir;
  final double volumeMl;
  final double volumeMaxMl;
  final bool desactive;

  String get _etat => niveau == 0
      ? 'Robinet fermé'
      : niveau < NiveauxRobinet.jet
          ? 'Robinet goutte à goutte'
          : 'Robinet en jet';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fraction = volumeMaxMl <= 0 ? 0.0 : (volumeMl / volumeMaxMl).clamp(0.0, 1.0);
    return Semantics(
      container: true,
      label: 'Zone manipulation',
      child: Carte(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Semantics(
                    header: true,
                    child: Text('Manipulation', style: theme.textTheme.titleMedium),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: Espace.x2, vertical: Espace.x1),
                  decoration: BoxDecoration(
                    color: Couleurs.fondTeal,
                    borderRadius: BorderRadius.circular(Tailles.rayonPetit),
                  ),
                  child: Text(_etat, style: theme.textTheme.labelMedium),
                ),
              ],
            ),
            const SizedBox(height: Espace.x2),
            Semantics(
              label:
                  'Schéma du dosage. Volume versé : ${formaterNombre(volumeMl, 2)} millilitres.',
              excludeSemantics: true,
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(Tailles.rayonPetit),
                  child: ColoredBox(
                    color: Couleurs.fond,
                    child: RepaintBoundary(
                      child: CustomPaint(
                        painter: DessinPaillasse(
                          fractionRestante: 1 - fraction,
                          robinetOuvert: niveau > 0,
                        ),
                        child: const SizedBox.expand(),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: Espace.x2),
            Row(
              children: [
                Expanded(
                  child: _Choix(
                    libelle: 'Fermé',
                    icone: Icons.radio_button_checked,
                    choisi: niveau == NiveauxRobinet.ferme,
                    onTap: desactive ? null : () => onChoisir(NiveauxRobinet.ferme),
                  ),
                ),
                const SizedBox(width: Espace.x1),
                Expanded(
                  child: _Choix(
                    libelle: 'Goutte à goutte',
                    icone: Icons.water_drop_outlined,
                    choisi: niveau == NiveauxRobinet.goutte,
                    onTap: desactive ? null : () => onChoisir(NiveauxRobinet.goutte),
                  ),
                ),
                const SizedBox(width: Espace.x1),
                Expanded(
                  child: _Choix(
                    libelle: 'Jet',
                    icone: Icons.water_drop,
                    choisi: niveau == NiveauxRobinet.jet,
                    onTap: desactive ? null : () => onChoisir(NiveauxRobinet.jet),
                  ),
                ),
              ],
            ),
            const SizedBox(height: Espace.x1),
            Text(
              'Tu règles le robinet. Le débit reste bloqué tant que la sécurité n\'est pas respectée.',
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _Choix extends StatelessWidget {
  const _Choix({
    required this.libelle,
    required this.icone,
    required this.choisi,
    required this.onTap,
  });

  final String libelle;
  final IconData icone;
  final bool choisi;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: choisi,
      enabled: onTap != null,
      label: 'Robinet : $libelle',
      excludeSemantics: true,
      child: Material(
        color: choisi ? Couleurs.fondTeal : Couleurs.fond,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          side: BorderSide(
            color: choisi ? Couleurs.teal : Couleurs.bordure,
            width: choisi ? Tailles.trait : Tailles.traitFin,
          ),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          onTap: onTap,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: Espace.x8),
            child: Padding(
              padding: const EdgeInsets.all(Espace.x1),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icone, color: Couleurs.teal, size: Tailles.icone),
                  const SizedBox(height: Espace.x1),
                  Text(
                    libelle,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Schéma simple : support, burette (niveau de liquide), erlenmeyer, goutte.
class DessinPaillasse extends CustomPainter {
  const DessinPaillasse({required this.fractionRestante, required this.robinetOuvert});

  final double fractionRestante;
  final bool robinetOuvert;

  @override
  void paint(Canvas canvas, Size size) {
    final trait = Paint()
      ..color = Couleurs.teal
      ..style = PaintingStyle.stroke
      ..strokeWidth = Tailles.trait;
    final liquide = Paint()..color = Couleurs.liquide;
    final plein = Paint()..color = Couleurs.teal;
    final w = size.width;
    final h = size.height;

    // Pied et tige du support
    canvas.drawLine(Offset(w * 0.2, h * 0.92), Offset(w * 0.5, h * 0.92), trait);
    canvas.drawLine(Offset(w * 0.25, h * 0.92), Offset(w * 0.25, h * 0.06), trait);
    canvas.drawLine(Offset(w * 0.25, h * 0.2), Offset(w * 0.46, h * 0.2), trait);

    // Burette
    final burette = Rect.fromLTRB(w * 0.46, h * 0.06, w * 0.54, h * 0.5);
    final niveau = Rect.fromLTRB(burette.left, burette.bottom - burette.height * fractionRestante,
        burette.right, burette.bottom);
    canvas.drawRect(niveau, liquide);
    canvas.drawRect(burette, trait);
    canvas.drawCircle(Offset(w * 0.5, h * 0.54), h * 0.03, plein);

    // Goutte
    if (robinetOuvert) {
      canvas.drawCircle(Offset(w * 0.5, h * 0.62), h * 0.025, plein);
    }

    // Erlenmeyer
    final fiole = Path()
      ..moveTo(w * 0.47, h * 0.68)
      ..lineTo(w * 0.53, h * 0.68)
      ..lineTo(w * 0.53, h * 0.76)
      ..lineTo(w * 0.62, h * 0.92)
      ..lineTo(w * 0.38, h * 0.92)
      ..lineTo(w * 0.47, h * 0.76)
      ..close();
    canvas.drawPath(fiole, liquide);
    canvas.drawPath(fiole, trait);
  }

  @override
  bool shouldRepaint(DessinPaillasse oldDelegate) =>
      oldDelegate.fractionRestante != fractionRestante ||
      oldDelegate.robinetOuvert != robinetOuvert;
}
