// Écran : lib/features/accueil/ecran_accueil.dart
// Routes appelées : GET /moi (via la session). Compteur d'envoi : base locale.
// États : chargement (session en cours), vide (pas de profil), erreur (message + réessayer).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/routes/routes.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/carte.dart';
import '../../core/widgets/vue_async.dart';
import '../connexion/etat_session.dart';
import '../horsligne/etat_sync.dart';

class EcranAccueil extends ConsumerWidget {
  const EcranAccueil({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return VueAsync<Profil?>(
      valeur: ref.watch(sessionProvider),
      estVide: (p) => p == null,
      messageVide: 'Aucun profil. Connecte-toi pour continuer.',
      onReessayer: () => ref.invalidate(sessionProvider),
      donnees: (profil) => _Corps(profil: profil!),
    );
  }
}

class _Corps extends ConsumerWidget {
  const _Corps({required this.profil});

  final Profil profil;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final enAttente = ref.watch(enAttenteProvider).valueOrNull ?? 0;
    return ListView(
      padding: const EdgeInsets.all(Espace.x3),
      children: [
        Semantics(
          header: true,
          child: Text('Bienvenue, ${profil.nom}',
              style: theme.textTheme.headlineMedium),
        ),
        const SizedBox(height: Espace.x1),
        Text('Ton laboratoire, partout avec toi.', style: theme.textTheme.bodySmall),
        const SizedBox(height: Espace.x3),
        Carte(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Comprendre en faisant.', style: theme.textTheme.titleLarge),
              const SizedBox(height: Espace.x1),
              const Text('Choisis une expérience et manipule toi-même.'),
              const SizedBox(height: Espace.x2),
              FilledButton(
                onPressed: () => context.go(Routes.experiences),
                child: const Text('Voir les expériences'),
              ),
            ],
          ),
        ),
        const SizedBox(height: Espace.x2),
        Carte(
          couleur: Couleurs.fondTeal,
          child: Row(
            children: [
              const Icon(Icons.sync_outlined, color: Couleurs.teal),
              const SizedBox(width: Espace.x2),
              Expanded(
                child: Text(
                  enAttente == 0
                      ? 'Tout est envoyé.'
                      : '$enAttente éléments en attente d\'envoi.',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
