# labo_core

Formules et laboratoires des simulations EduLab AI. Dart pur : aucun import Flutter, aucun `dart:io` dans `lib/`.

## Contenu

| Dossier ou fichier | Contenu |
|---|---|
| `lib/src/noyau.dart` | événements, état immuable, définitions JSON, moteur `Laboratoire.appliquer` |
| `lib/src/labo_electricite.dart` | `mesure_intensite`, `lois_courant`, `mesure_tension_masse`, `lois_tensions` |
| `lib/src/labo_oscilloscope.dart` | `oscilloscope_tension` |
| `lib/src/labo_optique.dart` | `focale_lentille` (Bilbermann, Bessel, Descartes) |
| `lib/src/labo_migration.dart` | `migration_ions` |
| `lib/src/labo_svt.dart` | SVT : `osmose_pomme_de_terre`, `sol_constituants` |
| `lib/src/electricite.dart`, `optique.dart`, `oscilloscope.dart`, `migration_ions.dart`, `statistiques.dart` | formules pures |
| `definitions/*.json` | définitions des 7 expériences (format du contrat, chapitre 6) |
| `skills/*.md` | un skill par labo pour l'assistant IA (contrat, section 8) |
| `reference_values_ajouts.json` | 33 cas à ajouter à `reference_values.json` |
| `demo/` | démo à ouvrir dans le navigateur : `demo/index.html` (moteur compilé en JavaScript) |
| `web/api.dart`, `tool/generer_demo.dart` | pont Dart vers JavaScript et générateur de `demo/definitions.js` |

## Utilisation par l'application

```dart
final labo = creerLaboratoire(DefinitionExperience.fromJson(jsonDecode(texteJson)));
var etat = labo.etatInitial();

final r = labo.appliquer(etat, 'placer_materiel',
    {'materiel_id': 'alimentation'}, DateTime.now().toUtc());
etat = r.etat;                       // nouvel état (l'ancien ne change pas)
final ligne = r.evenement.toJsonAvecIds(id: uuid(), tentativeId: tentative.id);
if (r.bloquee) afficher(r.message);  // action refusée par une règle de sécurité

etat = labo.avancer(etat, 1.0);      // le temps vient d'un paramètre
final conseils = labo.conseilsActifs(etat);
final erreurs = labo.erreursBilan(etat);   // codes du contrat, pour le bilan
final resultat = labo.resultat(etat);      // tentative.resultat
```

Le dessin lit l'état avec `LaboElectricite.lectureAppareil`, `LaboOscilloscope.affichage`, `LaboOptique.affichage`,
`LaboMigration.affichage` : il ne calcule rien.

- Une action inconnue ou des valeurs invalides lèvent `ArgumentError` : c'est une erreur de l'interface, pas de l'élève.
- Une action interdite par la sécurité renvoie `bloquee` et un événement `action_bloquee`.
- Les valeurs par défaut de l'appareillage sont dans `ParametresElectricite`, `ParametresOscilloscope`,
  `ParametresOptique`, `ParametresMigration` : **hypothèses à valider**, voir le contrat.

## Voir le résultat dans le navigateur

Ouvre `demo/index.html` (double-clic). Pour la reconstruire après une modification du code ou des définitions :

    dart run tool/generer_demo.dart
    dart compile js -O2 --no-source-maps web/api.dart -o demo/labo_core.js

## Lancer les tests

    dart run test/tous_test.dart

Le fichier de référence est lu dans `REFERENCE_VALUES`, sinon `../../reference_values.json`,
sinon `reference_values.json`, sinon `reference_values_ajouts.json`.
Les cas d'autres expériences (titrage, pendule, affaissement, pH) sont ignorés et comptés.

## Passer à package:test

`test/mini_test.dart` imite `package:test` (pub.dev n'était pas joignable pendant le développement).
Dans le dépôt : ajouter `test: ^1.25.0` en `dev_dependencies`, remplacer `import 'mini_test.dart';`
par `import 'package:test/test.dart';`, supprimer `tous_test.dart` et `mini_test.dart`, lancer `dart test`.
