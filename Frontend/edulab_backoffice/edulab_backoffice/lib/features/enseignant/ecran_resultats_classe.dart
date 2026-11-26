// Route : GET /classes/{id}/resultats (contrat v0.1, modele ResultatsClasse)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';

/// Libelles lisibles pour les codes d'erreur du bilan (CONTRAT.md chapitre 5).
const libelles_erreurs = {
  'depassement_equivalence': 'Équivalence dépassée',
  'erreur_volume_acide': 'Volume d\'acide incorrect',
  'lecture_burette': 'Lecture de la burette',
  'debit_trop_rapide': 'Débit trop rapide',
  'angle_trop_grand': 'Angle trop grand',
  'pince_non_serree': 'Pince non serrée',
  'gants_oublies': 'Gants oubliés',
  'lunettes_oubliees': 'Lunettes oubliées',
};

class EcranResultatsClasse extends ConsumerWidget {
  const EcranResultatsClasse({super.key, required this.classe_id});
  final String classe_id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fournisseur = resultatsClasseProvider(classe_id);
    return EtatAsync<ResultatsClasse>(
      valeur: ref.watch(fournisseur),
      sur_reessayer: () => ref.invalidate(fournisseur),
      est_vide: (r) => !r.synthese && r.eleves.isEmpty,
      message_vide: 'Aucun résultat pour cette classe pour le moment.',
      construire: (r) => PageDefilante(enfants: [
        EnTetePage(
          titre: r.classe_nom,
          sous_titre: 'Résultats des élèves de la classe.',
          droite: TextButton.icon(
            onPressed: () => context.go('/enseignant/classes'),
            icon: const Icon(Icons.arrow_back, size: 16),
            label: const Text('Retour aux classes'),
          ),
        ),
        if (r.synthese)
          Panneau(
            titre: 'Synthèse de la classe',
            enfant: Wrap(
              spacing: Espace.m,
              runSpacing: Espace.s,
              children: [
                _Indicateur(label: 'Élèves inscrits', value: '${r.nb_eleves}'),
                _Indicateur(label: 'Tentatives', value: '${r.nb_tentatives}'),
                _Indicateur(
                    label: 'Terminées', value: '${r.nb_tentatives_terminees}'),
                _Indicateur(
                  label: 'Score moyen',
                  value: r.score_moyen == null
                      ? '—'
                      : '${r.score_moyen!.toStringAsFixed(1)}%',
                ),
              ],
            ),
          ),
        if (r.synthese)
          Panneau(
            titre: 'Résultats par expérience',
            enfant: r.par_experience.isEmpty
                ? const Text('Aucune tentative enregistrée.')
                : Column(
                    children: [
                      for (final bilan in r.par_experience)
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(bilan.titre ?? bilan.experience_id),
                          subtitle: Text([
                            if (bilan.matiere != null) bilan.matiere!,
                            '${bilan.nombre_tentatives} tentatives',
                          ].join(' · ')),
                          trailing: Text(
                            bilan.score_moyen == null
                                ? '—'
                                : '${bilan.score_moyen!.toStringAsFixed(1)}%',
                          ),
                        ),
                    ],
                  ),
          ),
        if (!r.synthese) ...[
          Panneau(
            titre: 'Élèves',
            enfant: Column(
              children: [
                for (var i = 0; i < r.eleves.length; i++) ...[
                  if (i > 0) const Divider(height: 1),
                  _LigneEleve(eleve: r.eleves[i]),
                ],
              ],
            ),
          ),
          Panneau(
            titre: 'Erreurs fréquentes',
            enfant: Column(
              children: [
                for (final e in r.erreurs_frequentes)
                  ListTile(
                    minTileHeight: Taille.zoneTactile,
                    contentPadding: EdgeInsets.zero,
                    title: Text(libelles_erreurs[e.code] ?? e.code),
                    trailing: Text('${e.nb}',
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                  ),
              ],
            ),
          ),
        ],
      ]),
    );
  }
}

class _Indicateur extends StatelessWidget {
  const _Indicateur({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: 180,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Couleurs.texteDiscret)),
            Text(value, style: Theme.of(context).textTheme.titleLarge),
          ],
        ),
      );
}

class _LigneEleve extends StatelessWidget {
  const _LigneEleve({required this.eleve});
  final ResultatEleve eleve;

  @override
  Widget build(BuildContext context) {
    final d = eleve.derniere_activite;
    final date =
        '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    return ConstrainedBox(
      constraints:
          const BoxConstraints(minHeight: Taille.zoneTactile + Espace.xs),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(eleve.nom,
                style: const TextStyle(fontWeight: FontWeight.w700)),
          ),
          Expanded(
              flex: 2, child: Text('${eleve.experiences_faites} expériences')),
          Expanded(flex: 1, child: Text('${eleve.score_moyen}/100')),
          if (MediaQuery.sizeOf(context).width >= Largeur.compact)
            Expanded(flex: 2, child: Text(date)),
        ],
      ),
    );
  }
}
