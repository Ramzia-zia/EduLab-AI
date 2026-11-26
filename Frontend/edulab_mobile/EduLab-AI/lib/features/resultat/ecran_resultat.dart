// Écran : lib/features/resultat/ecran_resultat.dart
// Route appelée : aucune (la tentative vient de la base locale ; envoi par POST /tentatives/sync).
// États : chargement (cercle), vide (« Tentative introuvable »), erreur (message + réessayer).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/format.dart';
import '../../core/fournisseurs.dart';
import '../../core/routes/routes.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/carte.dart';
import '../../core/widgets/vue_async.dart';

final tentativeProvider =
    FutureProvider.autoDispose.family<Tentative?, String>(
  (ref, id) => ref.watch(depotLocalProvider).lireTentative(id),
);

class EcranResultat extends ConsumerWidget {
  const EcranResultat({super.key, required this.tentativeId});

  final String tentativeId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Résultat'),
        leading: IconButton(
          tooltip: 'Retour aux expériences',
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(Routes.experiences),
        ),
      ),
      body: VueAsync<Tentative?>(
        valeur: ref.watch(tentativeProvider(tentativeId)),
        estVide: (t) => t == null,
        messageVide: 'Tentative introuvable sur ce téléphone.',
        onReessayer: () => ref.invalidate(tentativeProvider(tentativeId)),
        donnees: (t) => _Corps(tentative: t!),
      ),
    );
  }
}

class _Corps extends StatelessWidget {
  const _Corps({required this.tentative});

  final Tentative tentative;

  String _valeur(String cle) {
    final v = tentative.resultat?[cle];
    return v is num ? formaterNombre(v.toDouble(), 2) : '—';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: Tailles.largeurFormulaire),
        child: ListView(
          padding: const EdgeInsets.all(Espace.x3),
          children: [
            Text(libelleMateriel(tentative.experienceId),
                style: theme.textTheme.headlineMedium),
            const SizedBox(height: Espace.x1),
            Text(libelleStatutTentative(tentative.statut),
                style: theme.textTheme.bodySmall),
            const SizedBox(height: Espace.x3),
            Carte(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Ton dosage', style: theme.textTheme.titleMedium),
                  const SizedBox(height: Espace.x2),
                  _Ligne(
                      libelle: 'Volume versé',
                      valeur: '${_valeur('volume_verse_ml')} mL'),
                  const SizedBox(height: Espace.x1),
                  _Ligne(
                      libelle: 'Volume équivalent',
                      valeur: '${_valeur('volume_equivalent_ml')} mL'),
                ],
              ),
            ),
            const SizedBox(height: Espace.x3),
            FilledButton(
              onPressed: () => context.go(Routes.quiz),
              child: const Text('Passer au quiz de bilan'),
            ),
            const SizedBox(height: Espace.x2),
            OutlinedButton(
              onPressed: () => context.go(Routes.experiences),
              child: const Text('Retour aux expériences'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Ligne extends StatelessWidget {
  const _Ligne({required this.libelle, required this.valeur});

  final String libelle;
  final String valeur;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$libelle : $valeur',
      excludeSemantics: true,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(libelle),
          Text(valeur, style: Theme.of(context).textTheme.labelLarge),
        ],
      ),
    );
  }
}
