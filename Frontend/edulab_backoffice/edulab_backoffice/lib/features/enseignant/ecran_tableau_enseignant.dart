// Route : [AJOUT] GET /enseignant/tableau_de_bord (absente du contrat v0.1)
// Les classes viennent de GET /classes (contrat).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/auth/session.dart';
import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';

class EcranTableauEnseignant extends ConsumerWidget {
  const EcranTableauEnseignant({super.key});

  static const _couleursClasses = [
    Couleurs.bleu,
    Couleurs.rose,
    Couleurs.vertGraphique
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    return EtatAsync<TableauEnseignant>(
      valeur: ref.watch(tableauEnseignantProvider),
      sur_reessayer: () => ref.invalidate(tableauEnseignantProvider),
      construire: (d) => PageDefilante(enfants: [
        EnTetePage(
          titre: 'Bonjour ${session?.nom ?? ''}',
          avec_salut: true,
          sous_titre:
              'Gérez vos classes et suivez la progression de vos élèves.',
        ),
        GrilleStats(enfants: [
          TuileStat(
              icone: Icons.groups_outlined,
              libelle: 'Mes classes',
              valeur: '${d.nb_classes}'),
          TuileStat(
              icone: Icons.menu_book_outlined,
              libelle: 'Mes cours',
              valeur: d.nb_cours?.toString() ?? '—'),
          TuileStat(
              icone: Icons.person_outline,
              libelle: 'Mes élèves',
              valeur: '${d.nb_eleves}'),
          TuileStat(
              icone: Icons.emoji_events_outlined,
              libelle: 'Score moyen',
              valeur: '${d.taux_reussite.round()}%',
              couleur: Couleurs.jaune),
        ]),
        Rangee2(
          flex_gauche: 1,
          flex_droite: 1,
          gauche: Panneau(
            titre: 'Mes classes',
            libelle_lien: 'Voir toutes',
            sur_lien: () => context.go('/enseignant/classes'),
            enfant: Column(
              children: [
                for (var i = 0; i < d.classes.length; i++) ...[
                  if (i > 0) const Divider(height: 1),
                  _LigneClasse(
                      classe: d.classes[i],
                      couleur: _couleursClasses[i % _couleursClasses.length]),
                ],
              ],
            ),
          ),
          droite: Panneau(
            enfant: Column(
              children: [
                SizedBox(
                  height: 200,
                  child: SvgPicture.asset('assets/images/enseignante.svg',
                      semanticsLabel: 'Illustration d\'une enseignante'),
                ),
                const SizedBox(height: Espace.xs),
                const Text(
                    'Créez des expériences interactives pour rendre vos cours plus vivants !',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: Espace.s),
                BoutonFleche(
                    libelle: 'Accéder à mes cours',
                    sur_appui: () => context.go('/enseignant/cours')),
              ],
            ),
          ),
        ),
        Panneau(
          titre: 'Activités récentes',
          libelle_lien: 'Voir tout',
          sur_lien: () => context.go('/enseignant/resultats'),
          enfant: ListeActivites(lignes: [
            for (final a in d.activites)
              (icone: a.icone, texte: a.texte, quand: a.il_y_a),
          ]),
        ),
      ]),
    );
  }
}

class _LigneClasse extends StatelessWidget {
  const _LigneClasse({required this.classe, required this.couleur});
  final ClasseResume classe;
  final Color couleur;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.go('/enseignant/classes/${classe.id}'),
      child: ConstrainedBox(
        constraints:
            const BoxConstraints(minHeight: Taille.zoneTactile + Espace.xs),
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: couleur,
              child: Text(classe.abreviation,
                  style: const TextStyle(
                      color: Couleurs.blanc, fontWeight: FontWeight.w800)),
            ),
            const SizedBox(width: Espace.s),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(classe.nom,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text(
                      classe.nb_eleves == null
                          ? 'Niveau ${classe.niveau}'
                          : '${classe.nb_eleves} élèves',
                      style: const TextStyle(color: Couleurs.texteDiscret)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }
}
