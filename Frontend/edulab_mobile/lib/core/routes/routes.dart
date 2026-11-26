import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/accueil/ecran_accueil.dart';
import '../../features/connexion/ecran_connexion.dart';
import '../../features/connexion/etat_session.dart';
import '../../features/experiences/ecran_experiences.dart';
import '../../features/laboratoire/ecran_laboratoire.dart';
import '../../features/matieres/ecran_matieres.dart';
import '../../features/profil/ecran_profil.dart';
import '../../features/quiz/ecran_quiz.dart';
import '../../features/resultat/ecran_resultat.dart';
import '../widgets/coquille.dart';
import '../widgets/vue_async.dart';

abstract final class Routes {
  static const demarrage = '/demarrage';
  static const connexion = '/connexion';
  static const accueil = '/accueil';
  static const matieres = '/matieres';
  static const experiences = '/experiences';
  static const quiz = '/quiz';
  static const profil = '/profil';
  static String laboratoire(String experienceId) => '/laboratoire/$experienceId';
  static String resultat(String tentativeId) => '/resultat/$tentativeId';
}

final routeurProvider = Provider<GoRouter>((ref) {
  final rafraichir = ValueNotifier<int>(0);
  ref.listen(sessionProvider, (_, __) => rafraichir.value++);
  ref.onDispose(rafraichir.dispose);

  return GoRouter(
    initialLocation: Routes.demarrage,
    refreshListenable: rafraichir,
    redirect: (context, etat) {
      final session = ref.read(sessionProvider);
      final lieu = etat.matchedLocation;
      if (session.isLoading && !session.hasValue) {
        return lieu == Routes.demarrage ? null : Routes.demarrage;
      }
      final connecte = session.valueOrNull != null;
      if (!connecte) return lieu == Routes.connexion ? null : Routes.connexion;
      if (lieu == Routes.connexion || lieu == Routes.demarrage) {
        return Routes.accueil;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: Routes.demarrage,
        builder: (_, __) => const Scaffold(body: EtatChargement()),
      ),
      GoRoute(
        path: Routes.connexion,
        builder: (_, __) => const EcranConnexion(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => Coquille(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.accueil, builder: (_, __) => const EcranAccueil()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.matieres, builder: (_, __) => const EcranMatieres()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: Routes.experiences,
              builder: (_, etat) => EcranExperiences(
                matiereInitiale: etat.uri.queryParameters['matiere'],
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.quiz, builder: (_, __) => const EcranQuiz()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.profil, builder: (_, __) => const EcranProfil()),
          ]),
        ],
      ),
      GoRoute(
        path: '/laboratoire/:experienceId',
        builder: (_, etat) =>
            EcranLaboratoire(experienceId: etat.pathParameters['experienceId']!),
      ),
      GoRoute(
        path: '/resultat/:tentativeId',
        builder: (_, etat) =>
            EcranResultat(tentativeId: etat.pathParameters['tentativeId']!),
      ),
    ],
  );
});
