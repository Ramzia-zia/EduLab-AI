import 'package:flutter/material.dart';

import '../theme/theme.dart';

class Carte extends StatelessWidget {
  const Carte({
    super.key,
    required this.child,
    this.couleur = Couleurs.surface,
    this.bordure = Couleurs.bordure,
    this.padding = const EdgeInsets.all(Espace.x2),
  });

  final Widget child;
  final Color couleur;
  final Color bordure;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: couleur,
        borderRadius: BorderRadius.circular(Tailles.rayon),
        border: Border.all(color: bordure),
      ),
      child: child,
    );
  }
}
