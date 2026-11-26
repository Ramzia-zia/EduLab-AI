import 'package:edulab_mobile/core/api_provisoire/modeles.dart';
import 'package:edulab_mobile/features/experiences/etat_experiences.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('derive la progression de chaque simulation depuis les tentatives', () {
    final resumes = [
      const ExperienceResume(
        id: 'focale_lentille',
        matiere: 'physique',
        niveau: 'premiere',
        titre: 'Distance focale',
        dureeMin: null,
        difficulte: null,
        version: 1,
        etat: 'a_commencer',
      ),
      const ExperienceResume(
        id: 'lois_courant',
        matiere: 'physique',
        niveau: 'seconde',
        titre: 'Lois du courant',
        dureeMin: null,
        difficulte: null,
        version: 1,
        etat: 'a_commencer',
      ),
      const ExperienceResume(
        id: 'sol_constituants',
        matiere: 'svt',
        niveau: 'seconde',
        titre: 'Constituants du sol',
        dureeMin: null,
        difficulte: null,
        version: 1,
        etat: 'a_commencer',
      ),
    ];
    final tentatives = [
      _tentative('a', 'focale_lentille', 'en_cours'),
      _tentative('b', 'focale_lentille', 'terminee'),
      _tentative('c', 'lois_courant', 'abandonnee'),
    ];

    final resultat = appliquerProgression(resumes, tentatives);

    expect(
        resultat.map((e) => e.etat), ['termine', 'a_commencer', 'a_commencer']);
    expect(resultat.map((e) => e.id), resumes.map((e) => e.id));
  });
}

Tentative _tentative(String id, String experienceId, String statut) =>
    Tentative(
      id: id,
      experienceId: experienceId,
      versionExperience: 1,
      debut: DateTime.utc(2026, 11, 25),
      statut: statut,
    );
