import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/ecran_etablissements.dart';
import '../../features/admin/ecran_tableau_admin.dart';
import '../../features/auth/ecran_connexion.dart';
import '../../features/comptes/ecran_comptes.dart';
import '../../features/enseignant/ecran_classes.dart';
import '../../features/enseignant/ecran_resultats_classe.dart';
import '../../features/enseignant/ecran_tableau_enseignant.dart';
import '../../features/etablissement/ecran_tableau_etablissement.dart';
import '../../features/ministere/ecran_suivi_etablissements.dart';
import '../../features/ministere/ecran_tableau_ministere.dart';
import '../auth/session.dart';
import '../widgets/coquille.dart';
import '../widgets/ecran_a_venir.dart';

GoRoute _page(String chemin, Widget Function(GoRouterState) construire) =>
    GoRoute(
      path: chemin,
      pageBuilder: (context, state) =>
          NoTransitionPage(key: state.pageKey, child: construire(state)),
    );

Widget _aVenir(String titre, String note) =>
    EcranAVenir(titre: titre, note: note);

final routeurProvider = Provider<GoRouter>((ref) {
  final ecoute = ValueNotifier<Session?>(ref.read(sessionProvider));
  ref.listen<Session?>(sessionProvider, (_, nouveau) => ecoute.value = nouveau);
  ref.onDispose(ecoute.dispose);

  return GoRouter(
    initialLocation: '/connexion',
    refreshListenable: ecoute,
    redirect: (context, state) {
      final session = ref.read(sessionProvider);
      final lieu = state.matchedLocation;
      if (session == null) return lieu == '/connexion' ? null : '/connexion';
      if (lieu == '/connexion' ||
          lieu == '/' ||
          !lieu.startsWith('/${session.role.prefixe}')) {
        return session.role.accueil;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/connexion',
        builder: (context, state) => const EcranConnexion(),
      ),
      ShellRoute(
        builder: (context, state, enfant) =>
            Coquille(chemin: state.uri.path, enfant: enfant),
        routes: [
          // Administration
          _page('/admin/tableau_de_bord', (_) => const EcranTableauAdmin()),
          _page('/admin/etablissements', (_) => const EcranEtablissements()),
          _page(
              '/admin/enseignants',
              (_) => const EcranComptes(
                  role_compte: 'enseignant',
                  peut_creer: false,
                  titre: 'Gestion des enseignants')),
          _page(
              '/admin/eleves',
              (_) => const EcranComptes(
                  role_compte: 'eleve',
                  peut_creer: false,
                  titre: 'Gestion des élèves')),
          _page(
              '/admin/contenus',
              (_) => _aVenir('Contenus pédagogiques',
                  'Aucune route de contenus dans le contrat v0.1.')),
          _page(
              '/admin/statistiques',
              (_) => _aVenir('Statistiques globales',
                  'Route de statistiques globales à ajouter au contrat.')),
          _page(
              '/admin/parametres',
              (_) => _aVenir('Paramètres',
                  'Aucune route de paramètres dans le contrat v0.1.')),

          // Enseignant
          _page('/enseignant/tableau_de_bord',
              (_) => const EcranTableauEnseignant()),
          _page(
              '/enseignant/classes',
              (_) => const EcranClasses(
                  titre: 'Mes classes',
                  sous_titre: 'Choisis une classe pour voir ses résultats.')),
          _page('/enseignant/classes/:id',
              (s) => EcranResultatsClasse(classe_id: s.pathParameters['id']!)),
          _page(
              '/enseignant/cours',
              (_) => _aVenir(
                  'Mes cours', 'Route des cours à ajouter au contrat.')),
          _page(
              '/enseignant/exercices',
              (_) => _aVenir('Mes exercices',
                  'Route des exercices à ajouter au contrat.')),
          _page(
              '/enseignant/experiences',
              (_) => _aVenir('Mes expériences',
                  'Choix des expériences ouvertes à une classe : route à ajouter.')),
          _page(
              '/enseignant/resultats',
              (_) => const EcranClasses(
                  titre: 'Résultats des élèves',
                  sous_titre: 'Choisis une classe pour voir les résultats.')),
          _page(
              '/enseignant/messages',
              (_) => _aVenir(
                  'Messages', 'Route de messagerie à ajouter au contrat.')),
          _page(
              '/enseignant/profil',
              (_) => _aVenir('Profil',
                  'Le profil vient de GET /moi, écran détaillé à prévoir.')),

          // Ministere (jamais de noms d'eleves)
          _page('/ministere/tableau_de_bord',
              (_) => const EcranTableauMinistere()),
          _page(
              '/ministere/politiques',
              (_) => _aVenir('Politiques éducatives',
                  'Aucune route de politiques dans le contrat v0.1.')),
          _page('/ministere/etablissements',
              (_) => const EcranSuiviEtablissements()),
          _page(
              '/ministere/enseignants',
              (_) => _aVenir('Suivi des enseignants',
                  'Indicateurs agrégés par enseignant : route à ajouter, sans données nominatives.')),
          _page(
              '/ministere/eleves',
              (_) => _aVenir('Suivi des élèves',
                  'Indicateurs agrégés uniquement, jamais de noms d\'élèves. Route à ajouter.')),
          _page(
              '/ministere/rapports',
              (_) => _aVenir('Rapports & Analyses',
                  'Route de rapports à ajouter au contrat.')),
          _page(
              '/ministere/parametres',
              (_) => _aVenir('Paramètres',
                  'Aucune route de paramètres dans le contrat v0.1.')),

          // Etablissement : c'est lui qui cree les comptes des enseignants et des eleves
          _page('/etablissement/mon_etablissement',
              (_) => const EcranTableauEtablissement()),
          _page(
              '/etablissement/enseignants',
              (_) => const EcranComptes(
                  role_compte: 'enseignant',
                  peut_creer: false,
                  titre: 'Gestion des enseignants')),
          _page(
              '/etablissement/eleves',
              (_) => const EcranComptes(
                  role_compte: 'eleve',
                  peut_creer: false,
                  titre: 'Gestion des élèves')),
          _page(
              '/etablissement/contenus',
              (_) => _aVenir('Contenus pédagogiques',
                  'Aucune route de contenus dans le contrat v0.1.')),
          _page(
              '/etablissement/parametres',
              (_) => _aVenir('Paramètres',
                  'Aucune route de paramètres dans le contrat v0.1.')),
        ],
      ),
    ],
  );
});
