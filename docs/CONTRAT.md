# CONTRAT.md : contrat technique d'EduLab AI

Version du contrat : 0.2 (brouillon, a valider par les 3 personnes)

Ce fichier est la reference commune du front-end (Flutter), du backend (FastAPI) et des simulations (Dart). Il resume le schema de la base (supabase/migrations/*.sql), l'API (openapi.json) et les calculs (packages/labo_core, reference_values.json).

Regle d'or : si le code et ce fichier se contredisent, on s'arrete et on corrige l'un des deux avant de continuer. On n'invente jamais une table, une colonne, une route ou un champ qui n'est pas ecrit ici.

Statuts : A valider (propose, pas encore accepte par la personne concernee), Valide (accepte, on peut coder).

## 1. Conventions

| Sujet | Regle |
|---|---|
| Noms | snake_case, en francais sans accents, partout (base, API, Python, Dart). Exemples : etablissement, tentative, evenement_tentative |
| Identifiants | UUID (texte), sauf experience.id qui est un texte lisible (titrage_acide_base) |
| Dates | ISO 8601 en UTC, par exemple 2026-11-08T07:30:00Z |
| Nombres | point decimal dans les donnees. La virgule est reservee a l'affichage |
| Unites | toujours dans le nom du champ : volume_ml, concentration_mol_l, duree_s, angle_deg, affaissement_mm |
| Prefixe API | /api/v1 |
| Authentification | Authorization: Bearer <jeton Supabase>. Role lu dans app_metadata.role |
| Listes | ?page=1&taille=50, reponse { "elements": [], "page": 1, "taille": 50, "total": 0 }. Taille par defaut 50, maximum 100 (0.2). Vaut aussi pour GET /experiences et GET /classes (0.2) |
| Texte | UTF-8. Les messages affiches a l'eleve sont en francais simple |
| Role (0.2) | Le role fait foi dans app_metadata.role. Si profil.role est different, le serveur repond 403 interdit |

### Roles

| Valeur | Qui | Application |
|---|---|---|
| eleve | Eleve | Mobile |
| enseignant | Enseignant | Web |
| etablissement | Responsable d'etablissement | Web |
| ministere | Ministere | Web (indicateurs agreges seulement) |

### Format des erreurs (toutes les routes)

{ "code": "donnees_invalides", "message": "Le champ volume_ml doit etre positif.", "details": { "champ": "volume_ml" } }

| Code | HTTP | Quand |
|---|---|---|
| non_authentifie | 401 | Jeton absent ou invalide |
| interdit | 403 | Role non autorise, ligne d'un autre etablissement, ou role du jeton different de profil.role |
| introuvable | 404 | Ressource inexistante |
| conflit | 409 | Doublon (par exemple un identifiant deja utilise) |
| corps_trop_gros | 413 | Corps de requete de plus de 256 ko (0.2) |
| donnees_invalides | 422 | Champ manquant ou mauvais format |
| limite_depassee | 429 | Plus de 10 questions par minute a l'assistant |
| erreur_serveur | 500 | Erreur imprevue |

## 2. Base de donnees (A valider)

A completer : le contrat parle de 11 tables existantes, mais seules 8 sont decrites ici. Les 3 tables manquantes seront ajoutees apres lecture de supabase/migrations/*.sql. Avant la premiere migration, la personne du backend compare cette liste avec la base actuelle et note les differences.

(Les tables profil, etablissement, classe, inscription, experience, tentative, evenement_tentative et bilan : voir bloc B, a coller a la suite.)
### Tables (A valider)

profil (existant, a aligner)

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | Cle primaire, egale a l'identifiant de connexion Supabase |
| nom | text | Obligatoire |
| role | text | eleve, enseignant, etablissement, ministere |
| etablissement_id | uuid | Cle etrangere vers etablissement, vide pour ministere |

etablissement

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | Cle primaire |
| nom | text | Obligatoire |
| commune | text | |
| responsable_id | uuid | Cle etrangere vers profil |
| actif | boolean | Par defaut vrai |
| cree_le | timestamptz | |

classe

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | Cle primaire |
| etablissement_id | uuid | Cle etrangere, obligatoire |
| niveau | text | seconde, premiere, terminale |
| serie | text | c, d, f4 ... peut etre vide |
| nom | text | Par exemple Terminale D |
| annee_scolaire | text | Par exemple 2026-2027 |

inscription

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | Cle primaire |
| classe_id | uuid | Cle etrangere |
| profil_id | uuid | Cle etrangere |
| role_classe | text | eleve ou enseignant |

Unique sur (classe_id, profil_id).

experience

| Colonne | Type | Regle |
|---|---|---|
| id | text | Cle primaire lisible : titrage_acide_base, pendule_simple, essai_affaissement, mesure_ph |
| matiere | text | physique, chimie, svt, genie_civil |
| niveau | text | seconde, premiere, terminale |
| titre | text | |
| duree_min | integer | |
| difficulte | text | facile, moyen, difficile |
| version | integer | Augmente a chaque changement de la definition |
| definition | jsonb | Fichier de definition de l'experience (chapitre 6) |
| publie | boolean | |

tentative

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | Cree dans le telephone (cle primaire) |
| profil_id | uuid | Cle etrangere |
| experience_id | text | Cle etrangere |
| version_experience | integer | Version utilisee par l'eleve |
| debut | timestamptz | |
| fin | timestamptz | Vide tant que non terminee |
| statut | text | en_cours, terminee, abandonnee |
| score | integer | 0 a 100, vide tant que non terminee |
| resultat | jsonb | Resultats calcules (par exemple volume equivalent) |

evenement_tentative (journal non modifiable)

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | Cree dans le telephone |
| tentative_id | uuid | Cle etrangere |
| rang | integer | Numero d'ordre dans la tentative, a partir de 1 |
| horodatage | timestamptz | |
| action | text | Voir chapitre 5 |
| valeurs | jsonb | Valeurs de l'action, unites dans les noms |

Unique sur (tentative_id, rang). Jamais de modification ni de suppression.

bilan

| Colonne | Type | Regle |
|---|---|---|
| id | uuid | |
| tentative_id | uuid | Unique |
| erreurs | jsonb | Liste de codes d'erreur (chapitre 5) |
| quiz | jsonb | Questions, reponses de l'eleve, score |
| exercice | jsonb | Exercice adapte propose |

### Vue pour le ministere

vue_stats_etablissement : etablissement_id, nom, commune, nb_eleves_actifs, taux_reussite, progression_moyenne. Le role ministere lit seulement cette vue, jamais les tables des eleves.

Definitions proposees (0.2, a confirmer) : eleve actif = au moins une tentative dans les 30 derniers jours. Taux de reussite = part des tentatives terminees avec un score d'au moins 50.

### Regles RLS

- Un eleve voit seulement ses propres lignes.
- Un enseignant voit les lignes des eleves de ses classes.
- Un etablissement voit les lignes de son etablissement.
- Un ministere ne lit que vue_stats_etablissement.