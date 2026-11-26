import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/api_provisoire/modeles.dart';
import 'depot_session.dart';

class SessionSupabase implements DepotSession {
  SessionSupabase(this._auth);

  final GoTrueClient _auth;

  @override
  String? get jeton => _auth.currentSession?.accessToken;

  @override
  Future<void> connecter(String email, String motDePasse) async {
    try {
      await _auth.signInWithPassword(email: email, password: motDePasse);
    } on AuthRetryableFetchException {
      throw const ErreurReseau();
    } on AuthException {
      throw const ErreurApi(
        code: 'non_authentifie',
        message: 'E-mail ou mot de passe incorrect.',
        statutHttp: 401,
      );
    }
  }

  @override
  Future<void> deconnecter() => _auth.signOut();
}
