// Écran : lib/features/quiz/ecran_quiz.dart
// Route appelée : AUCUNE. Le contrat v0.1 ne définit ni route ni champ pour le quiz
// de bilan (table `bilan` seulement). Écran volontairement vide, en attente de la
// demande de changement du contrat (voir README, « Manques du contrat »).
// États : vide uniquement (rien à charger, rien qui puisse échouer).
import 'package:flutter/material.dart';

import '../../core/widgets/vue_async.dart';

class EcranQuiz extends StatelessWidget {
  const EcranQuiz({super.key});

  @override
  Widget build(BuildContext context) {
    return const EtatVide(
      message:
          'Le quiz de bilan apparaîtra ici après une expérience. Il n\'est pas encore disponible.',
      icone: Icons.fact_check_outlined,
    );
  }
}
