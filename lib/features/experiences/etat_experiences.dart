import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/fournisseurs.dart';

/// GET /experiences, avec repli sur la copie locale quand il n'y a pas de réseau.
final resumesProvider =
    FutureProvider.autoDispose<List<ExperienceResume>>((ref) async {
  final api = ref.watch(apiProvider);
  final depot = ref.watch(depotLocalProvider);
  try {
    final resumes = await api.experiences();
    await depot.sauverResumes(resumes);
    return resumes;
  } on ErreurReseau {
    final copie = await depot.lireResumes();
    if (copie.isEmpty) rethrow;
    return copie;
  }
});

/// GET /experiences/{id}/pack, lu d'abord en local : le pack se télécharge une seule fois.
final packProvider =
    FutureProvider.autoDispose.family<ExperiencePack, String>((ref, id) async {
  final depot = ref.watch(depotLocalProvider);
  final local = await depot.lirePack(id);
  if (local != null) return local;
  final pack = await ref.watch(apiProvider).pack(id);
  await depot.sauverPack(pack);
  return pack;
});
