import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/fournisseurs.dart';
import '../../core/reseau/reseau.dart';
import '../connexion/etat_session.dart';
import 'service_sync.dart';

/// Nombre de lignes (tentatives et événements) pas encore envoyées.
final enAttenteProvider = FutureProvider.autoDispose<int>(
  (ref) => ref.watch(depotLocalProvider).nombreEnAttente(),
);

/// Lance l'envoi de la file, puis met à jour le compteur.
final synchroniserProvider = Provider<Future<ResumeSync> Function()>((ref) {
  return () async {
    if (ref.read(sessionProvider).valueOrNull == null) {
      return const ResumeSync(0);
    }
    final resume = await ref.read(serviceSyncProvider).envoyerTout();
    ref.invalidate(enAttenteProvider);
    return resume;
  };
});

/// À surveiller depuis la racine : envoie la file dès que le réseau revient.
final syncAutomatiqueProvider = Provider<void>((ref) {
  ref.listen<AsyncValue<bool>>(enLigneProvider, (avant, apres) {
    if (apres.valueOrNull == true) {
      ref.read(synchroniserProvider)();
    }
  });
});
