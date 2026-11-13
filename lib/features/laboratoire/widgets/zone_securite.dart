// Zone 3 : sécurité. Affiche l'action bloquée et son explication courte.
import 'package:flutter/material.dart';

import '../../../core/theme/theme.dart';
import '../../../core/widgets/carte.dart';

class ZoneSecurite extends StatelessWidget {
  const ZoneSecurite({super.key, this.message});

  /// Message de la règle de sécurité qui a bloqué l'action ; null s'il n'y a pas d'alerte.
  final String? message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bloque = message != null;
    return Semantics(
      container: true,
      liveRegion: true,
      label: bloque
          ? 'Sécurité, action bloquée. $message'
          : 'Sécurité, aucune alerte',
      excludeSemantics: true,
      child: AnimatedSwitcher(
        duration: Durees.court,
        child: Carte(
          key: ValueKey(message),
          couleur: bloque ? Couleurs.fondRouge : Couleurs.fondTeal,
          bordure: bloque ? Couleurs.rouge : Couleurs.bordure,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                bloque ? Icons.shield_outlined : Icons.verified_user_outlined,
                color: bloque ? Couleurs.rouge : Couleurs.teal,
              ),
              const SizedBox(width: Espace.x2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      bloque ? 'Sécurité · Action bloquée' : 'Sécurité · Aucune alerte',
                      style: theme.textTheme.titleMedium?.copyWith(
                          color: bloque ? Couleurs.rouge : Couleurs.teal),
                    ),
                    const SizedBox(height: Espace.x1),
                    Text(bloque
                        ? message!
                        : 'Vérifie ton matériel avant de verser.'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
