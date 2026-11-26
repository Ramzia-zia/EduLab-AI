import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../theme/theme.dart';

/// Affiche les trois etats d'un ecran : chargement, vide, erreur.
class EtatAsync<T> extends StatelessWidget {
  const EtatAsync({
    super.key,
    required this.valeur,
    required this.construire,
    required this.sur_reessayer,
    this.est_vide,
    this.message_vide = 'Aucune donnée à afficher pour le moment.',
  });

  final AsyncValue<T> valeur;
  final Widget Function(T donnees) construire;
  final VoidCallback sur_reessayer;
  final bool Function(T donnees)? est_vide;
  final String message_vide;

  @override
  Widget build(BuildContext context) {
    return valeur.when(
      loading: () => Center(
        child: Semantics(
          label: 'Chargement en cours',
          child: const CircularProgressIndicator(color: Couleurs.menu),
        ),
      ),
      error: (_, __) => MessageEtat(
        icone: Icons.error_outline,
        couleur: Couleurs.rouge,
        message:
            'Impossible de charger les données. Vérifie ta connexion puis réessaie.',
        libelle_action: 'Réessayer',
        sur_action: sur_reessayer,
      ),
      data: (donnees) => (est_vide?.call(donnees) ?? false)
          ? MessageEtat(icone: Icons.inbox_outlined, message: message_vide)
          : construire(donnees),
    );
  }
}

class MessageEtat extends StatelessWidget {
  const MessageEtat({
    super.key,
    required this.icone,
    required this.message,
    this.couleur = Couleurs.texteDiscret,
    this.libelle_action,
    this.sur_action,
  });
  final IconData icone;
  final String message;
  final Color couleur;
  final String? libelle_action;
  final VoidCallback? sur_action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Espace.l),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icone, size: Espace.xl, color: couleur),
            const SizedBox(height: Espace.s),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Couleurs.texte)),
            if (libelle_action != null) ...[
              const SizedBox(height: Espace.s),
              ElevatedButton(
                  onPressed: sur_action, child: Text(libelle_action!)),
            ],
          ],
        ),
      ),
    );
  }
}
