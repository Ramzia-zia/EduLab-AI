# Livraison EduLab AI : 10 labos : physique, chimie et SVT (labo_core)

## Optique interactive

Le labo « Distance focale » utilise maintenant le banc 3D interactif (voir `SIMULATIONS.md`). Test du modèle : `node packages/labo_core/demo/test_banc_modele.js`. Les tests Dart (`banc_optique_test.dart`) n’ont pas pu être lancés par moi : à lancer avec `./lancer_tests.sh`.

## Nouvelle interface mobile

La démo a une interface inspirée de la vidéo : liste des expériences, pastilles de matériel (un toucher = placé dans la 3D), réglages en direct sans bouton « Appliquer », assistant, alerte sécurité, bilan. Ancienne version : `packages/labo_core/demo/ancienne_demo/`.

## Voir le résultat (le plus simple)

Double-clique sur **`OUVRIR_LA_DEMO.html`**. La démo s'ouvre dans ton navigateur, sans rien installer.

1. Choisis un laboratoire en haut de la page.
2. À gauche, choisis une action (placer du matériel, régler la tension, fermer K...) et clique sur « Faire l'action ».
3. Au milieu : le montage, les appareils (cadrans, écran d'oscilloscope, banc d'optique, papier-filtre).
4. À droite : les conseils de l'assistant, le bilan des erreurs et les événements envoyés au serveur.

Pour la chimie, choisis « Dosage acide-base » : place la burette, la soude, l'erlenmeyer, la pipette et les lunettes, verse 20 mL d'acide puis l'indicateur, ouvre le robinet en jet, puis passe en goutte à goutte près de 16 mL : la solution vire au rose. Sans lunettes, le robinet reste bloqué.

Un parcours pour essayer la sécurité : labo « Mesure de l'intensité », place l'alimentation, R1 et R2 (emplacement `serie`), K, l'ampèremètre à aiguille (`point_1`), règle 6 V, puis ferme K. L'action est bloquée tant que le calibre n'est pas le plus grand.

**Vue 3D** : les 10 labos (7 de physique, 1 de chimie, 2 de SVT) s'affichent en 3D (lumière et reflets physiques, ombres, verre). Tourne la scène avec la souris ou le doigt, zoome avec la molette ou deux doigts. Le bouton « Vue 2D » revient au schéma. La 3D s'adapte à la taille de l'écran (bureau, tablette, téléphone) et la page reprend le schéma 2D si le navigateur n'a pas WebGL. Three.js est embarqué : rien à télécharger.

La démo s'ouvre directement sur un labo avec son identifiant : `packages/labo_core/demo/index.html#focale_lentille` (utile pour un iframe).

Le calcul est fait par le vrai moteur `labo_core` compilé en JavaScript : la page ne fait que dessiner. Aucune donnée n'est envoyée sur internet.

## Lancer les tests

1. Il faut Dart (ou Flutter, qui l'inclut). Vérifie avec `dart --version`.
2. Mac / Linux : `./lancer_tests.sh`. Windows : double-clic sur `lancer_tests.bat`.
3. Résultat attendu : `187 tests réussis, 0 échecs.` et `7 cas d'autres expériences ignorés`.

## Reconstruire la démo (après une modification du code)

Pour la 3D, il faut Node : dans `packages/labo_core/web3d`, `npm install` puis `npm run build`.

`./construire_demo.sh` (Mac / Linux) ou `construire_demo.bat` (Windows).

## Ce que contient le zip

| Chemin | Contenu |
|---|---|
| `OUVRIR_LA_DEMO.html` | raccourci vers la démo |
| `packages/labo_core/` | le moteur Dart (`lib/`), les tests (`test/`), les définitions JSON (`definitions/`), les skills de l'assistant (`skills/`), la démo (`demo/`) |
| `reference_values.json` | tes 12 cas existants (recopiés) + les 33 nouveaux : 45 cas |
| `docs/CONTRAT_proposition_changement_01.md` | la demande de changement du contrat (à reporter dans `docs/CONTRAT.md`) |
| `GUIDE_GITHUB.md` | les commandes pour pousser sur ta branche |

## Attention

- La démo est un outil de développeur, pas l'application finale : elle n'a pas le design des maquettes, et le bilan y est visible à tout moment.
- `reference_values.json` a été reconstitué à partir du fichier que tu m'as envoyé. Si le tien a changé depuis, ne l'écrase pas : copie seulement les 33 cas de `packages/labo_core/reference_values_ajouts.json` dans le tien.
- Les 7 cas d'autres expériences (pendule, affaissement, pH) sont ignorés par ces tests : leur calcul n'est pas encore dans `labo_core`. Les 5 cas du titrage sont vérifiés.
- Des valeurs de simulation sont des hypothèses à faire valider : voir le chapitre 7 du contrat.
