# Demande de changement n°1 : expériences issues des fiches de TP

Contrat visé : `docs/CONTRAT.md` version 0.1, proposition pour la version 0.2.
Statut : **Accord de Simulations donné le 2026-11-08**. À prévenir avant fusion : Backend et Front-end (voir en-tête). Le moteur des 7 expériences est codé dans `labo_core` (158 tests réussis).

| | |
|---|---|
| Demandeur | Simulations |
| Date | 2026-11-08 |
| Source | 7 fiches de TP de EGAH Kossi Edinam (Lycée Scientifique de Dapaong) : lentilles (Première CD), courant (3 fiches) et tension (3 fiches) en 2S |
| Personnes à prévenir avant fusion | Backend (lignes `experience` à insérer, lecture des skills), Front-end (nouvelles actions, emplacements et conditions) |
| Accord | Simulations : ok, 2026-11-08. Backend : ... / Front-end : ... |

## 0. Ce qui ne change pas

Aucune migration SQL, aucune route, aucune table, aucune colonne.

- `evenement_tentative.action` est un texte libre (chapitre 5) : on ajoute des valeurs, pas de type.
- `bilan.erreurs` est une liste de codes : on ajoute des codes.
- `tentative.resultat` est du JSON libre : on ajoute des clés.
- `experience.id` est un texte lisible, `matiere = physique`, `niveau = seconde` ou `premiere` : valeurs déjà permises.

Ce que le backend doit faire : insérer 7 lignes dans `experience` (chapitre 1 ci-dessous) à partir des fichiers `definitions/*.json`.

## 1. Nouvelles expériences (chapitre 2, table `experience`)

| id | titre | matière | niveau | duree_min, difficulte |
|---|---|---|---|---|
| `migration_ions` | Nature et sens du courant : migration des ions | physique | seconde | à fixer |
| `mesure_intensite` | Mesure de l'intensité du courant | physique | seconde | à fixer |
| `lois_courant` | Lois du courant : unicité et nœuds | physique | seconde | à fixer |
| `mesure_tension_masse` | Mesure d'une tension continue et notion de masse | physique | seconde | à fixer |
| `lois_tensions` | Lois des tensions | physique | seconde | à fixer |
| `oscilloscope_tension` | Étude d'une tension à l'oscilloscope | physique | seconde | à fixer |
| `focale_lentille` | Distance focale d'une lentille mince (3 méthodes) | physique | premiere | à fixer |

