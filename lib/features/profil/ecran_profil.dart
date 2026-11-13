// Écran : lib/features/profil/ecran_profil.dart
// Routes appelées : GET /moi (session) et GET /tentatives?page=1&taille=50 (historique).
// Hors-ligne : historique lu dans la base locale.
// États : chargement (cercle), vide (« Aucune tentative »), erreur (message + réessayer).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/format.dart';
import '../../core/fournisseurs.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/carte.dart';
import '../../core/widgets/vue_async.dart';
import '../connexion/etat_session.dart';
import '../horsligne/etat_sync.dart';

final historiqueProvider = FutureProvider.autoDispose<List<Tentative>>((ref) async {
  try {
    final page = await ref.watch(apiProvider).tentatives(page: 1, taille: 50);
    return page.elements;
  } on ErreurReseau {
    return ref.watch(depotLocalProvider).historique();
  }
});

class EcranProfil extends ConsumerWidget {
  const EcranProfil({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final profil = ref.watch(sessionProvider).valueOrNull;
    final enAttente = ref.watch(enAttenteProvider).valueOrNull ?? 0;
    final historique = ref.watch(historiqueProvider);

    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.all(Espace.x3),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              Semantics(
                header: true,
                child: Text('Profil', style: theme.textTheme.headlineMedium),
              ),
              const SizedBox(height: Espace.x2),
              Carte(
                child: Row(
                  children: [
                    const Icon(Icons.person_outline,
                        size: Tailles.iconeGrande, color: Couleurs.teal),
                    const SizedBox(width: Espace.x2),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(profil?.nom ?? 'Profil inconnu',
                              style: theme.textTheme.titleMedium),
                          Text('Élève', style: theme.textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: Espace.x2),
              Carte(
                couleur: Couleurs.fondTeal,
                child: Row(
                  children: [
                    Expanded(
                      child: Text(enAttente == 0
                          ? 'Tout est envoyé.'
                          : '$enAttente éléments en attente d\'envoi.'),
                    ),
                    OutlinedButton(
                      onPressed: enAttente == 0
                          ? null
                          : () => ref.read(synchroniserProvider)(),
                      child: const Text('Envoyer'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: Espace.x3),
              Semantics(
                header: true,
                child: Text('Historique', style: theme.textTheme.titleLarge),
              ),
              const SizedBox(height: Espace.x1),
            ]),
          ),
        ),
        ..._historique(context, ref, historique),
        SliverPadding(
          padding: const EdgeInsets.all(Espace.x3),
          sliver: SliverToBoxAdapter(
            child: OutlinedButton(
              onPressed: () => ref.read(sessionProvider.notifier).deconnecter(),
              child: const Text('Se déconnecter'),
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _historique(
      BuildContext context, WidgetRef ref, AsyncValue<List<Tentative>> valeur) {
    return valeur.when(
      loading: () => [
        const SliverToBoxAdapter(
          child: SizedBox(height: Espace.x8 * 2, child: EtatChargement()),
        ),
      ],
      error: (e, _) => [
        SliverToBoxAdapter(
          child: SizedBox(
            height: Espace.x8 * 3,
            child: EtatErreur(
              message: messageErreur(e),
              onReessayer: () => ref.invalidate(historiqueProvider),
            ),
          ),
        ),
      ],
      data: (liste) {
        if (liste.isEmpty) {
          return const [
            SliverToBoxAdapter(
              child: SizedBox(
                height: Espace.x8 * 3,
                child: EtatVide(
                  message: 'Aucune tentative pour le moment. Fais une expérience !',
                  icone: Icons.history,
                ),
              ),
            ),
          ];
        }
        return [
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: Espace.x3),
            sliver: SliverList.builder(
              itemCount: liste.length,
              itemBuilder: (_, i) => _LigneTentative(tentative: liste[i]),
            ),
          ),
        ];
      },
    );
  }
}

class _LigneTentative extends StatelessWidget {
  const _LigneTentative({required this.tentative});

  final Tentative tentative;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final score = tentative.score == null ? '' : ', score ${tentative.score} sur 100';
    return Padding(
      padding: const EdgeInsets.only(bottom: Espace.x1),
      child: Semantics(
        label:
            '${libelleMateriel(tentative.experienceId)}, ${formaterDate(tentative.debut)}, '
            '${libelleStatutTentative(tentative.statut)}$score',
        excludeSemantics: true,
        child: Carte(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(libelleMateriel(tentative.experienceId),
                        style: theme.textTheme.titleMedium),
                    Text(formaterDate(tentative.debut),
                        style: theme.textTheme.bodySmall),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(libelleStatutTentative(tentative.statut),
                      style: theme.textTheme.labelMedium),
                  if (tentative.score != null)
                    Text('${tentative.score} / 100',
                        style: theme.textTheme.bodySmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
