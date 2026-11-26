import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../theme/theme.dart';

class LogoEduLab extends StatelessWidget {
  const LogoEduLab(
      {super.key, this.couleur_texte = Couleurs.blanc, this.taille = 48});
  final Color couleur_texte;
  final double taille;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'EduLab AI',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SvgPicture.asset('assets/images/logo.svg',
              width: taille + Espace.s, height: taille),
          const SizedBox(width: Espace.xs),
          Flexible(
            child: Text(
              'EduLab AI',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: couleur_texte),
            ),
          ),
        ],
      ),
    );
  }
}