Les fiches ne donnent pas de durée ni de difficulté pour la simulation (la fiche d'optique dit 2 h de TP réel). Je n'invente rien : à fixer avec le professeur.

## 2. Nouvelles actions (chapitre 5)

Actions déjà au contrat et réutilisées : `placer_materiel`, `action_bloquee`, `mesurer`, `terminer`.

| Action | Valeurs | Expériences |
|---|---|---|
| `placer_materiel` (ajout) | `materiel_id`, **nouveau, optionnel** : `emplacement_id` (ex. `point_1`, `bornes_r1`, `bornes_generateur`, `gauche`, `droite`) | toutes |
| `regler_tension` | `tension_v` (alimentation) | électricité, migration_ions, oscilloscope_tension |
| `fermer_interrupteur`, `ouvrir_interrupteur` | rien | électricité, migration_ions |
| `choisir_calibre` | `materiel_id`, et `calibre_a` ou `calibre_v` | mesure_intensite, lois_courant, mesure_tension_masse, lois_tensions |
| `inverser_branchement` | `materiel_id` | mesure_tension_masse |
| `relier_masse` | `point_id` | mesure_tension_masse, oscilloscope_tension |
| `regler_rheostat` | `resistance_ohm` | migration_ions |
| `deposer_cristal` | `materiel_id` | migration_ions |
| `choisir_couplage` | `couplage` (`gnd` ou `dc`) | oscilloscope_tension |
| `regler_sensibilite` | `sensibilite_v_par_div` | oscilloscope_tension |
| `regler_base_temps` | `base_temps_s_par_div` | oscilloscope_tension |
| `regler_gbf` | `frequence_hz` | oscilloscope_tension |
| `deplacer_materiel` | `materiel_id`, `position_cm` (sur le banc) | focale_lentille |
| `mesurer` (ajout) | `valeur`, `unite`, **nouveau, optionnel** : `grandeur_id` | toutes |

Le temps qui passe n'est pas un événement : le moteur reçoit un delta de temps, et l'horodatage des événements suffit à rejouer.

### Valeurs de `emplacement_id` (nouveau)

| Matériel | Emplacements |
|---|---|
| `resistor_r1`, `resistor_r2` | `serie`, `derivation` (obligatoire) |
| ampèremètre, voltmètre, multimètre (électricité) | `point_1`, `point_2`, `point_3`, `branche_principale`, `branche_r1`, `branche_r2` (dans la boucle) ; `bornes_r1`, `bornes_r2`, `bornes_generateur` (aux bornes) ; seulement pour la tension : `bornes_k`, `point_p`, `point_a` (obligatoire) |
| `fils` | `circuit`, `bornes_generateur` |
| `alimentation`, `gbf` (oscilloscope) | `entree_y1` |
| `multimetre` (oscilloscope) | `bornes_gbf` |
| `electrode_a`, `electrode_b` (migration) | `gauche`, `droite` (obligatoire) |
| `miroir_plan` | `derriere_lentille` |

`electrode_a` est reliée à la borne + (anode), `electrode_b` à la borne − (cathode). Les cristaux ne se posent pas avec `placer_materiel` mais avec `deposer_cristal`.
`mesurer.valeur` est un nombre, sauf pour `electrode_cu2_plus` et `electrode_mno4_moins` où c'est le texte `anode` ou `cathode`.

### Valeurs de `grandeur_id` dans `mesurer`

| Expérience | grandeur_id |
|---|---|
| `mesure_intensite` | `intensite_aiguille_a`, `intensite_multimetre_a` |
| `lois_courant` | `i_point_1_a`, `i_point_2_a`, `i_point_3_a`, `i_branche_principale_a`, `i_branche_r1_a`, `i_branche_r2_a` |
| `mesure_tension_masse` | `u_pa_v`, `u_an_v`, `u_pn_v`, `u_ap_v`, `u_k_ouvert_v`, `u_k_ferme_v`, `v_p_v`, `v_a_v` |
| `lois_tensions` | `u_pa_v`, `u_an_v`, `u_pn_v`, `u1_v`, `u2_v` |
| `oscilloscope_tension` | `u_continue_v`, `n_div`, `ym_div`, `u_multimetre_v`, `periode_s`, `frequence_hz`, `um_v`, `ueff_v` |
| `focale_lentille` | `position_a_cm`, `position_o_cm`, `distance_objet_ecran_cm`, `position_l1_cm`, `position_l2_cm`, `oa_cm`, `oa_prime_cm`, `f_prime_cm` |
| `migration_ions` | `courant_ma`, `duree_min` |

**Correction faite en codant.** La version précédente listait `distance_d_cm`, ambigu : D (distance objet-écran) et d (écart entre les deux positions de la lentille) deviennent la même chose en snake_case. Le nom retenu est `distance_objet_ecran_cm` pour D. L'écart d n'est pas saisi : il se calcule à partir de `position_l1_cm` et `position_l2_cm`.

## 3. Conditions nommées (chapitre 6)

Aujourd'hui `exige` ne peut être qu'un matériel. Proposition : `exige` peut aussi être l'identifiant d'une **condition** calculée par le code, comme `quand` l'est déjà pour les conseils.

| Condition (`exige`) | Vraie quand |
|---|---|
| `montage_sans_court_circuit` | aucun fil ne relie directement les deux bornes du générateur |
| `amperemetre_en_serie` | l'ampèremètre est dans la boucle, pas aux bornes d'un dipôle ni du générateur |
| `plus_grand_calibre` | le sélecteur est sur le plus grand calibre |
| `masse_commune` | la masse du générateur est reliée à la masse de l'oscilloscope |

Conditions de conseils (`quand`) : `aiguille_hors_echelle`, `calibre_reductible`, `calibre_optimal_atteint`, `courants_serie_mesures`, `derivation_mesuree`, `voltmetre_en_serie`, `branchement_inverse`, `somme_tensions_mesurees`, `tensions_derivation_mesurees`, `reference_non_reglee`, `trace_hors_ecran`, `sensibilite_reductible`, `autocollimation_sans_miroir`, `bessel_distance_insuffisante`, `image_nette_obtenue`, `trois_methodes_terminees`, `courant_nul`, `duree_observation_atteinte`.

Le format des définitions JSON ne change pas : mêmes 7 champs (`id`, `matiere`, `niveau`, `materiel`, `securite`, `conseils`, `calcul`). Les 7 fichiers sont dans `definitions/`. Valeurs de `calcul` : `electricite` (4 expériences), `oscilloscope`, `optique`, `migration_ions`.

## 4. Nouveaux codes d'erreur du bilan (chapitre 5)

Réutilisé : `gants_oublies`.

| Code | Détecté quand | Expériences |
|---|---|---|
| `amperemetre_en_derivation` | l'élève tente de fermer K avec l'ampèremètre hors de la boucle | mesure_intensite, lois_courant |
| `court_circuit_generateur` | blocage `pas_de_court_circuit` déclenché | électricité, migration_ions |
| `grand_calibre_oublie` | blocage `grand_calibre_en_premier` déclenché | électricité, migration_ions |
| `calibre_trop_petit` | l'aiguille reste en butée au moment de la mesure | électricité |
| `voltmetre_en_serie` | voltmètre placé dans la boucle au moment de la mesure | mesure_tension_masse, lois_tensions |
| `lecture_cadran` | lecture saisie différente de la lecture réelle (tolérance à fixer) | mesure_intensite, mesure_tension_masse |
| `masse_oscilloscope_oubliee` | blocage `masse_commune` déclenché | oscilloscope_tension |
| `trace_hors_ecran` | mesure enregistrée avec la trace hors de l'écran | oscilloscope_tension |
| `lecture_oscillogramme` | `n_div` ou `ym_div` saisis différents de la lecture réelle | oscilloscope_tension |
| `confusion_maximale_efficace` | `ueff_v` saisie proche de `um_v` (pas divisée par √2) | oscilloscope_tension |
| `distance_objet_ecran_trop_petite` | méthode de Bessel avec D < 4f' | focale_lentille |
| `image_non_nette` | position enregistrée sans image nette | focale_lentille |
| `signe_distance_algebrique` | OA saisie positive | focale_lentille |
| `electrode_inversee` | charge attribuée à la mauvaise électrode | migration_ions |

## 5. Résultats enregistrés (`tentative.resultat`)

| Expérience | Clés |
|---|---|
| `mesure_intensite` | `intensite_aiguille_a`, `intensite_multimetre_a`, `delta_i_a`, `tau` |
| `lois_courant` | `i_point_1_a`, `i_point_2_a`, `i_point_3_a`, `i_branche_principale_a`, `i_branche_r1_a`, `i_branche_r2_a` |
| `mesure_tension_masse` | `u_pa_v`, `u_an_v`, `u_pn_v`, `v_p_v`, `v_a_v` |
| `lois_tensions` | `u_pa_v`, `u_an_v`, `u_pn_v`, `u1_v`, `u2_v` |
| `oscilloscope_tension` | `u_continue_v`, `periode_s`, `frequence_hz`, `um_v`, `ueff_v` |
| `focale_lentille` | `f_prime_bilbermann_cm`, `f_prime_bessel_cm`, `f_prime_descartes_cm`, `f_prime_moyenne_cm`, `vergence_dioptries` |
| `migration_ions` | `courant_ma`, `duree_min`, `electrode_cu2_plus`, `electrode_mno4_moins` |

## 6. Valeurs de référence (chapitre 7)

33 cas à ajouter à `reference_values.json` : fichier `reference_values_ajouts.json`. Ils sont lus par les tests Dart (86 tests, tous réussis). Les tests Python du backend doivent lire les mêmes cas si le backend recalcule ces valeurs.

D'où viennent les nombres :

- Fournis par les fiches : R1 = 100 Ω, R2 = 150 Ω, alimentation 6 V, pile 4,5 V (V_P = 4,5 V et V_A = 2,7 V figurent sur le schéma), calibres 0,1 / 0,3 / 1 / 3 A et cadran de 100 divisions (figure du TP intensité), formules de chaque TP.
- **Choisis par moi pour la simulation, à faire relire** : lentille de f' = 15 cm, D = 80 cm, classe d'appareil 1,5, signal à 200 Hz, Sv = 2 V/div, Sb = 1 ms/div.

## 7. Questions restées sans réponse : valeurs retenues par défaut

1. Incertitude : la fiche demande ΔI sans donner la formule. J'ai pris ΔI = classe × calibre / 100 avec une classe de 1,5. Formule et classe à valider.
2. Écart-type du tableau de comparaison : n − 1 (touche σn-1 des calculatrices) ou n ?
3. Lentille simulée : f' = 15 cm convient-elle ? Quelle tolérance pour dire que l'image est « nette » ?
4. Calibres du voltmètre et du multimètre : non donnés par les fiches.
5. Migration des ions : les fiches disent seulement « quelques dizaines de mA » et « 10 à 15 minutes ». Il manque la vitesse de migration en fonction du courant et la durée accélérée de la simulation. Seule la direction est calculée aujourd'hui.
6. GBF : amplitude et plage de fréquence (la fiche dit « quelques centaines de hertz »).
7. Écran de l'oscilloscope : nombre de divisions (le schéma semble en montrer 8 en hauteur).
8. Durée et difficulté de chaque expérience (colonnes `duree_min` et `difficulte`).
9. La maquette « Circuit simple » affiche U = 6,0 V et I = 0,20 A. Avec R1 = 100 Ω et R2 = 150 Ω sous 6 V, on trouve 0,024 A en série et 0,100 A en dérivation. Cette ligne ne correspond à aucune fiche : maquette provisoire, ou autre expérience ?

---

Les questions 1 à 9 n'ont pas encore de réponse. Le moteur utilise ces valeurs par défaut, réunies dans des classes de paramètres faciles à changer (`ParametresElectricite`, `ParametresOscilloscope`, `ParametresOptique`, `ParametresMigration`). **Toutes sont des hypothèses de simulation, à faire relire.**

| Paramètre | Valeur par défaut | Source |
|---|---|---|
| R1, R2, tension 6 V, pile 4,5 V, calibres de l'ampèremètre 0,1 / 0,3 / 1 / 3 A, cadran de 100 divisions | 100 Ω, 150 Ω... | fiches de TP |
| Tension maximale de l'alimentation | 12 V | fiches (0 à 12 V ou 6 à 12 V) |
| Calibres du voltmètre | 3, 10, 30 V | hypothèse |
| Classe des appareils à aiguille | 1,5 | hypothèse |
| Tolérance de lecture à l'aiguille | 1 division | hypothèse |
| Résolution du multimètre | 1 mA ou 0,001 V (0,01 V à l'oscilloscope) | hypothèse |
| Sensibilités de l'oscilloscope | 0,1 à 10 V/div | hypothèse (exemple de la fiche : 2 V/div) |
| Bases de temps | 0,1 à 20 ms/div | hypothèse (exemple de la fiche : 5 ms/div) |
| Écran de l'oscilloscope | 8 divisions en hauteur, 10 en largeur | hypothèse |
| GBF | valeur maximale 6 V, de 50 à 2000 Hz | hypothèse |
| Distance focale de la lentille | 15 cm (cachée à l'élève) | hypothèse |
| Tolérance de netteté | 0,5 cm | hypothèse |
| Banc d'optique | 100 cm | fiche (« env. 1 m ») |
| Résistance du papier-filtre, plage du rhéostat | 50 Ω, 0 à 330 Ω | hypothèse |
| Vitesse de migration | atteint les électrodes en 600 s pour 30 mA, proportionnelle au courant | hypothèse (« 10 à 15 min » et « quelques dizaines de mA » dans la fiche) |
| Ordre des calibres | l'appareil est posé sur son plus petit calibre et revient dessus à chaque déplacement | choix de conception : oblige l'élève à choisir le plus grand calibre avant de fermer K |

## 8. Skills de l'assistant IA (nouveau, impératif)

Chaque laboratoire a un fichier skill `.md`, que l'assistant lit pour ne pas dériver.

- Chemin : `skills/<experience.id>.md` (7 fichiers livrés, dans le dossier `skills/` du paquet).
- Lecteur : FastAPI, dans `services/assistant`, charge seulement le skill de l'expérience en cours (`experience_id` de la demande `/assistant`) et l'ajoute au prompt. Il complète les 8 règles existantes, qui gagnent en cas de conflit.
- Contenu : garde-fous, objectifs, matériel, déroulé, actions, clés d'état lisibles, règles de sécurité, conseils, formules, questions de la fiche, **liste de ce qu'il est interdit de révéler**, erreurs avec indices de niveau 1, 2 et 3, exemples, limites de la simulation.
- **Jamais de corrigé** (contrat chapitre 3, règles de l'assistant) : aucune valeur finale, aucune réponse aux questions du TP, jamais la distance focale cachée. Un test automatique vérifie une liste de valeurs et de réponses interdites.
- Les règles de sécurité, les conseils et le matériel du skill sont copiés des fichiers JSON de définition. Un test vérifie qu'ils restent identiques : si on change un JSON, on régénère le skill.
- Les 4 expériences existantes (`titrage_acide_base`, `pendule_simple`, `essai_affaissement`, `mesure_ph`) n'ont pas encore de skill : il manque leurs fiches de TP.


# Demande de changement n°2 : points du dosage acide-base déjà signalés

| Point | Proposition |
|---|---|
| Robinet : la maquette a 3 positions, le contrat a `niveau` de 0 à 1 | Remplacer `tourner_robinet.niveau` par `debit` avec 3 valeurs : `ferme`, `goutte_a_goutte`, `jet`. Changement qui casse : prévenir Front-end et Backend. Aucune migration (JSON libre). |
| Matériel du dosage : maquette (lunettes, burette, bécher, pipette) et contrat (lunettes, burette, soude, erlenmeyer, pipette, phenolphtaleine) | Garder le contrat et y ajouter `becher`. |
| Erreurs de la vue enseignant : « Lecture du ménisque », « Unités de concentration » | « Lecture du ménisque » est l'étiquette affichée du code existant `lecture_burette`. Ajouter le code `unite_concentration`. |
| pH de départ : maquette 3,0, référence 1,1 | À corriger dans la maquette : `reference_values.json` arbitre. |
| Écart relatif : maquette 0,4 %, calcul 0,3 % (0,31 %) pour 16,05 mL contre 16,0 mL | À corriger dans la maquette. |
| Taille du texte : charte à 12 px et 11 px, règle du projet : 14 px minimum | Front-end à trancher. |
| Bouton « Parent » et CSV (nom, prénom, classe, identifiant) vs contrat (nom, role, classe, email) | Hors simulations : Front-end et Backend. |

# Réponses

Backend : ... / Front-end : ... / Simulations : ...
