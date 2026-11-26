# Pousser sur ta branche GitHub

Remplace `ta-branche` par le nom de ta branche. Les commandes se lancent à la racine de ton dépôt (pas dans ce zip).

1. Copie dans ton dépôt :
   - `packages/labo_core/` (tout le dossier)
   - `docs/CONTRAT_proposition_changement_01.md` dans `docs/`
   - `reference_values.json` : remplace le tien seulement s'il est identique à l'ancien, sinon copie les 33 nouveaux cas dedans
   - `construire_demo.sh` et `construire_demo.bat` (facultatif)
   - `.gitignore` : ajoute ses 3 lignes au tien si tu en as déjà un
2. Reporte la demande de changement dans `docs/CONTRAT.md` : version 0.2, nouvelle ligne dans l'historique.
3. Vérifie avec `./lancer_tests.sh` (copie-le aussi si tu veux) ou depuis `packages/labo_core` : `dart run test/tous_test.dart`.
4. Envoie sur GitHub :

```bash
git checkout ta-branche            # ou : git checkout -b ta-branche
git status
git add docs reference_values.json
git commit -m "Contrat 0.2 : 7 expériences de physique issues des TP"
git add packages/labo_core .gitignore
git commit -m "labo_core : moteur des 7 labos, définitions JSON et skills de l'assistant"
git push -u origin ta-branche
```

5. Sur GitHub, ouvre une Pull Request depuis ta branche.
6. Préviens Backend et Front-end avant la fusion (règle 6 du projet).


---

# Poussée suivante : laboratoires interactifs (étapes à suivre dans l'ordre)

Avant de pousser, trois vérifications que je n'ai pas pu faire à ta place :

1. **Tests Dart** : `./lancer_tests.sh`. Deux fichiers sont nouveaux et n'ont jamais été lancés : `test/banc_optique_test.dart` et `test/dosage_manuel_test.dart`. S'ils échouent, corrige-les avant de pousser.
2. **Recompiler le moteur** : `./construire_demo.sh` (régénère `demo/labo_core.js`).
3. **Recompiler la scène 3D** : `cd packages/labo_core/web3d && npm install && npm run build`. Le code source `web3d/scene3d.js` contient maintenant le crochet `__tick` et l'accès `three` dont les modules `demo/*_spec.js` ont besoin : le fichier `demo/scene3d.js` livré a été corrigé à la main avec la même modification, la recompilation doit donner le même résultat. Ouvre ensuite `demo/index.html#titrage_acide_base` et `#focale_lentille` pour vérifier.

Fichiers à copier : `packages/labo_core/` en entier (y compris `demo/` et `web3d/`), `docs/CONTRAT_proposition_changement_02.md`, `SIMULATIONS.md`.
Contrat : la demande n°02 est **à valider** par Backend et Front-end avant la fusion (les nouveaux codes d'erreur n'y sont pas encore).

```bash
git checkout -b labos-interactifs
git add docs SIMULATIONS.md
git commit -m "Demande de changement 02 et règles des simulations"
git add packages/labo_core
git commit -m "labo_core : banc d'optique, dosage manuel, labos interactifs 3D"
git push -u origin labos-interactifs
```
