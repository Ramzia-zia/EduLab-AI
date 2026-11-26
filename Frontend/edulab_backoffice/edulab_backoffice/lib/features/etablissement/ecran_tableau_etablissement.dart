// Routes : [AJOUT] GET /etablissements/{id} (detail) ; comptes : voir ecran_comptes.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth/session.dart';
import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';

class EcranTableauEtablissement extends ConsumerWidget {
  const EcranTableauEtablissement({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionProvider);
    return EtatAsync<TableauEtablissement>(
      valeur: ref.watch(tableauEtablissementProvider),
      sur_reessayer: () => ref.invalidate(tableauEtablissementProvider),
      construire: (d) => PageDefilante(enfants: [
        EnTetePage(
          titre: 'Bonjour ${session?.nom ?? ''}',
          avec_salut: true,
          sous_titre: 'Consultez les informations de votre établissement.',
        ),
        Rangee2(
          flex_gauche: 3,
          flex_droite: 2,
          gauche: Panneau(
            enfant: Row(
              children: [
                SvgPicture.asset('assets/images/batiment.svg',
                    width: 96,
                    height: 80,
                    semanticsLabel: 'Illustration d\'un établissement'),
                const SizedBox(width: Espace.m),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${d.nom}',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: Espace.xs),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: Espace.xs, vertical: 4),
                        decoration: BoxDecoration(
                            color: Couleurs.vertClair,
                            borderRadius: BorderRadius.circular(Espace.s)),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.circle,
                                size: 10, color: Couleurs.vertGraphique),
                            const SizedBox(width: 6),
                            Text(
                                d.actif
                                    ? 'Établissement actif'
                                    : 'Établissement inactif',
                                style: const TextStyle(
                                    fontSize: Taille.texte,
                                    color: Couleurs.vertGraphique,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      LienAction(
                          libelle: 'Voir les détails',
                          sur_appui: () =>
                              context.go('/etablissement/parametres')),
                    ],
                  ),
                ),
              ],
            ),
          ),
          droite: GrilleStats(max_colonnes: 2, enfants: [
            TuileStat(
                icone: Icons.groups_outlined,
                libelle: 'Enseignants',
                valeur: d.nb_enseignants?.toString() ?? '—'),
            TuileStat(
                icone: Icons.school_outlined,
                libelle: 'Élèves',
                valeur: d.nb_eleves?.toString() ?? '—'),
          ]),
        ),
        Rangee2(
          flex_gauche: 3,
          flex_droite: 2,
          gauche: Panneau(
            titre: 'Gestion des comptes',
            enfant: const MessageEtat(
              icone: Icons.info_outline,
              message:
                  'Les routes sécurisées de gestion des comptes ne sont pas encore disponibles.',
            ),
          ),
          droite: Panneau(
            titre: 'Activité récente',
            libelle_lien: 'Voir tout',
            sur_lien: () => context.go('/etablissement/eleves'),
            enfant: ListeActivites(lignes: [
              for (final a in d.activites)
                (icone: a.icone, texte: a.texte, quand: a.il_y_a),
            ]),
          ),
        ),
      ]),
    );
  }
}
