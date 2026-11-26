// Import CSV. Route : POST /etablissements/{id}/import (contrat v0.1)
import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';
import 'import_csv.dart';

Future<List<Compte>?> afficherImportCsv(BuildContext context) {
  return showDialog<List<Compte>>(
      context: context, builder: (_) => const _DialogueImport());
}

class _DialogueImport extends StatefulWidget {
  const _DialogueImport();

  @override
  State<_DialogueImport> createState() => _EtatImport();
}

class _EtatImport extends State<_DialogueImport> {
  AnalyseCsv? _analyse;
  String? _nomFichier;
  String? _erreur;

  Future<void> _choisir() async {
    try {
      final resultat = await FilePicker.platform.pickFiles(
          type: FileType.custom, allowedExtensions: ['csv'], withData: true);
      final fichier = resultat?.files.single;
      if (fichier == null) return;
      final octets = fichier.bytes;
      if (octets == null) {
        setState(() => _erreur = 'Impossible de lire ce fichier.');
        return;
      }
      setState(() {
        _erreur = null;
        _nomFichier = fichier.name;
        _analyse = analyserCsv(utf8.decode(octets, allowMalformed: true));
      });
    } catch (_) {
      setState(() => _erreur = 'Impossible de lire ce fichier.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final a = _analyse;
    return AlertDialog(
      title: const Text('Importer un fichier CSV'),
      content: SizedBox(
        width: 480,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                  'Colonnes obligatoires, avec cet en-tête, en UTF-8 : nom, role, classe, email.\nLe rôle vaut eleve ou enseignant.'),
              const SizedBox(height: Espace.s),
              OutlinedButton.icon(
                onPressed: _choisir,
                icon: const Icon(Icons.upload_file),
                label: Text(_nomFichier ?? 'Choisir un fichier'),
              ),
              if (_erreur != null) ...[
                const SizedBox(height: Espace.s),
                Text(_erreur!, style: const TextStyle(color: Couleurs.rouge)),
              ],
              if (a != null) ...[
                const SizedBox(height: Espace.s),
                if (a.entete_invalide)
                  const Text(
                      'L\'en-tête est incorrect. Il doit être : nom,role,classe,email.',
                      style: TextStyle(color: Couleurs.rouge))
                else ...[
                  Text('${a.valides.length} compte(s) prêt(s) à être créé(s).',
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  if (a.refusees.isNotEmpty)
                    Text(
                        '${a.refusees.length} ligne(s) ignorée(s) : ${a.refusees.map((l) => 'ligne ${l.ligne} (${l.code})').join(', ')}.'),
                ],
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annuler')),
        ElevatedButton(
          onPressed: (a == null || a.entete_invalide || a.valides.isEmpty)
              ? null
              : () => Navigator.of(context).pop(a.valides),
          child: const Text('Importer'),
        ),
      ],
    );
  }
}
