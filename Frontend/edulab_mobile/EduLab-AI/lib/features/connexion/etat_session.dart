import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/fournisseurs.dart';

/// null = personne de connecté.
final sessionProvider =
    AsyncNotifierProvider<SessionNotifier, Profil?>(SessionNotifier.new);

class SessionNotifier extends AsyncNotifier<Profil?> {
  @override
  Future<Profil?> build() async {
    if (ref.read(depotSessionProvider).jeton == null) return null;
    final depot = ref.read(depotLocalProvider);
    try {
      final profil = await ref.read(apiProvider).moi();
      await depot.sauverProfil(profil);
      return profil;
    } on ErreurReseau {
      // Hors-ligne : on garde le dernier profil connu.
      return depot.lireProfil();
    } on ErreurApi catch (e) {
      if (e.code == 'non_authentifie') return null;
      return depot.lireProfil();
    }
  }

  /// Lance une erreur lisible (ErreurApi ou ErreurReseau) si la connexion échoue.
  Future<void> connecter(String email, String motDePasse) async {
    final session = ref.read(depotSessionProvider);
    await session.connecter(email, motDePasse);
    final Profil profil;
    try {
      profil = await ref.read(apiProvider).moi();
    } catch (_) {
      await session.deconnecter();
      rethrow;
    }
    if (profil.role != 'eleve') {
      await session.deconnecter();
      throw const ErreurApi(
        code: 'interdit',
        message:
            'Cette application est réservée aux élèves. Les enseignants utilisent la version web.',
        statutHttp: 403,
      );
    }
    await ref.read(depotLocalProvider).sauverProfil(profil);
    state = AsyncData(profil);
  }

  Future<void> deconnecter() async {
    await ref.read(depotSessionProvider).deconnecter();
    state = const AsyncData(null);
  }
}
