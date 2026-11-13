// Écran : lib/features/experiences/ecran_experiences.dart
// Route appelée : GET /experiences (contrat chap. 3, liste d'ExperienceResume).
// États : chargement (cercle), vide (« Aucune expérience »), erreur (message + réessayer).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/format.dart';
import '../../core/routes/routes.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/vue_async.dart';
import 'etat_experiences.dart';

class EcranExperiences extends ConsumerStatefulWidget {
  const EcranExperiences({super.key, this.matiereInitiale});

  final String? matiereInitiale;

  @override
  ConsumerState<EcranExperiences> createState() => _EtatEcranExperiences();
}

class _EtatEcranExperiences extends ConsumerState<EcranExperiences> {
  late String? _matiere = widget.matiereInitiale;

  @override
  void didUpdateWidget(covariant EcranExperiences ancien) {
    super.didUpdateWidget(ancien);
    if (ancien.matiereInitiale != widget.matiereInitiale) {
      _matiere = widget.matiereInitiale;
    }
  }

  @override
  Widget build(BuildContext context) {
    final valeur = ref.watch(resumesProvider);
    return VueAsync<List<ExperienceResume>>(
      valeur: valeur,
      estVide: (l) => l.isEmpty,
      messageVide: 'Aucune expérience disponible pour le moment.',
      iconeVide: Icons.science_outlined,
      onReessayer: () => ref.invalidate(resumesProvider),
      donnees: (toutes) {
        final matieres = {for (final e in toutes) e.matiere}.toList()..sort();
        final visibles = _matiere == null
            ? toutes
            : toutes.where((e) => e.matiere == _matiere).toList();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                  Espace.x3, Espace.x3, Espace.x3, Espace.x1),
              child: Semantics(
                header: true,
                child: Text('Expériences',
                    style: Theme.of(context).textTheme.headlineMedium),
              ),
            ),
            SizedBox(
              height: Espace.x8,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                    horizontal: Espace.x3, vertical: Espace.x1),
                children: [
                  _Filtre(
                    libelle: 'Toutes',
                    choisi: _matiere == null,
                    onTap: () => setState(() => _matiere = null),
                  ),
                  for (final m in matieres)
                    _Filtre(
                      libelle: libelleMatiere(m),
                      choisi: _matiere == m,
                      onTap: () => setState(() => _matiere = m),
                    ),
                ],
              ),
            ),
            Expanded(
              child: visibles.isEmpty
                  ? const EtatVide(
                      message: 'Aucune expérience dans cette matière.',
                      icone: Icons.science_outlined)
                  : ListView.builder(
                      padding: const EdgeInsets.all(Espace.x3),
                      itemCount: visibles.length,
                      itemBuilder: (_, i) => Padding(
                        padding: const EdgeInsets.only(bottom: Espace.x2),
                        child: _CarteExperience(experience: visibles[i]),
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }
}

class _Filtre extends StatelessWidget {
  const _Filtre({required this.libelle, required this.choisi, required this.onTap});

  final String libelle;
  final bool choisi;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: Espace.x1),
      child: Semantics(
        button: true,
        selected: choisi,
        label: 'Filtrer : $libelle',
        excludeSemantics: true,
        child: Material(
          color: choisi ? Couleurs.teal : Couleurs.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Tailles.rayon),
            side: const BorderSide(color: Couleurs.bordure),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(Tailles.rayon),
            onTap: onTap,
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                  minHeight: Tailles.zoneTactile, minWidth: Tailles.zoneTactile),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: Espace.x2),
                child: Center(
                  child: Text(
                    libelle,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: choisi ? Couleurs.surface : Couleurs.texte),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CarteExperience extends StatelessWidget {
  const _CarteExperience({required this.experience});

  final ExperienceResume experience;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final couleur = Couleurs.pourMatiere(experience.matiere);
    return Semantics(
      button: true,
      label:
          '${experience.titre}, ${libelleMatiere(experience.matiere)}, ${experience.dureeMin} minutes, '
          'difficulté ${libelleDifficulte(experience.difficulte)}, ${libelleEtat(experience.etat)}',
      excludeSemantics: true,
      child: Material(
        color: Couleurs.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          side: const BorderSide(color: Couleurs.bordure),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => context.go(Routes.laboratoire(experience.id)),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(width: Espace.x1, color: couleur),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(Espace.x2),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(libelleMatiere(experience.matiere),
                            style: theme.textTheme.bodySmall),
                        const SizedBox(height: Espace.x1),
                        Text(experience.titre, style: theme.textTheme.titleMedium),
                        const SizedBox(height: Espace.x1),
                        Wrap(
                          spacing: Espace.x2,
                          runSpacing: Espace.x1,
                          children: [
                            Text('${experience.dureeMin} min',
                                style: theme.textTheme.bodySmall),
                            Text(libelleDifficulte(experience.difficulte),
                                style: theme.textTheme.bodySmall),
                            Text(libelleEtat(experience.etat),
                                style: theme.textTheme.labelMedium
                                    ?.copyWith(color: Couleurs.teal)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(Espace.x2),
                  child: Icon(Icons.chevron_right, color: Couleurs.texteDoux),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
