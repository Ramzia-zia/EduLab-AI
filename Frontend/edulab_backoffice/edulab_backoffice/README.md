# EduLab AI - Backoffice web (Flutter)

Application web pour l'administration, les enseignants, le ministère et les établissements.
Elle suit la maquette fournie et `docs/CONTRAT.md` v0.1.

## Lancer le projet

Prérequis : Flutter 3.27 ou plus récent (Dart 3.3 ou plus).

```powershell
flutter pub get
flutter run -d chrome `
  --dart-define=URL_API=https://<api-edulab> `
  --dart-define=URL_SUPABASE=https://<projet>.supabase.co `
  --dart-define=CLE_ANON_SUPABASE=<cle-publique>
flutter test
```

Si le dossier `web/` te semble incomplet (icônes), lance une fois `flutter create . --platforms=web`
à la racine : cela ajoute les fichiers manquants sans toucher à `lib/`.

## Connexion et API

La connexion utilise Supabase Auth, puis vérifie le profil avec `GET /moi`.
Le rôle est lu dans `public.profil`, jamais choisi dans l'interface.
Les classes, bilans et statistiques disponibles sont chargés depuis l'API avec le
jeton de l'utilisateur. Les bilans de classe détaillent les tentatives par simulation
et utilisent les titres fournis par le catalogue. Les écrans sans route backend (comptes, administration
globale, cours, contenus, etc.) restent indisponibles tant que leurs endpoints
sécurisés ne sont pas ajoutés.

| Rôle | Écran d'accueil |
|---|---|
| Enseignant | Tableau de bord enseignant |
| Ministère | Tableau de bord ministère (agrégé, sans noms d'élèves) |
| Responsable d'établissement | Informations de l'établissement |

Le rôle `admin` de la maquette n'existe pas dans le contrat backend et ne peut
donc pas se connecter.

## Structure

```
lib/
  core/
    theme/theme.dart        un seul fichier : couleurs, espacements, tailles
    routes/                 go_router et menus par rôle
    auth/session.dart       rôle et session
    donnees/                modèles et dépôt PROVISOIRES (voir ci-dessous)
    widgets/                coquille, cartes, graphiques, états
  features/
    auth/  admin/  enseignant/  ministere/  etablissement/  comptes/
assets/images/              logo, illustrations (SVG)
```

## Ce qui est provisoire

`lib/core/donnees/` contient des données de démonstration et des modèles écrits à la main,
parce que `openapi.json` n'était pas fourni. Dès que le serveur expose les routes,
on remplace ce dossier par le client Dart généré depuis `openapi.json`.
Les routes absentes du contrat sont listées dans le document Word des ajouts.

## Routes non couvertes par le backend

Les écrans dont la route n'existe pas dans le contrat affichent « Cet écran sera branché quand la route sera validée » :
cours, exercices, expériences, messages, contenus pédagogiques, politiques, rapports, paramètres.
