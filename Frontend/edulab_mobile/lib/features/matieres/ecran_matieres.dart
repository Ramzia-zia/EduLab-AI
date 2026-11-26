// Écran : lib/features/matieres/ecran_matieres.dart
// Route appelée : GET /experiences (la progression est calculée avec le champ `etat`).
// Il n'existe pas de route « matières » dans le contrat : proposition à valider.
// États : chargement (cercle), vide (« Aucune matière »), erreur (message + réessayer).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/format.dart';
import '../../core/routes/routes.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/vue_async.dart';
import '../experiences/etat_experiences.dart';

class EcranMatieres extends ConsumerWidget {
  const EcranMatieres({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return VueAsync<List<ExperienceResume>>(
      valeur: ref.watch(resumesProvider),
      estVide: (l) => l.isEmpty,
      messageVide: 'Aucune matière disponible pour le moment.',
      iconeVide: Icons.menu_book_outlined,
      onReessayer: () => ref.invalidate(resumesProvider),
      donnees: (experiences) {
        final matieres = {for (final e in experiences) e.matiere}.toList()..sort();
        return ListView(
          padding: const EdgeInsets.all(Espace.x3),
          children: [
            Semantics(
              header: true,
              child: Text('Matières',
                  style: Theme.of(context).textTheme.headlineMedium),
            ),
            const SizedBox(height: Espace.x2),
            for (final m in matieres)
              Padding(
                padding: const EdgeInsets.only(bottom: Espace.x2),
                child: _CarteMatiere(
                  matiere: m,
                  experiences:
                      experiences.where((e) => e.matiere == m).toList(),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _CarteMatiere extends StatelessWidget {
  const _CarteMatiere({required this.matiere, required this.experiences});

  final String matiere;
  final List<ExperienceResume> experiences;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final faites = experiences.where((e) => e.etat == 'termine').length;
    final total = experiences.length;
    final couleur = Couleurs.pourMatiere(matiere);
    return Semantics(
      button: true,
      label:
          '${libelleMatiere(matiere)}, $faites expériences terminées sur $total',
      excludeSemantics: true,
      child: Material(
        color: Couleurs.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          side: const BorderSide(color: Couleurs.bordure),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          onTap: () => context.go('${Routes.experiences}?matiere=$matiere'),
          child: Padding(
            padding: const EdgeInsets.all(Espace.x2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.circle, color: couleur, size: Tailles.icone),
                    const SizedBox(width: Espace.x1),
                    Expanded(
                      child: Text(libelleMatiere(matiere),
                          style: theme.textTheme.titleMedium),
                    ),
                    Text('$faites / $total', style: theme.textTheme.labelMedium),
                  ],
                ),
                const SizedBox(height: Espace.x2),
                ClipRRect(
                  borderRadius: BorderRadius.circular(Tailles.rayonPetit),
                  child: LinearProgressIndicator(
                    value: total == 0 ? 0 : faites / total,
                    minHeight: Espace.x1,
                    color: couleur,
                    backgroundColor: Couleurs.fondTeal,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
