# Livraison EduLab AI : 7 labos de physique (labo_core)

## Tester sur ta machine

1. Décompresse ce zip.
2. Il faut Dart (ou Flutter, qui l'inclut). Vérifie avec `dart --version`.
3. Lance :
   - Mac / Linux : `./lancer_tests.sh`
   - Windows : double-clique sur `lancer_tests.bat`
4. Résultat attendu à la fin : `158 tests réussis, 0 échecs.` et `12 cas d'autres expériences ignorés`.

## Ce que contient le zip

| Chemin | Contenu |
|---|---|
| `packages/labo_core/` | le moteur Dart (`lib/`), les tests (`test/`), les définitions JSON (`definitions/`), les skills de l'assistant (`skills/`), le README |
| `reference_values.json` | tes 12 cas existants (recopiés) + les 33 nouveaux : 45 cas |
| `docs/CONTRAT_proposition_changement_01.md` | la demande de changement du contrat (à reporter dans `docs/CONTRAT.md`) |
| `GUIDE_GITHUB.md` | les commandes pour pousser sur ta branche |

## Attention

- `reference_values.json` a été reconstitué à partir du fichier que tu m'as envoyé. Si le tien a changé depuis, ne l'écrase pas : copie seulement les 33 cas de `packages/labo_core/reference_values_ajouts.json` dans ton fichier.
- Les 12 cas d'autres expériences (titrage, pendule, affaissement, pH) sont ignorés par ces tests : leur calcul n'est pas encore dans `labo_core`.
- Des valeurs de simulation sont des hypothèses à faire valider : voir le chapitre 7 du contrat.
