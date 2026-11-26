import 'package:flutter/material.dart';

import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';

/// Tableau des comptes : Nom complet, Email, Role, Actions (maquette).
class TableComptes extends StatelessWidget {
  const TableComptes({
    super.key,
    required this.comptes,
    this.sur_modifier,
    this.sur_supprimer,
  });
  final List<Compte> comptes;
  final ValueChanged<Compte>? sur_modifier;
  final ValueChanged<Compte>? sur_supprimer;

  static String libelleRole(String role) =>
      role == 'enseignant' ? 'Enseignant' : 'Élève';

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < Largeur.compact;
    final actions = sur_modifier != null || sur_supprimer != null;
    const entete = TextStyle(
        fontSize: Taille.texte,
        fontWeight: FontWeight.w700,
        color: Couleurs.texte);
    return Column(
      children: [
        if (!compact)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: Espace.xs),
            child: Row(
              children: [
                const Expanded(flex: 3, child: Text('Nom complet', style: entete)),
                const Expanded(flex: 4, child: Text('Email', style: entete)),
                const Expanded(flex: 2, child: Text('Rôle', style: entete)),
                if (actions)
                  const SizedBox(
                      width: 2 * Taille.zoneTactile,
                      child: Text('Actions', style: entete)),
              ],
            ),
          ),
        const Divider(height: 1),
        for (final c in comptes) ...[
          ConstrainedBox(
            constraints:
                const BoxConstraints(minHeight: Taille.zoneTactile + Espace.xs),
            child: compact ? _ligneCompacte(c) : _ligneLarge(c, actions),
          ),
          const Divider(height: 1),
        ],
      ],
    );
  }

  Widget _boutons(Compte c) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (sur_modifier != null)
            IconButton(
              tooltip: 'Modifier ${c.nom}',
              onPressed: () => sur_modifier!(c),
              icon: const Icon(Icons.edit_outlined, size: 20),
            ),
          if (sur_supprimer != null)
            IconButton(
              tooltip: 'Supprimer ${c.nom}',
              onPressed: () => sur_supprimer!(c),
              icon: const Icon(Icons.delete_outline, size: 20),
            ),
        ],
      );

  Widget _ligneLarge(Compte c, bool actions) => Row(
        children: [
          Expanded(flex: 3, child: Text(c.nom)),
          Expanded(flex: 4, child: Text(c.email)),
          Expanded(
              flex: 2,
              child: Text(c.classe == null
                  ? libelleRole(c.role)
                  : '${libelleRole(c.role)} · ${c.classe}')),
          if (actions)
            SizedBox(width: 2 * Taille.zoneTactile, child: _boutons(c)),
        ],
      );

  Widget _ligneCompacte(Compte c) => Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(c.nom, style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(c.email,
                    style: const TextStyle(color: Couleurs.texteDiscret)),
                Text(libelleRole(c.role)),
              ],
            ),
          ),
          _boutons(c),
        ],
      );
}
