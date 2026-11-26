import 'package:flutter/material.dart';

import '../auth/session.dart';

class ItemMenu {
  const ItemMenu(this.libelle, this.icone, this.chemin);
  final String libelle;
  final IconData icone;
  final String chemin;
}

List<ItemMenu> menuPour(Role role) {
  switch (role) {
    case Role.admin:
      return const [
        ItemMenu('Tableau de bord', Icons.home_outlined,
            '/admin/tableau_de_bord'),
        ItemMenu('Gestion des établissements', Icons.account_balance_outlined,
            '/admin/etablissements'),
        ItemMenu('Gestion des enseignants', Icons.person_outline,
            '/admin/enseignants'),
        ItemMenu(
            'Gestion des élèves', Icons.school_outlined, '/admin/eleves'),
        ItemMenu('Contenus pédagogiques', Icons.fact_check_outlined,
            '/admin/contenus'),
        ItemMenu('Statistiques globales', Icons.bar_chart_outlined,
            '/admin/statistiques'),
        ItemMenu('Paramètres', Icons.settings_outlined, '/admin/parametres'),
      ];
    case Role.enseignant:
      return const [
        ItemMenu('Tableau de bord', Icons.home_outlined,
            '/enseignant/tableau_de_bord'),
        ItemMenu('Mes classes', Icons.groups_outlined, '/enseignant/classes'),
        ItemMenu('Mes cours', Icons.menu_book_outlined, '/enseignant/cours'),
        ItemMenu('Mes exercices', Icons.edit_note_outlined,
            '/enseignant/exercices'),
        ItemMenu('Mes expériences', Icons.science_outlined,
            '/enseignant/experiences'),
        ItemMenu('Résultats des élèves', Icons.insights_outlined,
            '/enseignant/resultats'),
        ItemMenu('Messages', Icons.chat_bubble_outline,
            '/enseignant/messages'),
        ItemMenu('Profil', Icons.person_outline, '/enseignant/profil'),
      ];
    case Role.ministere:
      return const [
        ItemMenu('Tableau de bord', Icons.home_outlined,
            '/ministere/tableau_de_bord'),
        ItemMenu('Politiques éducatives', Icons.account_balance_outlined,
            '/ministere/politiques'),
        ItemMenu('Suivi des établissements', Icons.apartment_outlined,
            '/ministere/etablissements'),
        ItemMenu('Suivi des enseignants', Icons.person_outline,
            '/ministere/enseignants'),
        ItemMenu('Suivi des élèves', Icons.school_outlined,
            '/ministere/eleves'),
        ItemMenu('Rapports & Analyses', Icons.bar_chart_outlined,
            '/ministere/rapports'),
        ItemMenu('Paramètres', Icons.settings_outlined,
            '/ministere/parametres'),
      ];
    case Role.etablissement:
      return const [
        ItemMenu('Mon établissement', Icons.home_outlined,
            '/etablissement/mon_etablissement'),
        ItemMenu('Gestion des enseignants', Icons.person_outline,
            '/etablissement/enseignants'),
        ItemMenu('Gestion des élèves', Icons.school_outlined,
            '/etablissement/eleves'),
        ItemMenu('Contenus pédagogiques', Icons.fact_check_outlined,
            '/etablissement/contenus'),
        ItemMenu('Paramètres', Icons.settings_outlined,
            '/etablissement/parametres'),
      ];
  }
}
