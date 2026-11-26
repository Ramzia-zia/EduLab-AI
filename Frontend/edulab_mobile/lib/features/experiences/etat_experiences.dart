import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/fournisseurs.dart';

/// GET /experiences, avec repli sur les résumés déjà téléchargés hors-ligne.
final resumesProvider =
    FutureProvider.autoDispose<List<ExperienceResume>>((ref) async {
  final api = ref.watch(apiProvider);
  final depot = ref.watch(depotLocalProvider);
  try {
    final resumes = await api.experiences();
    final tentatives = await depot.historique();
    try {
      var page = 1;
      while (true) {
        final resultats = await api.tentatives(page: page, taille: 100);
        tentatives.addAll(resultats.elements);
        if (resultats.elements.length < 100) break;
        page++;
      }
    } on ErreurReseau {
      // Le catalogue reste utilisable avec la progression locale en cache.
    }
    final avecProgression = appliquerProgression(resumes, tentatives);
    await depot.sauverResumes(avecProgression);
    return avecProgression;
  } on ErreurReseau {
    final copie = await depot.lireResumes();
    if (copie.isEmpty) rethrow;
    return copie;
  }
});

List<ExperienceResume> appliquerProgression(
  List<ExperienceResume> resumes,
  List<Tentative> tentatives,
) {
  final parExperience = <String, List<Tentative>>{};
  for (final tentative in tentatives) {
    parExperience.putIfAbsent(tentative.experienceId, () => []).add(tentative);
  }
  return [
    for (final resume in resumes)
      ExperienceResume(
        id: resume.id,
        matiere: resume.matiere,
        niveau: resume.niveau,
        titre: resume.titre,
        dureeMin: resume.dureeMin,
        difficulte: resume.difficulte,
        version: resume.version,
        etat: (parExperience[resume.id] ?? const [])
                .any((tentative) => tentative.statut == 'terminee')
            ? 'termine'
            : (parExperience[resume.id] ?? const [])
                    .any((tentative) => tentative.statut == 'en_cours')
                ? 'en_cours'
                : 'a_commencer',
      ),
  ];
}
