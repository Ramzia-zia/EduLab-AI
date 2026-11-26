import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth/session.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/graphiques.dart';
import '../../core/widgets/logo.dart';

/// Connexion. Route reelle : Supabase Auth (jeton, role dans app_metadata.role).
/// MODE DEMONSTRATION : le choix du role remplace la lecture du jeton.
class EcranConnexion extends ConsumerStatefulWidget {
  const EcranConnexion({super.key});

  @override
  ConsumerState<EcranConnexion> createState() => _EtatConnexion();
}

class _EtatConnexion extends ConsumerState<EcranConnexion> {
  final _cle = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _motDePasse = TextEditingController();
  bool _chargement = false;
  String? _erreur;

  @override
  void dispose() {
    _email.dispose();
    _motDePasse.dispose();
    super.dispose();
  }

  Future<void> _valider() async {
    if (!(_cle.currentState?.validate() ?? false)) return;
    setState(() {
      _chargement = true;
      _erreur = null;
    });
    try {
      final session = await ref.read(authentificationProvider).connecter(
            _email.text.trim(),
            _motDePasse.text,
          );
      if (mounted) ref.read(sessionProvider.notifier).connecter(session);
    } on AuthentificationException catch (e) {
      if (mounted) setState(() => _erreur = e.message);
    } finally {
      if (mounted) setState(() => _chargement = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final large = MediaQuery.sizeOf(context).width > Largeur.large;
    final formulaire = Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(Espace.m),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: Form(
            key: _cle,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (!large)
                  const Padding(
                    padding: EdgeInsets.only(bottom: Espace.m),
                    child:
                        Center(child: LogoEduLab(couleur_texte: Couleurs.menu)),
                  ),
                Text('Connexion',
                    style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: Espace.xs),
                const Text('Accède au backoffice EduLab AI.',
                    style: TextStyle(color: Couleurs.texteDiscret)),
                const SizedBox(height: Espace.m),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.email],
                  decoration:
                      const InputDecoration(labelText: 'Adresse e-mail'),
                  validator: (v) => (v == null || !v.contains('@'))
                      ? 'Saisis une adresse e-mail valide.'
                      : null,
                ),
                const SizedBox(height: Espace.s),
                TextFormField(
                  controller: _motDePasse,
                  obscureText: true,
                  autofillHints: const [AutofillHints.password],
                  decoration: const InputDecoration(labelText: 'Mot de passe'),
                  validator: (v) => (v == null || v.isEmpty)
                      ? 'Saisis ton mot de passe.'
                      : null,
                  onFieldSubmitted: (_) => _valider(),
                ),
                const SizedBox(height: Espace.s),
                if (_erreur != null) ...[
                  const SizedBox(height: Espace.s),
                  Text(_erreur!, style: const TextStyle(color: Couleurs.rouge)),
                ],
                const SizedBox(height: Espace.m),
                ElevatedButton(
                  onPressed: _chargement ? null : _valider,
                  child: _chargement
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Se connecter'),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return Scaffold(
      body: large
          ? Row(
              children: [
                SizedBox(
                  width: 480,
                  child: Container(
                    color: Couleurs.menu,
                    child: const Column(
                      children: [
                        Expanded(
                          child: Center(child: LogoEduLab(taille: 72)),
                        ),
                        BandeDrapeau(),
                      ],
                    ),
                  ),
                ),
                Expanded(child: formulaire),
              ],
            )
          : formulaire,
    );
  }
}
