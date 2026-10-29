# État du projet — ce qui est terminé, simulé ou en attente

## Terminé (front-end, testé dans un navigateur)
- Les 12 interfaces de la maquette, chacune sur sa propre page, avec navigation, menu mobile et déconnexion confirmée.
- Formulaires de connexion, inscription, profil, mot de passe, question et réponse : validation, messages d'erreur et de succès, états de chargement.
- Catalogue : recherche (sans tenir compte des accents), filtres matière et niveau, message « aucun résultat ».
- Conteneur de simulation générique + contrat d'intégration documenté.
- Graphiques en SVG natif (courbe, barres, anneau), adaptatifs.
- Fenêtres modales, notifications, onglets accessibles, préférences d'affichage (taille du texte, animations).
- Couche de services (`js/services/`) prête pour le backend, avec gestion des délais d'attente et des erreurs réseau/HTTP.
- Responsive vérifié à 360, 768, 1024 et 1440 px (aucun débordement horizontal, zones de clic suffisantes).

## Simulé (mode démonstration, données **fictives**, signalées à l'écran)
- Comptes, session, catalogue, tableau de bord, suivi, cours, discussions, espace enseignant : `js/data/demo-data.js`.
- Modifications locales et **temporaires** (propres à l'onglet) : résultats, publications, activités enseignant.
- Assistant IA : réponses écrites à l'avance, étiquetées « Réponse de démonstration ».
- Simulation de titrage : valeurs écrites à la main, aucun calcul scientifique.

## En attente du backend
- Authentification réelle (cookie de session, rôles, autorisations), inscription, réinitialisation du mot de passe.
- Persistance des résultats, des discussions, des activités ; export des données personnelles.
- Service IA réel (via le backend, aucune clé dans le navigateur).
- Confirmation des routes de `docs/API.md` (actuellement des hypothèses).

## En attente de l'équipe simulations
- Moteurs scientifiques réels (le seul exemple est une démonstration fictive) et leur validation scientifique.
- Fonctionnement hors ligne de chaque simulation.

## À faire / non réalisé
- Connexion avec Google (bouton visible mais désactivé).
- Contenu des cours, exercices et ressources (fenêtres d'attente en place).
- Texte officiel des conditions d'utilisation, adresse de contact.
- Hors ligne complet et synchronisation (le service worker ne fait que mettre en cache l'interface).
- Icônes d'application (PWA) en PNG, tests sur vrais téléphones, Safari et anciens navigateurs.
