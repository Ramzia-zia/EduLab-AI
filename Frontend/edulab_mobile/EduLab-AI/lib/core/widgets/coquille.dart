import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/horsligne/etat_sync.dart';
import '../reseau/reseau.dart';
import '../theme/theme.dart';
import 'carte.dart';

class _Destination {
  const _Destination(this.icone, this.libelle);
  final IconData icone;
  final String libelle;
}

const _destinations = [
  _Destination(Icons.home_outlined, 'Accueil'),
  _Destination(Icons.menu_book_outlined, 'Matières'),
  _Destination(Icons.science_outlined, 'Expériences'),
  _Destination(Icons.fact_check_outlined, 'Quiz'),
  _Destination(Icons.person_outline, 'Profil'),
];

/// Navigation : barre en bas sur compact, menu latéral sur moyen et large.
class Coquille extends StatelessWidget {
  const Coquille({super.key, required this.shell});

  final StatefulNavigationShell shell;

  void _aller(int i) => shell.goBranch(i, initialLocation: i == shell.currentIndex);

  @override
  Widget build(BuildContext context) {
    final largeur = Largeur.depuis(context);
    final corps = Column(
      children: [
        const BandeauHorsLigne(),
        Expanded(child: shell),
      ],
    );

    if (largeur == Largeur.compact) {
      return Scaffold(
        body: SafeArea(child: corps),
        bottomNavigationBar: NavigationBar(
          selectedIndex: shell.currentIndex,
          onDestinationSelected: _aller,
          destinations: [
            for (final d in _destinations)
              NavigationDestination(icon: Icon(d.icone), label: d.libelle),
          ],
        ),
      );
    }

    final etendu = largeur == Largeur.large;
    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            NavigationRail(
              selectedIndex: shell.currentIndex,
              onDestinationSelected: _aller,
              extended: etendu,
              labelType: etendu ? null : NavigationRailLabelType.all,
              destinations: [
                for (final d in _destinations)
                  NavigationRailDestination(
                      icon: Icon(d.icone), label: Text(d.libelle)),
              ],
            ),
            const VerticalDivider(),
            Expanded(child: corps),
          ],
        ),
      ),
    );
  }
}

/// Visible seulement sans réseau ; indique aussi ce qui attend d'être envoyé.
class BandeauHorsLigne extends ConsumerWidget {
  const BandeauHorsLigne({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enLigne = ref.watch(enLigneProvider).valueOrNull ?? true;
    if (enLigne) return const SizedBox.shrink();
    final enAttente = ref.watch(enAttenteProvider).valueOrNull ?? 0;
    final texte = enAttente == 0
        ? 'Mode hors-ligne. Les expériences téléchargées restent disponibles.'
        : 'Mode hors-ligne. $enAttente éléments seront envoyés quand le réseau reviendra.';
    return Padding(
      padding: const EdgeInsets.all(Espace.x2),
      child: Semantics(
        liveRegion: true,
        child: Carte(
          couleur: Couleurs.fondTeal,
          child: Row(
            children: [
              const Icon(Icons.cloud_off_outlined, color: Couleurs.teal),
              const SizedBox(width: Espace.x2),
              Expanded(
                child: Text(texte, style: Theme.of(context).textTheme.bodyMedium),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
