// Route : GET /stats/etablissements (contrat v0.1, role ministere, agrege)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';

class EcranSuiviEtablissements extends ConsumerWidget {
  const EcranSuiviEtablissements({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return EtatAsync<List<StatEtablissement>>(
      valeur: ref.watch(statsEtablissementsProvider),
      sur_reessayer: () => ref.invalidate(statsEtablissementsProvider),
      est_vide: (l) => l.isEmpty,
      message_vide: 'Aucun établissement à afficher pour le moment.',
      construire: (stats) => PageDefilante(enfants: [
        const EnTetePage(
          titre: 'Suivi des établissements',
          sous_titre:
              'Indicateurs agrégés par établissement, sans données nominatives.',
        ),
        Panneau(
          enfant: Column(
            children: [
              for (var i = 0; i < stats.length; i++) ...[
                if (i > 0) const Divider(height: 1),
                _LigneStat(stat: stats[i]),
              ],
            ],
          ),
        ),
      ]),
    );
  }
}

class _LigneStat extends StatelessWidget {
  const _LigneStat({required this.stat});
  final StatEtablissement stat;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < Largeur.compact;
    if (stat.matiere != null) {
      final actif = stat.nb_eleves_actifs == null
          ? '—'
          : '${stat.nb_eleves_actifs} élèves actifs';
      final tentatives = stat.nombre_tentatives == null
          ? '—'
          : '${stat.nombre_tentatives} tentatives';
      final score = stat.score_moyen == null
          ? '—'
          : 'score moyen ${stat.score_moyen!.toStringAsFixed(1)}%';
      final informations = '$actif · $tentatives · $score';
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: Espace.xs),
        child: compact
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(stat.nom,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text('${stat.matiere} · $informations'),
                ],
              )
            : Row(
                children: [
                  Expanded(flex: 2, child: Text(stat.nom)),
                  Expanded(flex: 1, child: Text(stat.matiere!)),
                  Expanded(flex: 3, child: Text(informations)),
                ],
              ),
      );
    }
    final reussite = '${(stat.taux_reussite * 100).round()}% de réussite';
    final progression =
        '+${(stat.progression_moyenne * 100).round()}% de progression';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Espace.xs),
      child: compact
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(stat.nom,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(
                    '${stat.commune} · ${stat.nb_eleves_actifs} élèves actifs'),
                Text('$reussite · $progression'),
              ],
            )
          : Row(
              children: [
                Expanded(
                    flex: 3,
                    child: Text(stat.nom,
                        style: const TextStyle(fontWeight: FontWeight.w700))),
                Expanded(flex: 2, child: Text(stat.commune)),
                Expanded(
                    flex: 2,
                    child: Text('${stat.nb_eleves_actifs} élèves actifs')),
                Expanded(flex: 2, child: Text(reussite)),
                Expanded(flex: 2, child: Text(progression)),
              ],
            ),
    );
  }
}
