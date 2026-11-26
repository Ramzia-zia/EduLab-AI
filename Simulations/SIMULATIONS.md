# SIMULATIONS.md : règles des simulations EduLab AI

Ce fichier garde dans le projet les règles données pour les simulations. En cas de conflit avec `docs/CONTRAT.md`, le contrat gagne et on s'arrête pour demander.

## Décisions prises avec le responsable du projet
- Le modèle physique reste en **Dart** (`packages/labo_core`). Pas de `physics.js` : le fichier `demo/banc_modele.js` est seulement un jumeau de `lib/src/banc_optique.dart`, tant que la démo n'est pas recompilée.
- Interface en **fond clair**.
- Travail uniquement sur les **simulations déjà dans `labo_core`** (10 labos). Pendule, mesure du pH et affaissement ne sont pas dans le projet : ils ne sont pas traités.
- Ordre : l'optique d'abord, puis les autres avec la même structure (état, modèle, gestes, assistant).

## Principe
Rien ne se passe sans une action de l'élève : il déplace, règle, verse, agite, lit, note, calcule. L'application réagit comme un vrai laboratoire. Tout se passe dans une scène 3D temps réel (Three.js), avec les tableaux et l'assistant sous la scène.

## Règles techniques
1. État et affichage séparés : un état unique modifié par les gestes, la scène redessinée à partir de lui.
2. Modèle physique dans Dart, testé. L'image, la couleur, le pH sortent du modèle.
3. Interaction directe (glisser, tourner, appuyer), tactile d'abord, zones tactiles d'au moins 44 px.
4. Animation continue, 30 images par seconde au minimum, hors ligne après le premier chargement.
5. Les effets (rayons, gouttes, liquide, couleur, flou) font partie de la simulation.
6. Matériel en 3D soigné. Caméra limitée avec vues préréglées (transition 0,6 s).
7. Aucun emoji. Textes en français avec accents.

## Ce que l'application ne fait jamais
Écrire « Bravo », « Félicitations » ou valider seule. Donner la réponse ou la valeur cherchée. Avancer seule d'une étape. Afficher un tableau rempli. Après les mesures de l'élève elle peut seulement : comparer son résultat à la référence (écart relatif), signaler les erreurs avec leur cause scientifique, donner un score détaillé, sur un ton neutre.

## Assistant
Il réagit à l'état réel, indices progressifs (3 au maximum), 120 mots au maximum, jamais la réponse. Règles locales hors ligne ; appel à l'IA du backend quand il y a du réseau (pas encore branché).

## Optique (valeurs du modèle, f' cachée)
f' = 15,0 cm (valeur du moteur existant, décision du responsable). Objet AB de 1,2 cm. 1/OA' - 1/OA = 1/f'. Image nette si l'écart est inférieur à 0,5 cm. Flou de 2,4 px par cm d'écart. Rayons pour h = +2, 0, -2 cm. Lecture de la règle à ± 0,5 mm.
Fichiers : `lib/src/banc_optique.dart`, `test/banc_optique_test.dart`, `demo/banc_modele.js` (jumeau), `demo/banc_interactif.js` (scène 3D), `demo/banc_ui.js` (tableaux, assistant, bilan).

## Conflits
- Réglé : le banc utilise f' = 15 cm et la tolérance de 0,5 cm du moteur existant et de `reference_values.json`.
- Les actions `deplacer_materiel`, `allumer_source` et les codes d'erreur d'optique sont à confirmer dans le contrat (chapitre 5).

## Gestes directs sur les 9 autres labos (`demo/gestes.js`)
Repères bleus posés sur le matériel 3D : un toucher ou un glissé appelle l'action du moteur, la scène se redessine.
- Électricité (4 labos) : bouton de tension (glisser), interrupteur K (toucher), calibre de chaque appareil (toucher), inversion V/COM et masse (toucher).
- Oscilloscope : sensibilité et base de temps (glisser), commutateur GND/DC (toucher), fréquence du GBF (glisser), tension de l'alimentation, masses.
- Migration : tension, rhéostat (glisser), interrupteur, dépôt des deux cristaux (toucher).
- Osmose : toucher un tube pour y introduire les tranches.
- Sol : agiter le bocal avec des cercles du doigt (1 s de cercles = 6 s d'agitation simulée).
- Dosage : ouvrir le robinet au doigt (fermé, goutte à goutte ou jet), gouttes qui tombent de la burette, flacon qui tourbillonne, vues Ensemble, Burette et Erlenmeyer.
Les curseurs et boutons sous la scène restent comme alternative précise.

## Ce qui reste à faire pour ces 9 labos
Le robinet n'a que 3 positions (le moteur n'a pas d'ouverture progressive). L'agitation du dosage est visuelle : le moteur ne la modélise pas. Pas de ménisque, de bulle d'air, de pipette avec poire, de gouttes de compte-gouttes, ni d'étapes 1 à 9 de la SPEC : ils demandent de nouvelles scènes et de nouvelles règles dans le moteur Dart. Pas d'indices progressifs à 3 niveaux ni de tableaux par méthode en dehors de l'optique.

## Dosage acide-base au niveau de la SPEC (`demo/dosage_spec.js`, `demo/dosage_modele.js`, `lib/src/dosage_manuel.dart`)
Fait : scène 3D propre au dosage (statif, burette graduée de 0 à 25 mL avec ménisque, robinet, entonnoir, erlenmeyer sur feuille blanche, deux béchers étiquetés, pipette jaugée avec propipette A, S, E, compte-gouttes, évier, pissette, lunettes, pH-mètre en option). Gestes : mettre les lunettes, serrer la pince (molette), soulever et incliner le bécher de soude au-dessus de l'entonnoir (bulle d'air créée), ouvrir le robinet progressivement (goutte à goutte, filet, jet), pipette (A puis S pour aspirer, E pour ajuster le ménisque au trait, toucher pour vider), compte-gouttes (une goutte par toucher), erlenmeyer à glisser sous la burette et à agiter en cercles, vidage dans l'évier, rinçage. Le rose apparaît à la goutte qui dépasse l'équivalence, la tache rose locale s'estompe selon l'agitation. Vues Burette, Erlenmeyer, Paillasse, Zoom lecture (oeil à hauteur du ménisque), Pipette (0,6 s). Cahier de laboratoire saisi par l'élève (volume lu, Va, Cb, choix de la formule parmi des distracteurs, Ca calculée), courbe (V, pH) tracée avec les points notés. Assistant avec indices à 3 niveaux et avertissements selon l'état. Bilan neutre : écart relatif, erreurs avec cause, score détaillé sur 100. Nouvelles valeurs (Ca entre 0,05 et 0,15, Va de 10, 20 ou 25 mL) à chaque « Refaire ».
Écart avec la SPEC : la SPEC dit à la fois « rose pâle à 16,05 mL » et « fuchsia intense au-dessus de pH 9,8 » (pH 10,14 à 16,05 mL). J'ai choisi un rose qui apparaît dès pH 8,2 et devient intense vers pH 11 : rose moyen à 16,05 mL, fuchsia en cas de surdosage.
Pas fait : ajustement de la hauteur de la burette avec la noix, entonnoir à poser, surface du liquide ondulante, sons, mode hors ligne (service worker), appel à l'IA du backend, mesure des 30 images par seconde, tests Dart non lancés (le jumeau JavaScript passe 68 vérifications sur les points de repère de la SPEC).

