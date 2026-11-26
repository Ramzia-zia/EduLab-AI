import 'package:flutter/material.dart';

import 'cartes.dart';
import 'etat.dart';

/// Ecran dont la route n'existe pas encore dans CONTRAT.md.
/// Il est liste dans le document des ajouts.
class EcranAVenir extends StatelessWidget {
  const EcranAVenir({super.key, required this.titre, required this.note});
  final String titre;
  final String note;

  @override
  Widget build(BuildContext context) {
    return PageDefilante(enfants: [
      EnTetePage(titre: titre),
      Panneau(
        enfant: MessageEtat(
          icone: Icons.construction_outlined,
          message: 'Cet écran sera branché quand la route sera validée.\n$note',
        ),
      ),
    ]);
  }
}
