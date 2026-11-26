// MODE DÉMO : fausses données pour voir le rendu du front sans serveur ni labo_core.
// À supprimer (avec main_demo.dart) quand le vrai backend est branché.
import '../core/api_provisoire/modeles.dart';

const profilDemo = Profil(id: 'demo-eleve', nom: 'Kossi Ametoglo', role: 'eleve');

const resumesDemo = [
  ExperienceResume(id: 'titrage_acide_base', matiere: 'chimie', niveau: 'terminale', titre: 'Dosage acide-base', dureeMin: 15, difficulte: 'moyen', version: 1, etat: 'en_cours'),
  ExperienceResume(id: 'mesure_ph', matiere: 'chimie', niveau: 'seconde', titre: 'Mesure du pH', dureeMin: 10, difficulte: 'facile', version: 1, etat: 'termine'),
  ExperienceResume(id: 'pendule_simple', matiere: 'physique', niveau: 'premiere', titre: 'Le pendule simple', dureeMin: 20, difficulte: 'moyen', version: 1, etat: 'a_commencer'),
  ExperienceResume(id: 'essai_affaissement', matiere: 'genie_civil', niveau: 'terminale', titre: 'Essai d\'affaissement du béton', dureeMin: 25, difficulte: 'difficile', version: 1, etat: 'a_commencer'),
];

const _definitionTitrage = <String, dynamic>{
  'id': 'titrage_acide_base',
  'matiere': 'chimie',
  'niveau': 'terminale',
  'materiel': ['lunettes', 'burette', 'soude', 'erlenmeyer', 'pipette', 'phenolphtaleine'],
  'securite': [
    {
      'regle_id': 'lunettes_avant_soude',
      'avant': 'verser_soude',
      'exige': 'lunettes',
      'message': 'La soude peut abîmer les yeux. Mets d\'abord tes lunettes.',
    },
  ],
  'conseils': [
    {
      'quand': 'volume_proche_equivalence',
      'niveau': 'avertissement',
      'message': 'Tu approches de l\'équivalence. Ralentis : goutte à goutte.',
    },
  ],
  'calcul': 'titrage',
};

ExperiencePack packDemo(String id) => ExperiencePack(
      id: id,
      version: 1,
      definition: id == 'titrage_acide_base'
          ? _definitionTitrage
          : {'id': id, 'materiel': const <String>[], 'securite': const [], 'conseils': const [], 'calcul': 'autre'},
    );
