// Route : [AJOUT] GET /etablissements (liste). Le contrat v0.1 n'a que l'import CSV.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';

class EcranEtablissements extends ConsumerWidget {
  const EcranEtablissements({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return EtatAsync<List<EtablissementLigne>>(
      valeur: ref.watch(etablissementsProvider),
      sur_reessayer: () => ref.invalidate(etablissementsProvider),
      est_vide: (l) => l.isEmpty,
      message_vide: 'Aucun établissement pour le moment.',
      construire: (liste) => PageDefilante(enfants: [
        const EnTetePage(
          titre: 'Gestion des établissements',
          sous_titre: 'Liste des établissements inscrits sur la plateforme.',
        ),
        Panneau(
          enfant: Column(
            children: [
              for (var i = 0; i < liste.length; i++) ...[
                if (i > 0) const Divider(height: 1),
                _Ligne(e: liste[i]),
              ],
            ],
          ),
        ),
      ]),
    );
  }
}

class _Ligne extends StatelessWidget {
  const _Ligne({required this.e});
  final EtablissementLigne e;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < Largeur.compact;
    final etat = Text(e.actif ? 'Actif' : 'Inactif',
        style: TextStyle(
            fontWeight: FontWeight.w700,
            color: e.actif ? Couleurs.vertGraphique : Couleurs.texteDiscret));
    return ConstrainedBox(
      constraints: const BoxConstraints(minHeight: Taille.zoneTactile + Espace.xs),
      child: compact
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(e.nom, style: const TextStyle(fontWeight: FontWeight.w700)),
                Text('${e.commune} · ${e.region} · ${e.nb_eleves} élèves'),
                etat,
              ],
            )
          : Row(
              children: [
                Expanded(
                    flex: 3,
                    child: Text(e.nom,
                        style: const TextStyle(fontWeight: FontWeight.w700))),
                Expanded(flex: 2, child: Text(e.commune)),
                Expanded(flex: 2, child: Text(e.region)),
                Expanded(flex: 2, child: Text('${e.nb_eleves} élèves')),
                SizedBox(width: Espace.xl + Espace.m, child: etat),
              ],
            ),
    );
  }
}
