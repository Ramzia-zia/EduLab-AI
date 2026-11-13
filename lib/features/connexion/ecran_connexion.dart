// Écran : lib/features/connexion/ecran_connexion.dart
// Route appelée : Supabase Auth (signInWithPassword), puis GET /moi (contrat chap. 3).
// États : chargement (bouton en attente), vide (sans objet), erreur (message sous le formulaire).
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/theme.dart';
import '../../core/widgets/carte.dart';
import '../../core/widgets/vue_async.dart';
import 'etat_session.dart';

class EcranConnexion extends ConsumerStatefulWidget {
  const EcranConnexion({super.key});

  @override
  ConsumerState<EcranConnexion> createState() => _EtatEcranConnexion();
}

class _EtatEcranConnexion extends ConsumerState<EcranConnexion> {
  final _cle = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _motDePasse = TextEditingController();
  bool _masque = true;
  bool _enCours = false;
  String? _erreur;

  @override
  void dispose() {
    _email.dispose();
    _motDePasse.dispose();
    super.dispose();
  }

  Future<void> _envoyer() async {
    if (!(_cle.currentState?.validate() ?? false)) return;
    setState(() {
      _enCours = true;
      _erreur = null;
    });
    try {
      await ref
          .read(sessionProvider.notifier)
          .connecter(_email.text.trim(), _motDePasse.text);
    } catch (e) {
      if (mounted) {
        setState(() {
          _enCours = false;
          _erreur = messageErreur(e);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(Espace.x3),
            child: ConstrainedBox(
              constraints:
                  const BoxConstraints(maxWidth: Tailles.largeurFormulaire),
              child: Form(
                key: _cle,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: Espace.x6,
                          height: Espace.x6,
                          decoration: BoxDecoration(
                            color: Couleurs.teal,
                            borderRadius:
                                BorderRadius.circular(Tailles.rayon),
                          ),
                          child: const Icon(Icons.science_outlined,
                              color: Couleurs.surface),
                        ),
                        const SizedBox(width: Espace.x2),
                        Semantics(
                          header: true,
                          child: Text('EduLab AI',
                              style: theme.textTheme.titleLarge),
                        ),
                      ],
                    ),
                    const SizedBox(height: Espace.x4),
                    Text('Comprendre en faisant.',
                        style: theme.textTheme.headlineMedium),
                    const SizedBox(height: Espace.x1),
                    Text('Explore les sciences à ton rythme, en classe comme à la maison.',
                        style: theme.textTheme.bodySmall),
                    const SizedBox(height: Espace.x3),
                    Carte(
                      padding: const EdgeInsets.all(Espace.x3),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextFormField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            autofillHints: const [AutofillHints.username],
                            textInputAction: TextInputAction.next,
                            decoration:
                                const InputDecoration(labelText: 'Adresse e-mail'),
                            validator: (v) => (v == null || !v.contains('@'))
                                ? 'Écris ton adresse e-mail.'
                                : null,
                          ),
                          const SizedBox(height: Espace.x2),
                          TextFormField(
                            controller: _motDePasse,
                            obscureText: _masque,
                            autofillHints: const [AutofillHints.password],
                            onFieldSubmitted: (_) => _envoyer(),
                            decoration: InputDecoration(
                              labelText: 'Mot de passe',
                              suffixIcon: IconButton(
                                tooltip: _masque
                                    ? 'Afficher le mot de passe'
                                    : 'Masquer le mot de passe',
                                icon: Icon(_masque
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined),
                                onPressed: () =>
                                    setState(() => _masque = !_masque),
                              ),
                            ),
                            validator: (v) => (v == null || v.isEmpty)
                                ? 'Écris ton mot de passe.'
                                : null,
                          ),
                          if (_erreur != null) ...[
                            const SizedBox(height: Espace.x2),
                            Semantics(
                              liveRegion: true,
                              child: Text(
                                _erreur!,
                                style: theme.textTheme.bodyMedium
                                    ?.copyWith(color: Couleurs.rouge),
                              ),
                            ),
                          ],
                          const SizedBox(height: Espace.x3),
                          FilledButton(
                            onPressed: _enCours ? null : _envoyer,
                            child: AnimatedSwitcher(
                              duration: Durees.court,
                              child: _enCours
                                  ? const SizedBox(
                                      key: ValueKey('attente'),
                                      width: Tailles.icone,
                                      height: Tailles.icone,
                                      child: CircularProgressIndicator(
                                          strokeWidth: Tailles.trait),
                                    )
                                  : const Text('Accéder à mon espace',
                                      key: ValueKey('libelle')),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: Espace.x2),
                    const Carte(
                      couleur: Couleurs.fondTeal,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.cloud_off_outlined, color: Couleurs.teal),
                          SizedBox(width: Espace.x2),
                          Expanded(
                            child: Text(
                              'Mode hors-ligne : les expériences téléchargées restent disponibles sans internet.',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
