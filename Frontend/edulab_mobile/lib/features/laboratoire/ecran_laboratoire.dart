// Écran : lib/features/laboratoire/ecran_laboratoire.dart
// Affiche la démo 3D labo_core dans un iframe (web uniquement).
// Sur Android, affiche un message d'indisponibilité.
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/routes/routes.dart';
// ignore: avoid_web_libraries_in_flutter
import 'iframe_laboratoire.dart'
    if (dart.library.io) 'iframe_laboratoire_stub.dart';

class EcranLaboratoire extends StatelessWidget {
  const EcranLaboratoire({super.key, required this.experienceId});

  final String experienceId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laboratoire'),
        leading: IconButton(
          tooltip: 'Retour aux expériences',
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(Routes.experiences),
        ),
      ),
      body: kIsWeb
          ? IframeLaboratoire(
              experienceId: experienceId,
              onComplete: (id) => context.go(Routes.resultat(id)),
            )
          : const _NonDisponibleMobile(),
    );
  }
}

class _NonDisponibleMobile extends StatelessWidget {
  const _NonDisponibleMobile();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.computer_outlined,
                size: 64, color: theme.colorScheme.outline),
            const SizedBox(height: 16),
            Text(
              'Simulation disponible sur le web uniquement',
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Ouvre cette expérience depuis un navigateur pour accéder à l\'interface 3D.',
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
