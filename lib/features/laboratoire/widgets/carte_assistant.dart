// Carte de l'assistant. Les conseils du laboratoire marchent sans réseau ;
// les indices passent seulement par la route POST /assistant du serveur.
import 'package:flutter/material.dart';

import '../../../core/theme/theme.dart';
import '../../../core/widgets/carte.dart';

class CarteAssistant extends StatelessWidget {
  const CarteAssistant({
    super.key,
    this.conseil,
    this.reponse,
    this.erreur,
    required this.enCours,
    required this.niveauIndice,
    required this.enLigne,
    required this.onDemander,
  });

  final String? conseil;
  final String? reponse;
  final String? erreur;
  final bool enCours;
  final int niveauIndice;
  final bool enLigne;
  final VoidCallback onDemander;

  static const _niveauMax = 3;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final texte = reponse ??
        conseil ??
        'Place ton matériel, puis règle le robinet. Je t\'aide si tu bloques.';
    final termine = niveauIndice >= _niveauMax;
    final peutDemander = enLigne && !enCours && !termine;

    return Semantics(
      container: true,
      liveRegion: true,
      label: 'Assistant. $texte',
      child: Carte(
        couleur: Couleurs.fondTeal,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.lightbulb_outline, color: Couleurs.teal),
                const SizedBox(width: Espace.x2),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Assistant', style: theme.textTheme.titleMedium),
                      const SizedBox(height: Espace.x1),
                      Text(texte),
                      if (erreur != null) ...[
                        const SizedBox(height: Espace.x1),
                        Text(erreur!,
                            style: theme.textTheme.bodyMedium
                                ?.copyWith(color: Couleurs.rouge)),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: Espace.x2),
            OutlinedButton(
              onPressed: peutDemander ? onDemander : null,
              child: enCours
                  ? const SizedBox(
                      width: Tailles.icone,
                      height: Tailles.icone,
                      child: CircularProgressIndicator(strokeWidth: Tailles.trait),
                    )
                  : Text(termine
                      ? 'Tous les indices ont été donnés'
                      : !enLigne
                          ? 'Indices disponibles avec du réseau'
                          : 'Demander un indice (${niveauIndice + 1} sur $_niveauMax)'),
            ),
          ],
        ),
      ),
    );
  }
}