## Électricité au niveau de la SPEC (`demo/electricite_spec.js`) : 4 labos
Mesure de l'intensité, lois du courant, tension et masse, lois des tensions.
Fait : plaque de montage 3D avec alimentation (affichage, bouton de tension au doigt, voyant), résistances à bagues de couleur, interrupteur K à levier, bobine de fils, appareils à cadran de 100 divisions et multimètres à afficheur sur l'étagère. L'élève glisse chaque composant sur un emplacement proposé (série ou dérivation pour les résistances, points 1 à 3, branches, aux bornes de R1, R2, K, du générateur, points P et A pour les appareils) ; le moteur reçoit `placer_materiel` avec le bon emplacement et applique ses règles de sécurité (court-circuit, ampèremètre en dérivation, plus grand calibre d'abord). Les fils se dessinent d'après le montage : fil coupé et appareil inséré en série, pattes sur le dipôle en dérivation, fils de mesure rouge et COM, charges animées dont la vitesse suit le courant, inversion V/COM et masse au toucher. Calibre au toucher. Le cadran est lu par l'élève ; il note calibre, lecture, D, valeur, unité et incertitudes dans le cahier (envoyé au moteur par `mesurer`). Assistant à 3 niveaux selon l'état, bilan avec causes. Vues Ensemble, Montage, Cadrans, Générateur.
Pas fait : les valeurs R1 = 100 ohms et R2 = 150 ohms de l'animation sont recopiées de la fiche (le moteur reste seul juge des mesures) ; fils tirés un par un entre bornes (le moteur n'a que des emplacements) ; pile plate de 4,5 V ; mode hors ligne ; tests Dart non lancés.

## Oscilloscope (`demo/oscillo_spec.js`)
Fait : oscilloscope 3D avec écran quadrillé qui affiche la trace du moteur, boutons Sv et Sb à tourner, commutateur GND/DC, entrée Y1 et masse ; alimentation continue et GBF (affichages, boutons de tension et de fréquence) ; multimètre alternatif ; fils. L'élève pose l'oscilloscope, glisse une source sur l'entrée Y1, relie la masse en touchant la borne noire de la source, glisse le multimètre aux bornes du GBF, règle, lit sur le quadrillage et note. Question de réflexion sur la fréquence, assistant à 3 niveaux, bilan avec causes. Vues Ensemble, Écran, Commandes, Sources.
Pas fait : curseur de position verticale pour amener la trace sur la ligne de référence (le moteur ne le modélise pas), mesures automatiques par curseurs.

## Migration, osmose, sol (`demo/labos3_spec.js`)
Migration : papier-filtre sur plaque de verre, générateur avec bouton de tension, rhéostat, ampèremètre à calibre, K, gants, électrodes A et B à glisser aux deux extrémités, deux cristaux à déposer au centre du papier, fils (circuit ou court-circuit). Les taches colorées migrent avec le temps passé par l'élève (+1, +5, +10 min).
Osmose : quatre flacons étiquetés (eau et trois saccharoses), quatre tubes à glisser sur le flacon voulu, pomme de terre, couteau, règle, tranches introduites au toucher, temps qui passe (+30 min, +1 h, +2 h), tranches posées sur la règle graduée pour lire leur longueur.
Sol : bocal, terre, eau, règle graduée collée au bocal, secouage au doigt (monter et descendre ; 1 s de secouage = 6 s simulées, à valider avec toi car la fiche demande 3 minutes), décantation selon le moteur, couches de sable, limon et argile lisibles à la règle.
Pas fait : diagramme triangulaire des textures, filtration à l'eau claire, décantation visible dans l'eau pendant le repos (seul l'état final des couches est dessiné), mode hors ligne.

## Où en sont les 10 labos
Au niveau de la SPEC (scène propre, gestes, cahier saisi par l'élève, assistant, bilan neutre) : dosage, électricité (4 labos), oscilloscope, migration, osmose, sol. L'optique garde son banc interactif (premier modèle) ; il reste à lui donner le cahier de mesures du moteur (`mesurer`) à la place de ses tableaux locaux.
