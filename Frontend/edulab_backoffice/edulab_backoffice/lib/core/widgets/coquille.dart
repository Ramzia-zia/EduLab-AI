import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/session.dart';
import '../routes/menu.dart';
import '../theme/theme.dart';
import 'graphiques.dart';
import 'logo.dart';

/// Cadre commun : menu lateral vert, barre du haut, contenu.
/// Large (> 1024) : menu fixe. Moyen et compact : menu dans un tiroir.
class Coquille extends ConsumerStatefulWidget {
  const Coquille({super.key, required this.chemin, required this.enfant});
  final String chemin;
  final Widget enfant;

  @override
  ConsumerState<Coquille> createState() => _EtatCoquille();
}

class _EtatCoquille extends ConsumerState<Coquille> {
  final _cle = GlobalKey<ScaffoldState>();
  bool _menuVisible = true;

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider);
    if (session == null) return const SizedBox.shrink();
    final large = MediaQuery.sizeOf(context).width > Largeur.large;

    final menu = MenuLateral(
      items: menuPour(session.role),
      chemin: widget.chemin,
      sur_choix: (chemin) {
        if (!large) _cle.currentState?.closeDrawer();
        context.go(chemin);
      },
      sur_deconnexion: () => ref.read(sessionProvider.notifier).deconnecter(),
    );

    return Scaffold(
      key: _cle,
      drawer: large ? null : Drawer(width: Largeur.menu, child: menu),
      body: Row(
        children: [
          if (large && _menuVisible)
            SizedBox(width: Largeur.menu, child: menu),
          Expanded(
            child: Column(
              children: [
                BarreHaut(
                  session: session,
                  sur_menu: large
                      ? () => setState(() => _menuVisible = !_menuVisible)
                      : () => _cle.currentState?.openDrawer(),
                  sur_deconnexion: () =>
                      ref.read(sessionProvider.notifier).deconnecter(),
                ),
                Expanded(child: widget.enfant),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class MenuLateral extends StatelessWidget {
  const MenuLateral({
    super.key,
    required this.items,
    required this.chemin,
    required this.sur_choix,
    required this.sur_deconnexion,
  });
  final List<ItemMenu> items;
  final String chemin;
  final ValueChanged<String> sur_choix;
  final VoidCallback sur_deconnexion;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Couleurs.menu,
      child: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.all(Espace.s),
              child: Align(
                  alignment: Alignment.centerLeft, child: LogoEduLab()),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: Espace.xs),
                children: [
                  for (final item in items)
                    _LigneMenu(
                      libelle: item.libelle,
                      icone: item.icone,
                      actif: chemin.startsWith(item.chemin),
                      sur_appui: () => sur_choix(item.chemin),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: Espace.xs),
              child: _LigneMenu(
                libelle: 'Se déconnecter',
                icone: Icons.logout,
                actif: false,
                sur_appui: sur_deconnexion,
              ),
            ),
            const BandeDrapeau(),
          ],
        ),
      ),
    );
  }
}

class _LigneMenu extends StatelessWidget {
  const _LigneMenu({
    required this.libelle,
    required this.icone,
    required this.actif,
    required this.sur_appui,
  });
  final String libelle;
  final IconData icone;
  final bool actif;
  final VoidCallback sur_appui;

  @override
  Widget build(BuildContext context) {
    final couleur = actif ? Couleurs.texte : Couleurs.blanc;
    return Semantics(
      button: true,
      selected: actif,
      label: libelle,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Material(
          color: actif ? Couleurs.menuActif : Colors.transparent,
          borderRadius: BorderRadius.circular(Rayon.carte),
          child: InkWell(
            borderRadius: BorderRadius.circular(Rayon.carte),
            onTap: sur_appui,
            child: ConstrainedBox(
              constraints:
                  const BoxConstraints(minHeight: Taille.zoneTactile),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: Espace.s, vertical: Espace.xs),
                child: Row(
                  children: [
                    Icon(icone, color: couleur, size: 24),
                    const SizedBox(width: Espace.s),
                    Expanded(
                      child: ExcludeSemantics(
                        child: Text(libelle,
                            style: TextStyle(
                                fontSize: Taille.texte,
                                fontWeight: FontWeight.w700,
                                color: couleur)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class BarreHaut extends StatelessWidget {
  const BarreHaut({
    super.key,
    required this.session,
    required this.sur_menu,
    required this.sur_deconnexion,
  });
  final Session session;
  final VoidCallback sur_menu;
  final VoidCallback sur_deconnexion;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < Largeur.compact;
    return Container(
      height: Espace.xl + Espace.s,
      padding: const EdgeInsets.symmetric(horizontal: Espace.xs),
      child: Row(
        children: [
          IconButton(
            tooltip: 'Menu',
            onPressed: sur_menu,
            icon: const Icon(Icons.menu),
          ),
          const Spacer(),
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text(
                      'Notifications : route à ajouter au contrat (voir le document des ajouts).')),
            ),
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.notifications_none),
                Positioned(
                  right: -6,
                  top: -6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5),
                    decoration: const BoxDecoration(
                        color: Couleurs.rouge, shape: BoxShape.circle),
                    child: const Text('2',
                        style: TextStyle(
                            color: Couleurs.blanc,
                            fontSize: 11,
                            fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: Espace.xs),
          PopupMenuButton<String>(
            tooltip: 'Compte',
            onSelected: (_) => sur_deconnexion(),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'sortir', child: Text('Se déconnecter')),
            ],
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: Taille.zoneTactile),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircleAvatar(
                    backgroundColor: Couleurs.menu,
                    child: Text(session.initiales,
                        style: const TextStyle(
                            color: Couleurs.blanc,
                            fontSize: Taille.texte,
                            fontWeight: FontWeight.w700)),
                  ),
                  if (!compact) ...[
                    const SizedBox(width: Espace.xs),
                    Text(session.nom,
                        style: const TextStyle(
                            fontSize: Taille.texte,
                            fontWeight: FontWeight.w700)),
                  ],
                  const Icon(Icons.keyboard_arrow_down),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
