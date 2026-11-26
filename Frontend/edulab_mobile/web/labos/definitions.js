// Généré depuis definitions/*.json (ne pas modifier à la main)
var DEFINITIONS = {
 "focale_lentille": {
  "id": "focale_lentille",
  "matiere": "physique",
  "niveau": "premiere",
  "materiel": [
   "banc_optique",
   "lentille_convergente",
   "ecran",
   "source_lumineuse",
   "objet_lumineux",
   "miroir_plan",
   "cherche_foyer",
   "reglet"
  ],
  "securite": [],
  "conseils": [
   {
    "quand": "autocollimation_sans_miroir",
    "niveau": "avertissement",
    "message": "Place le miroir plan juste derrière la lentille."
   },
   {
    "quand": "bessel_distance_insuffisante",
    "niveau": "avertissement",
    "message": "Pour la méthode de Bessel, il faut D > 4f'. Éloigne l'écran de l'objet."
   },
   {
    "quand": "image_nette_obtenue",
    "niveau": "information",
    "message": "L'image est nette. Lis les positions sur le banc."
   },
   {
    "quand": "trois_methodes_terminees",
    "niveau": "validation",
    "message": "Tu as trois valeurs de f'. Compare-les dans le tableau de conclusion."
   }
  ],
  "calcul": "optique"
 },
 "lois_courant": {
  "id": "lois_courant",
  "matiere": "physique",
  "niveau": "seconde",
  "materiel": [
   "alimentation",
   "amperemetre",
   "resistor_r1",
   "resistor_r2",
   "interrupteur_k",
   "fils"
  ],
  "securite": [
   {
    "regle_id": "amperemetre_en_serie",
    "avant": "fermer_interrupteur",
    "exige": "amperemetre_en_serie",
    "message": "Un ampèremètre se monte toujours en série, jamais en dérivation."
   },
   {
    "regle_id": "pas_de_court_circuit",
    "avant": "fermer_interrupteur",
    "exige": "montage_sans_court_circuit",
    "message": "Ne relie jamais directement les deux bornes du générateur par un simple fil."
   },
   {
    "regle_id": "grand_calibre_en_premier",
    "avant": "fermer_interrupteur",
    "exige": "plus_grand_calibre",
    "message": "Choisis d'abord le plus grand calibre, puis diminue-le progressivement."
   }
  ],
  "conseils": [
   {
    "quand": "aiguille_hors_echelle",
    "niveau": "avertissement",
    "message": "L'aiguille dépasse l'échelle. Choisis un calibre plus grand."
   },
   {
    "quand": "courants_serie_mesures",
    "niveau": "validation",
    "message": "Tu as mesuré l'intensité aux trois points. Compare I1, I2 et I3."
   },
   {
    "quand": "derivation_mesuree",
    "niveau": "information",
    "message": "Tu as mesuré I0, I1 et I2. Compare I0 à la somme I1 + I2."
   }
  ],
  "calcul": "electricite"
 },
 "lois_tensions": {
  "id": "lois_tensions",
  "matiere": "physique",
  "niveau": "seconde",
  "materiel": [
   "alimentation",
   "voltmetre",
   "resistor_r1",
   "resistor_r2",
   "interrupteur_k",
   "fils"
  ],
  "securite": [
   {
    "regle_id": "pas_de_court_circuit",
    "avant": "fermer_interrupteur",
    "exige": "montage_sans_court_circuit",
    "message": "Ne relie jamais directement les deux bornes du générateur par un simple fil."
   },
   {
    "regle_id": "grand_calibre_en_premier",
    "avant": "fermer_interrupteur",
    "exige": "plus_grand_calibre",
    "message": "Choisis d'abord le plus grand calibre, puis diminue-le progressivement."
   }
  ],
  "conseils": [
   {
    "quand": "voltmetre_en_serie",
    "niveau": "avertissement",
    "message": "Un voltmètre se branche en dérivation, aux bornes du dipôle."
   },
   {
    "quand": "somme_tensions_mesurees",
    "niveau": "information",
    "message": "Tu as mesuré U_PA, U_AN et U_PN. Compare U_PA + U_AN à U_PN."
   },
   {
    "quand": "tensions_derivation_mesurees",
    "niveau": "information",
    "message": "Tu as mesuré U_PN, U1 et U2. Compare ces trois tensions."
   }
  ],
  "calcul": "electricite"
 },
 "mesure_intensite": {
  "id": "mesure_intensite",
  "matiere": "physique",
  "niveau": "seconde",
  "materiel": [
   "alimentation",
   "amperemetre_aiguille",
   "multimetre",
   "resistor_r1",
   "resistor_r2",
   "interrupteur_k",
   "fils"
  ],
  "securite": [
   {
    "regle_id": "amperemetre_en_serie",
    "avant": "fermer_interrupteur",
    "exige": "amperemetre_en_serie",
    "message": "Un ampèremètre se monte toujours en série, jamais en dérivation."
   },
   {
    "regle_id": "pas_de_court_circuit",
    "avant": "fermer_interrupteur",
    "exige": "montage_sans_court_circuit",
    "message": "Ne relie jamais directement les deux bornes du générateur par un simple fil."
   },
   {
    "regle_id": "grand_calibre_en_premier",
    "avant": "fermer_interrupteur",
    "exige": "plus_grand_calibre",
    "message": "Choisis d'abord le plus grand calibre, puis diminue-le progressivement."
   }
  ],
  "conseils": [
   {
    "quand": "aiguille_hors_echelle",
    "niveau": "avertissement",
    "message": "L'aiguille dépasse l'échelle. Choisis un calibre plus grand."
   },
   {
    "quand": "calibre_reductible",
    "niveau": "information",
    "message": "Tu peux diminuer le calibre : l'aiguille restera sur l'échelle et la mesure sera plus précise."
   },
   {
    "quand": "calibre_optimal_atteint",
    "niveau": "validation",
    "message": "C'est le plus petit calibre qui garde l'aiguille sur l'échelle. Note ta lecture."
   }
  ],
  "calcul": "electricite"
 },
 "mesure_tension_masse": {
  "id": "mesure_tension_masse",
  "matiere": "physique",
  "niveau": "seconde",
  "materiel": [
   "alimentation",
   "voltmetre_aiguille",
   "multimetre",
   "resistor_r1",
   "resistor_r2",
   "interrupteur_k",
   "fils"
  ],
  "securite": [
   {
    "regle_id": "pas_de_court_circuit",
    "avant": "fermer_interrupteur",
    "exige": "montage_sans_court_circuit",
    "message": "Ne relie jamais directement les deux bornes du générateur par un simple fil."
   },
   {
    "regle_id": "grand_calibre_en_premier",
    "avant": "fermer_interrupteur",
    "exige": "plus_grand_calibre",
    "message": "Choisis d'abord le plus grand calibre, puis diminue-le progressivement."
   }
  ],
  "conseils": [
   {
    "quand": "aiguille_hors_echelle",
    "niveau": "avertissement",
    "message": "L'aiguille dépasse l'échelle. Choisis un calibre plus grand."
   },
   {
    "quand": "voltmetre_en_serie",
    "niveau": "avertissement",
    "message": "Un voltmètre se branche en dérivation, aux bornes du dipôle."
   },
   {
    "quand": "branchement_inverse",
    "niveau": "information",
    "message": "L'appareil affiche un signe moins : les bornes V et COM sont inversées par rapport au sens de la tension."
   }
  ],
  "calcul": "electricite"
 },
 "migration_ions": {
  "id": "migration_ions",
  "matiere": "physique",
  "niveau": "seconde",
  "materiel": [
   "alimentation",
   "rheostat",
   "amperemetre",
   "papier_filtre",
   "electrode_a",
   "electrode_b",
   "cristal_sulfate_cuivre",
   "cristal_permanganate",
   "gants",
   "spatule",
   "interrupteur_k",
   "fils"
  ],
  "securite": [
   {
    "regle_id": "gants_avant_cristaux",
    "avant": "deposer_cristal",
    "exige": "gants",
    "message": "Le permanganate de potassium tache la peau et les vêtements. Mets d'abord tes gants."
   },
   {
    "regle_id": "pas_de_court_circuit",
    "avant": "fermer_interrupteur",
    "exige": "montage_sans_court_circuit",
    "message": "Ne relie jamais directement les deux bornes du générateur par un simple fil."
   },
   {
    "regle_id": "grand_calibre_en_premier",
    "avant": "fermer_interrupteur",
    "exige": "plus_grand_calibre",
    "message": "Choisis d'abord le plus grand calibre, puis diminue-le progressivement."
   }
  ],
  "conseils": [
   {
    "quand": "courant_nul",
    "niveau": "avertissement",
    "message": "Aucun courant ne passe. Vérifie que K est fermé et que le circuit est complet."
   },
   {
    "quand": "duree_observation_atteinte",
    "niveau": "information",
    "message": "Dix minutes se sont écoulées. Tu peux ouvrir K et observer la position des taches."
   }
  ],
  "calcul": "migration_ions"
 },
 "oscilloscope_tension": {
  "id": "oscilloscope_tension",
  "matiere": "physique",
  "niveau": "seconde",
  "materiel": [
   "alimentation",
   "gbf",
   "oscilloscope",
   "multimetre",
   "fils"
  ],
  "securite": [
   {
    "regle_id": "masse_commune",
    "avant": "mesurer",
    "exige": "masse_commune",
    "message": "Relie d'abord la masse du générateur à la masse de l'oscilloscope."
   }
  ],
  "conseils": [
   {
    "quand": "reference_non_reglee",
    "niveau": "information",
    "message": "Place le commutateur sur GND et amène la trace sur la ligne de référence (u = 0)."
   },
   {
    "quand": "trace_hors_ecran",
    "niveau": "avertissement",
    "message": "La trace sort de l'écran. Choisis une sensibilité verticale plus grande (V/div)."
   },
   {
    "quand": "sensibilite_reductible",
    "niveau": "information",
    "message": "Tu peux choisir une sensibilité plus petite : la trace restera visible et la lecture sera plus précise."
   }
  ],
  "calcul": "oscilloscope"
 },
 "osmose_pomme_de_terre": {
  "id": "osmose_pomme_de_terre",
  "matiere": "svt",
  "niveau": "premiere",
  "materiel": [
   "tube_1",
   "tube_2",
   "tube_3",
   "tube_4",
   "pomme_de_terre",
   "eau_distillee",
   "solution_saccharose_125",
   "solution_saccharose_250",
   "solution_saccharose_375",
   "couteau",
   "regle"
  ],
  "securite": [],
  "conseils": [
   {
    "quand": "tubes_identiques",
    "niveau": "avertissement",
    "message": "Deux tubes contiennent la même solution. Change l'un d'eux pour pouvoir comparer."
   },
   {
    "quand": "deux_heures_ecoulees",
    "niveau": "information",
    "message": "Deux heures se sont écoulées. Tu peux sortir les tranches et remesurer leur longueur."
   }
  ],
  "calcul": "svt_osmose"
 },
 "sol_constituants": {
  "id": "sol_constituants",
  "matiere": "svt",
  "niveau": "seconde",
  "materiel": [
   "bocal",
   "regle_graduee",
   "terre",
   "eau"
  ],
  "securite": [],
  "conseils": [
   {
    "quand": "agitation_a_faire",
    "niveau": "avertissement",
    "message": "Ferme le bocal et secoue-le vigoureusement pendant 3 minutes."
   },
   {
    "quand": "couches_visibles",
    "niveau": "information",
    "message": "Les couches sont bien séparées. Mesure la hauteur de chaque couche et celle de la terre totale."
   }
  ],
  "calcul": "svt_sol"
 },
 "titrage_acide_base": {
  "id": "titrage_acide_base",
  "matiere": "chimie",
  "niveau": "terminale",
  "materiel": [
   "lunettes",
   "burette",
   "becher",
   "soude",
   "erlenmeyer",
   "pipette",
   "phenolphtaleine"
  ],
  "securite": [
   {
    "regle_id": "lunettes_avant_soude",
    "avant": "tourner_robinet",
    "exige": "lunettes",
    "message": "Mets d'abord tes lunettes : la soude peut abîmer les yeux."
   }
  ],
  "conseils": [
   {
    "quand": "volume_proche_equivalence",
    "niveau": "avertissement",
    "message": "Tu approches de l'équivalence. Ralentis : goutte à goutte."
   },
   {
    "quand": "equivalence_atteinte",
    "niveau": "validation",
    "message": "Le rose pâle persiste : repère le volume versé sur la burette."
   }
  ],
  "calcul": "titrage"
 }
};
