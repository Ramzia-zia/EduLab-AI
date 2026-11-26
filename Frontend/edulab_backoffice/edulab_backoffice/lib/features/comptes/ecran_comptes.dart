// Gestion des comptes enseignants / eleves.
// L'ETABLISSEMENT cree les comptes (peut_creer = true). L'administrateur consulte seulement.
// Routes : [AJOUT] GET /etablissements/{id}/comptes, POST, PATCH /comptes/{id},
// DELETE /comptes/{id}. Import CSV : POST /etablissements/{id}/import (contrat v0.1).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/donnees/depot.dart';
import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/cartes.dart';
import '../../core/widgets/etat.dart';
import 'dialogue_compte.dart';
import 'dialogue_import_csv.dart';
import 'table_comptes.dart';

class EcranComptes extends ConsumerStatefulWidget {
  const EcranComptes({
    super.key,
    required this.role_compte,
    required this.peut_creer,
    required this.titre,
  });
  final String role_compte; // 'enseignant' ou 'eleve'
  final bool peut_creer;
  final String titre;

  @override
  ConsumerState<EcranComptes> createState() => _EtatEcranComptes();
}

class _EtatEcranComptes extends ConsumerState<EcranComptes> {
  String _recherche = '';

  Future<void> _creer() async {
    final compte =
        await afficherDialogueCompte(context, role_initial: widget.role_compte);
    if (compte == null || !mounted) return;
    ref.read(comptesProvider.notifier).creer(compte);
    _message('Compte créé pour ${compte.nom}.');
  }

  Future<void> _modifier(Compte compte) async {
    final modifie = await afficherDialogueCompte(context,
        role_initial: compte.role, existant: compte);
    if (modifie == null || !mounted) return;
    ref.read(comptesProvider.notifier).modifier(modifie);
    _message('Compte modifié.');
  }

  Future<void> _supprimer(Compte compte) async {
    final confirme = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer ce compte ?'),
        content: Text('Le compte de ${compte.nom} sera supprimé.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Annuler')),
          ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Couleurs.rouge),
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('Supprimer')),
        ],
      ),
    );
    if (confirme != true || !mounted) return;
    ref.read(comptesProvider.notifier).supprimer(compte.id);
    _message('Compte supprimé.');
  }

  Future<void> _importer() async {
    final comptes = await afficherImportCsv(context);
    if (comptes == null || !mounted) return;
    ref.read(comptesProvider.notifier).creerPlusieurs(comptes);
    _message('${comptes.length} compte(s) importé(s).');
  }

  void _message(String texte) => ScaffoldMessenger.of(context)
      .showSnackBar(SnackBar(content: Text(texte)));

  @override
  Widget build(BuildContext context) {
    final etat = ref.watch(comptesProvider);
    final enseignants = widget.role_compte == 'enseignant';
    return EtatAsync<List<Compte>>(
      valeur: etat,
      sur_reessayer: () => ref.invalidate(comptesProvider),
      construire: (tous) {
        final filtres = tous
            .where((c) => c.role == widget.role_compte)
            .where((c) =>
                _recherche.isEmpty ||
                c.nom.toLowerCase().contains(_recherche) ||
                c.email.toLowerCase().contains(_recherche))
            .toList();
        return PageDefilante(enfants: [
          EnTetePage(
            titre: widget.titre,
            sous_titre: widget.peut_creer
                ? 'Créez et gérez les comptes ${enseignants ? 'des enseignants' : 'des élèves'} de votre établissement.'
                : 'Consultez les comptes ${enseignants ? 'des enseignants' : 'des élèves'}. Seul l\'établissement crée les comptes.',
          ),
          Panneau(
            titre:
                '${filtres.length} ${enseignants ? 'enseignant(s)' : 'élève(s)'}',
            droite: widget.peut_creer
                ? Wrap(
                    spacing: Espace.xs,
                    children: [
                      OutlinedButton.icon(
                        onPressed: _importer,
                        style: OutlinedButton.styleFrom(
                            minimumSize: const Size(
                                Taille.zoneTactile, Taille.zoneTactile)),
                        icon: const Icon(Icons.upload_file, size: 18),
                        label: const Text('Importer un CSV'),
                      ),
                      ElevatedButton.icon(
                        onPressed: _creer,
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Créer un compte'),
                      ),
                    ],
                  )
                : null,
            enfant: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    hintText: 'Rechercher par nom ou e-mail',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (v) =>
                      setState(() => _recherche = v.trim().toLowerCase()),
                ),
                const SizedBox(height: Espace.s),
                if (filtres.isEmpty)
                  MessageEtat(
                    icone: Icons.person_off_outlined,
                    message: tous.any((c) => c.role == widget.role_compte)
                        ? 'Aucun résultat pour cette recherche.'
                        : widget.peut_creer
                            ? 'Aucun compte pour le moment. Crée le premier compte avec le bouton « Créer un compte ».'
                            : 'Aucun compte pour le moment.',
                  )
                else
                  TableComptes(
                    comptes: filtres,
                    sur_modifier: widget.peut_creer ? _modifier : null,
                    sur_supprimer: widget.peut_creer ? _supprimer : null,
                  ),
              ],
            ),
          ),
        ]);
      },
    );
  }
}
