// PROVISOIRE. Ces classes seront remplacees par le client Dart genere depuis
// openapi.json des que la route correspondante existe dans le serveur.
// Les noms suivent docs/CONTRAT.md v0.1. Ce qui est marque [AJOUT] n'existe
// pas dans le contrat : voir le document Word des ajouts.
import 'package:flutter/material.dart';

class Activite {
  const Activite(
      {required this.texte, required this.il_y_a, required this.icone});
  final String texte;
  final String il_y_a;
  final IconData icone;
}

/// [AJOUT] GET /admin/tableau_de_bord
class TableauAdmin {
  const TableauAdmin({
    required this.nb_etablissements,
    required this.nb_enseignants,
    required this.nb_eleves,
    required this.taux_utilisation,
    required this.evolution_libelles,
    required this.evolution_valeurs,
    required this.repartition_regions,
    required this.activites,
  });
  final int nb_etablissements;
  final int nb_enseignants;
  final int nb_eleves;
  final double taux_utilisation;
  final List<String> evolution_libelles;
  final List<double> evolution_valeurs;
  final List<PartRegion> repartition_regions;
  final List<Activite> activites;
}

class PartRegion {
  const PartRegion({required this.nom, required this.pourcentage});
  final String nom;
  final double pourcentage;
}

/// [AJOUT] GET /enseignant/tableau_de_bord
class TableauEnseignant {
  const TableauEnseignant({
    required this.nb_classes,
    required this.nb_cours,
    required this.nb_eleves,
    required this.taux_reussite,
    required this.classes,
    required this.activites,
  });
  final int nb_classes;
  final int? nb_cours;
  final int nb_eleves;
  final double taux_reussite;
  final List<ClasseResume> classes;
  final List<Activite> activites;
}

/// Contrat : GET /classes (champs Classe). nb_eleves est un [AJOUT].
class ClasseResume {
  const ClasseResume(
      {required this.id,
      required this.nom,
      required this.abreviation,
      this.nb_eleves,
      this.niveau = ''});
  final String id;
  final String nom;
  final String abreviation;
  final int? nb_eleves;
  final String niveau;
}

/// [AJOUT] GET /ministere/tableau_de_bord
class TableauMinistere {
  const TableauMinistere({
    required this.nb_etablissements,
    required this.nb_enseignants,
    required this.nb_eleves,
    required this.taux_utilisation,
    required this.performance_regions,
  });
  final int nb_etablissements;
  final int? nb_enseignants;
  final int? nb_eleves;
  final double? taux_utilisation;
  final List<PartRegion> performance_regions;
}

/// [AJOUT] GET /etablissements/{id}
class TableauEtablissement {
  const TableauEtablissement({
    required this.nom,
    required this.actif,
    required this.nb_enseignants,
    required this.nb_eleves,
    required this.activites,
  });
  final String nom;
  final bool actif;
  final int? nb_enseignants;
  final int? nb_eleves;
  final List<Activite> activites;
}

/// [AJOUT] GET /etablissements (liste). region n'existe pas dans le contrat.
class EtablissementLigne {
  const EtablissementLigne({
    required this.id,
    required this.nom,
    required this.commune,
    required this.region,
    required this.nb_eleves,
    required this.actif,
  });
  final String id;
  final String nom;
  final String commune;
  final String region;
  final int nb_eleves;
  final bool actif;
}

/// [AJOUT] Compte enseignant ou eleve cree par l'etablissement.
/// role : 'eleve' ou 'enseignant' (valeurs du contrat).
class Compte {
  const Compte({
    required this.id,
    required this.nom,
    required this.email,
    required this.role,
    this.classe,
  });
  final String id;
  final String nom;
  final String email;
  final String role;
  final String? classe;

  Compte copie({String? nom, String? email, String? role, String? classe}) =>
      Compte(
        id: id,
        nom: nom ?? this.nom,
        email: email ?? this.email,
        role: role ?? this.role,
        classe: classe ?? this.classe,
      );
}

/// Contrat : modele ResultatsClasse.
class ResultatsClasse {
  const ResultatsClasse(
      {required this.classe_nom,
      required this.eleves,
      required this.erreurs_frequentes,
      this.synthese = false,
      this.nb_eleves = 0,
      this.nb_tentatives = 0,
      this.nb_tentatives_terminees = 0,
      this.score_moyen,
      this.par_experience = const []});
  final String classe_nom;
  final List<ResultatEleve> eleves;
  final List<ErreurFrequente> erreurs_frequentes;
  final bool synthese;
  final int nb_eleves;
  final int nb_tentatives;
  final int nb_tentatives_terminees;
  final double? score_moyen;
  final List<BilanExperience> par_experience;
}

class BilanExperience {
  const BilanExperience({
    required this.experience_id,
    required this.nombre_tentatives,
    this.score_moyen,
    this.titre,
    this.matiere,
  });
  final String experience_id;
  final int nombre_tentatives;
  final double? score_moyen;
  final String? titre;
  final String? matiere;
}

class ResultatEleve {
  const ResultatEleve({
    required this.nom,
    required this.experiences_faites,
    required this.score_moyen,
    required this.derniere_activite,
  });
  final String nom;
  final int experiences_faites;
  final int score_moyen;
  final DateTime derniere_activite;
}

class ErreurFrequente {
  const ErreurFrequente({required this.code, required this.nb});
  final String code;
  final int nb;
}

/// Contrat : modele StatEtablissement (GET /stats/etablissements).
class StatEtablissement {
  const StatEtablissement({
    required this.nom,
    required this.commune,
    required this.nb_eleves_actifs,
    required this.taux_reussite,
    required this.progression_moyenne,
    this.etablissement_id,
    this.matiere,
    this.nombre_tentatives,
    this.score_moyen,
  });
  final String nom;
  final String commune;
  final int? nb_eleves_actifs;
  final double taux_reussite;
  final double progression_moyenne;
  final String? etablissement_id;
  final String? matiere;
  final int? nombre_tentatives;
  final double? score_moyen;
}
