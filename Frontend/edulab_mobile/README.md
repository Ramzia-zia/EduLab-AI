# EduLab AI : application mobile élève (Flutter)

Code écrit contre `CONTRAT.md` v0.1 (brouillon, « A valider ») et `reference_values.json`.
Les appels HTTP utilisent les chemins FastAPI tels qu'exposés (sans préfixe `/api/v1`).

## Mise en route

```bash
flutter create . --platforms=android      # crée le dossier android/ (absent du dépôt)
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # génère base_locale.g.dart (drift)
flutter analyze
flutter test
flutter run --profile `
  --dart-define=URL_API=https://... `
  --dart-define=URL_SUPABASE=https://... `
  --dart-define=CLE_ANON_SUPABASE=...
```

Pour lancer la démo des simulations dans Flutter Web :

```powershell
flutter run -t lib/main_demo.dart -d web-server --web-hostname 127.0.0.1 --web-port 8765
```

Ouvre ensuite `http://127.0.0.1:8765`. La route d'un laboratoire est
`#/laboratoire/<identifiant>`, par exemple `#/laboratoire/focale_lentille`.
L'interface 3D est affichée depuis `web/labos/` dans un iframe.

Ajouter la permission `INTERNET` dans `android/app/src/main/AndroidManifest.xml` si `flutter create` ne l'a pas fait.

## Écarts assumés (à résorber)

| Écart | Où | Pour revenir à la règle |
|---|---|---|
| Client d'API et modèles écrits à la main (pas d'`openapi.json`) | `lib/core/api_provisoire/` | Générer `edulab_api`, écrire un adaptateur qui implémente `ApiEdulab`, supprimer le dossier |
| Identifiants Dart en lowerCamelCase (`experienceId`), clés JSON en snake_case exact | partout | Convention Dart ; à confirmer |

Les dix simulations livrées sont publiées par l'API et affichées dans les pages Matières et
Expériences. Sur le Web, `web/labos/` les ouvre dans un iframe ; les gestes, le compte rendu et
la fin de tentative sont enregistrés localement puis synchronisés avec l'API. Les bilans de
classe affichent le nom de chaque simulation. L'interface 3D n'est pas disponible dans la
cible Android.

Le stockage hors ligne utilise SQLite/Drift sur les plateformes natives et les préférences
locales du navigateur sur le Web ; la file des tentatives et le cache du catalogue sont
conservés dans les deux cas.

## Écrans

| Écran | Fichier | Route du contrat | Chargement / vide / erreur |
|---|---|---|---|
| Connexion | `lib/features/connexion/ecran_connexion.dart` | Supabase Auth, puis `GET /moi` | bouton en attente / sans objet / message sous le formulaire |
| Accueil | `lib/features/accueil/ecran_accueil.dart` | `GET /moi` | cercle / « Aucun profil » / message + Réessayer |
| Matières | `lib/features/matieres/ecran_matieres.dart` | `GET /experiences` | cercle / « Aucune matière » / message + Réessayer |
| Expériences | `lib/features/experiences/ecran_experiences.dart` | `GET /experiences` | cercle / « Aucune expérience » / message + Réessayer |
| Laboratoire | `lib/features/laboratoire/ecran_laboratoire.dart` | `/laboratoire/<identifiant>`, `POST /tentatives`, `POST /tentatives/sync` | simulation 3D, journal mis en file hors ligne, message + Réessayer |
| Résultat | `lib/features/resultat/ecran_resultat.dart` | résultat local synchronisé avec `POST /tentatives` | cercle / « Tentative introuvable » / message + Réessayer |
| Quiz de bilan | `lib/features/quiz/ecran_quiz.dart` | **aucune dans le contrat** | vide seulement |
| Profil et historique | `lib/features/profil/ecran_profil.dart` | `GET /moi`, `GET /tentatives` | cercle / « Aucune tentative » / message + Réessayer |

## Hypothèses à confirmer dans le contrat

1. `GET /experiences` : liste simple ou enveloppe `{elements,...}` ; les deux sont acceptées.
2. `derniere_erreur` n'est jamais renseignée (correspondance règle de sécurité → code d'erreur du bilan non définie).
3. Connexion par e-mail et mot de passe (le CSV d'import contient `email`) ; la maquette parle d'« identifiant élève ».

## Pas encore fait

- Pendule simple et essai d'affaissement : ces simulations ne sont pas encore présentes dans `labo_core`.
- Quiz et exercice adapté (pas de contrat).
- Mesure en mode profile sur petit téléphone.
