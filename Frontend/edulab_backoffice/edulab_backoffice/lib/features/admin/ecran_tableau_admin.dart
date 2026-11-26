// Route : [AJOUT] GET /admin/tableau_de_bord (absente du contrat v0.1)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';
import '../../core/widgets/graphiques.dart';
import '../../core/widgets/logo.dart';

const _jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const _mois = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août',
  'Sept.', 'Oct.', 'Nov.', 'Déc.'
];

String dateDuJour() {
  final n = DateTime.now();
  return '${_jours[n.weekday - 1]}, ${n.day} ${_mois[n.month - 1]} ${n.year}';
}

class PastilleDate extends StatelessWidget {
  const PastilleDate({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: Espace.s, vertical: Espace.xs),
      decoration: BoxDecoration(
        border: Border.all(color: Couleurs.bordure),
        borderRadius: BorderRadius.circular(Rayon.carte),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.calendar_today_outlined, size: 18),
          const SizedBox(width: Espace.xs),
          Text(dateDuJour(),
              style: const TextStyle(
                  fontSize: Taille.texte, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class EcranTableauAdmin extends ConsumerWidget {
  const EcranTableauAdmin({super.key});

  static const _couleursRegions = [
    Couleurs.vertGraphique,
    Couleurs.menu,
    Couleurs.rouge,
    Couleurs.jaune,
    Couleurs.vert,
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return EtatAsync<TableauAdmin>(
      valeur: ref.watch(tableauAdminProvider),
      sur_reessayer: () => ref.invalidate(tableauAdminProvider),
      construire: (d) => PageDefilante(enfants: [
        const EnTetePage(
          titre: 'Bonjour Admin',
          avec_salut: true,
          sous_titre: 'Voici un aperçu global de la plateforme EduLab AI.',
          droite: PastilleDate(),
        ),
        GrilleStats(enfants: [
          TuileStat(
              icone: Icons.account_balance_outlined,
              libelle: 'Établissements',
              valeur: '${d.nb_etablissements}'),
          TuileStat(
              icone: Icons.groups_outlined,
              libelle: 'Enseignants',
              valeur: _milliers(d.nb_enseignants)),
          TuileStat(
              icone: Icons.diversity_3_outlined,
              libelle: 'Élèves',
              valeur: _milliers(d.nb_eleves)),
          TuileStat(
              icone: Icons.bar_chart_outlined,
              libelle: 'Taux d\'utilisation',
              valeur: '${d.taux_utilisation.round()}%'),
        ]),
        Rangee2(
          gauche: Panneau(
            titre: 'Évolution globale de la plateforme',
            droite: const Text('12 derniers mois',
                style: TextStyle(
                    fontSize: Taille.texte, fontWeight: FontWeight.w600)),
            enfant: GraphiqueCourbe(
                libelles: d.evolution_libelles, valeurs: d.evolution_valeurs),
          ),
          droite: Panneau(
            titre: 'Répartition par région',
            enfant: _RepartitionRegions(
                parts: d.repartition_regions, couleurs: _couleursRegions),
          ),
        ),
        Rangee2(
          gauche: Panneau(
            titre: 'Activités récentes',
            libelle_lien: 'Voir tout',
            sur_lien: () => context.go('/admin/statistiques'),
            enfant: ListeActivites(lignes: [
              for (final a in d.activites)
                (icone: a.icone, texte: a.texte, quand: a.il_y_a),
            ]),
          ),
          droite: Panneau(
            enfant: Row(
              children: [
                const LogoEduLab(couleur_texte: Couleurs.texte, taille: 40),
                const SizedBox(width: Espace.s),
                const Expanded(
                  child: Text('pour une éducation plus pratique au Togo',
                      style: TextStyle(fontSize: Taille.texte)),
                ),
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

class _RepartitionRegions extends StatelessWidget {
  const _RepartitionRegions({required this.parts, required this.couleurs});
  final List<PartRegion> parts;
  final List<Color> couleurs;

  @override
  Widget build(BuildContext context) {
    final legende = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < parts.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: Espace.xs / 2),
            child: Row(
              children: [
                Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                        color: couleurs[i % couleurs.length],
                        shape: BoxShape.circle)),
                const SizedBox(width: Espace.xs),
                Expanded(child: Text(parts[i].nom)),
                Text('${parts[i].pourcentage.round()}%',
                    style: const TextStyle(fontWeight: FontWeight.w700)),
              ],
            ),
          ),
      ],
    );
    return LayoutBuilder(builder: (context, c) {
      final anneau = SizedBox(
        width: 160,
        child: GraphiqueAnneau(parts: parts, couleurs: couleurs),
      );
      if (c.maxWidth < 360) {
        return Column(children: [anneau, const SizedBox(height: Espace.s), legende]);
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [anneau, const SizedBox(width: Espace.s), Expanded(child: legende)],
      );
    });
  }
}
