import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api_provisoire/modeles.dart';
import '../theme/theme.dart';

String messageErreur(Object erreur) => switch (erreur) {
      ErreurApi(:final message) => message,
      ErreurReseau() =>
        'Pas de connexion. Réessaie quand tu as du réseau.',
      _ => 'Une erreur est survenue. Réessaie.',
    };

class EtatChargement extends StatelessWidget {
  const EtatChargement({super.key, this.libelle = 'Chargement en cours'});

  final String libelle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Semantics(
        label: libelle,
        liveRegion: true,
        child: const CircularProgressIndicator(),
      ),
    );
  }
}

class EtatVide extends StatelessWidget {
  const EtatVide({super.key, required this.message, this.icone = Icons.inbox_outlined});

  final String message;
  final IconData icone;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Espace.x3),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icone, size: Tailles.iconeGrande, color: Couleurs.texteDoux),
            const SizedBox(height: Espace.x2),
            Text(message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge),
          ],
        ),
      ),
    );
  }
}

class EtatErreur extends StatelessWidget {
  const EtatErreur({super.key, required this.message, this.onReessayer});

  final String message;
  final VoidCallback? onReessayer;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Espace.x3),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline,
                size: Tailles.iconeGrande, color: Couleurs.rouge),
            const SizedBox(height: Espace.x2),
            Semantics(
              liveRegion: true,
              child: Text(message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge),
            ),
            if (onReessayer != null) ...[
              const SizedBox(height: Espace.x2),
              OutlinedButton(
                onPressed: onReessayer,
                child: const Text('Réessayer'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Affiche les trois états d'un AsyncValue : chargement, vide, erreur.
class VueAsync<T> extends StatelessWidget {
  const VueAsync({
    super.key,
    required this.valeur,
    required this.donnees,
    this.estVide,
    this.messageVide = 'Rien à afficher pour le moment.',
    this.iconeVide = Icons.inbox_outlined,
    this.onReessayer,
  });

  final AsyncValue<T> valeur;
  final Widget Function(T donnees) donnees;
  final bool Function(T donnees)? estVide;
  final String messageVide;
  final IconData iconeVide;
  final VoidCallback? onReessayer;

  @override
  Widget build(BuildContext context) {
    return valeur.when(
      loading: () => const EtatChargement(),
      error: (e, _) =>
          EtatErreur(message: messageErreur(e), onReessayer: onReessayer),
      data: (d) => (estVide?.call(d) ?? false)
          ? EtatVide(message: messageVide, icone: iconeVide)
          : donnees(d),
    );
  }
}
