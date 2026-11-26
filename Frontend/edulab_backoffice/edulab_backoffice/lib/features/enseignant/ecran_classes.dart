// Route : GET /classes (contrat v0.1, roles enseignant et etablissement)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';

class EcranClasses extends ConsumerWidget {
  const EcranClasses(
      {super.key, required this.titre, required this.sous_titre});
  final String titre;
  final String sous_titre;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return EtatAsync<List<ClasseResume>>(
      valeur: ref.watch(classesProvider),
      sur_reessayer: () => ref.invalidate(classesProvider),
      est_vide: (l) => l.isEmpty,
      message_vide: 'Aucune classe pour le moment.',
      construire: (classes) => PageDefilante(enfants: [
        EnTetePage(titre: titre, sous_titre: sous_titre),
        Panneau(
          enfant: Column(
            children: [
              for (var i = 0; i < classes.length; i++) ...[
                if (i > 0) const Divider(height: 1),
                ListTile(
                  minTileHeight: Taille.zoneTactile + Espace.xs,
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: Couleurs.menu,
                    child: Text(classes[i].abreviation,
                        style: const TextStyle(
                            color: Couleurs.blanc,
                            fontWeight: FontWeight.w800)),
                  ),
                  title: Text(classes[i].nom,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Text(classes[i].nb_eleves == null
                      ? 'Niveau ${classes[i].niveau}'
                      : '${classes[i].nb_eleves} élèves'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () =>
                      context.go('/enseignant/classes/${classes[i].id}'),
                ),
              ],
            ],
          ),
        ),
      ]),
    );
  }
}
