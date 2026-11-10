# Pousser sur ta branche GitHub

Remplace `ta-branche` par le nom de ta branche. Les commandes se lancent à la racine de ton dépôt (pas dans ce zip).

1. Copie dans ton dépôt :
   - `packages/labo_core/` (tout le dossier)
   - `docs/CONTRAT_proposition_changement_01.md` dans `docs/`
   - `reference_values.json` : remplace le tien seulement s'il est identique à l'ancien, sinon copie les 33 nouveaux cas dedans
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
