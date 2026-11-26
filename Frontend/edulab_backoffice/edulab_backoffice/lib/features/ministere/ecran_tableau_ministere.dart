// Route : [AJOUT] GET /ministere/tableau_de_bord (absente du contrat v0.1)
// Indicateurs agreges seulement. Jamais de noms d'eleves.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';
import '../../core/widgets/graphiques.dart';

class EcranTableauMinistere extends ConsumerWidget {
  const EcranTableauMinistere({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return EtatAsync<TableauMinistere>(
      valeur: ref.watch(tableauMinistereProvider),
      sur_reessayer: () => ref.invalidate(tableauMinistereProvider),
      construire: (d) => PageDefilante(enfants: [
        const EnTetePage(
          titre: 'Bonjour Ministre',
          avec_salut: true,
          sous_titre: 'Suivez l\'impact d\'EduLab AI sur l\'éducation au Togo.',
        ),
        GrilleStats(enfants: [
          TuileStat(
              icone: Icons.account_balance_outlined,
              libelle: 'Établissements avec activité',
              valeur: '${d.nb_etablissements}'),
          TuileStat(
              icone: Icons.groups_outlined,
              libelle: 'Enseignants',
              valeur: d.nb_enseignants == null
                  ? '—'
                  : _milliers(d.nb_enseignants!)),
          TuileStat(
              icone: Icons.school_outlined,
              libelle: 'Élèves',
              valeur: d.nb_eleves == null ? '—' : _milliers(d.nb_eleves!)),
          TuileStat(
              icone: Icons.bar_chart_outlined,
              libelle: 'Taux d’utilisation',
              valeur: d.taux_utilisation == null
                  ? '—'
                  : '${d.taux_utilisation!.round()}%'),
        ]),
        Rangee2(
          gauche: Panneau(
            titre: 'Score moyen par matière',
            enfant: GraphiqueBarres(parts: d.performance_regions),
          ),
          droite: Panneau(
            titre: 'Par matière',
            enfant: Column(
              children: [
                _CartePerformance(regions: d.performance_regions),
                const SizedBox(height: Espace.s),
              ],
            ),
          ),
        ),
      ]),
    );
  }

  static String _milliers(int n) {
    final s = n.toString();
    final b = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) b.write(' ');
      b.write(s[i]);
    }
    return b.toString();
  }
}

class _CartePerformance extends StatelessWidget {
  const _CartePerformance({required this.regions});
  final List<PartRegion> regions;

  @override
  Widget build(BuildContext context) {
    if (regions.isEmpty) return const Text('Aucun score enregistré.');
    return Column(
      children: [
        for (final region in regions)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(region.nom),
            trailing: Text('${region.pourcentage.toStringAsFixed(1)}%'),
          ),
      ],
    );
  }
}
