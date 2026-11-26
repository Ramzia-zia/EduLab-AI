// Creation et modification d'un compte enseignant ou eleve.
// Routes : [AJOUT] POST /etablissements/{id}/comptes et PATCH /comptes/{id}
import 'package:flutter/material.dart';

import '../../core/donnees/modeles_provisoires.dart';
import '../../core/theme/theme.dart';

Future<Compte?> afficherDialogueCompte(BuildContext context,
    {required String role_initial, Compte? existant}) {
  return showDialog<Compte>(
    context: context,
    builder: (_) => _DialogueCompte(role_initial: role_initial, existant: existant),
  );
}

class _DialogueCompte extends StatefulWidget {
  const _DialogueCompte({required this.role_initial, this.existant});
  final String role_initial;
  final Compte? existant;

  @override
  State<_DialogueCompte> createState() => _EtatDialogue();
}

class _EtatDialogue extends State<_DialogueCompte> {
  final _cle = GlobalKey<FormState>();
  late final TextEditingController _nom;
  late final TextEditingController _email;
  late final TextEditingController _classe;
  late String _role;

  @override
  void initState() {
    super.initState();
    final c = widget.existant;
    _nom = TextEditingController(text: c?.nom ?? '');
    _email = TextEditingController(text: c?.email ?? '');
    _classe = TextEditingController(text: c?.classe ?? '');
    _role = c?.role ?? widget.role_initial;
  }

  @override
  void dispose() {
    _nom.dispose();
    _email.dispose();
    _classe.dispose();
    super.dispose();
  }

  void _valider() {
    if (!(_cle.currentState?.validate() ?? false)) return;
    final classe = _classe.text.trim();
    Navigator.of(context).pop(Compte(
      id: widget.existant?.id ??
          'compte_${DateTime.now().microsecondsSinceEpoch}',
      nom: _nom.text.trim(),
      email: _email.text.trim().toLowerCase(),
      role: _role,
      classe: classe.isEmpty ? null : classe,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final modification = widget.existant != null;
    return AlertDialog(
      title: Text(modification ? 'Modifier le compte' : 'Créer un compte'),
      content: SizedBox(
        width: 440,
        child: Form(
          key: _cle,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: _nom,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(labelText: 'Nom complet'),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Le nom est obligatoire.'
                      : null,
                ),
                const SizedBox(height: Espace.s),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Adresse e-mail'),
                  validator: (v) => (v == null || !v.contains('@'))
                      ? 'Saisis une adresse e-mail valide.'
                      : null,
                ),
                const SizedBox(height: Espace.s),
                DropdownButtonFormField<String>(
                  value: _role,
                  decoration: const InputDecoration(labelText: 'Rôle'),
                  items: const [
                    DropdownMenuItem(value: 'enseignant', child: Text('Enseignant')),
                    DropdownMenuItem(value: 'eleve', child: Text('Élève')),
                  ],
                  onChanged: (v) => setState(() => _role = v ?? _role),
                ),
                const SizedBox(height: Espace.s),
                TextFormField(
                  controller: _classe,
                  decoration: const InputDecoration(
                      labelText: 'Classe (facultatif)',
                      hintText: 'Par exemple Tle D'),
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annuler')),
        ElevatedButton(
            onPressed: _valider,
            child: Text(modification ? 'Enregistrer' : 'Créer le compte')),
      ],
    );
  }
}
