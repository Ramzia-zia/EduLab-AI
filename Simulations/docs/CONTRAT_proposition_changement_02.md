# Demande de changement n°02 : actions et codes d'erreur des labos interactifs

Statut : **A valider** (rien n'est accepté tant que Backend, Front-end et Simulations n'ont pas répondu ok).

Demandeur : Simulations
Date : 2026-11-20

## Ce que je veux changer
Chapitre 5 du contrat (actions et codes d'erreur) : ajouter les actions et les codes déjà utilisés par les modules `demo/*_spec.js`.

## Pourquoi
Les labos interactifs envoient au journal des actions qui ne sont pas encore dans le chapitre 5. Règle du contrat : on n'invente pas de champ avant accord.

## Ce qui casse
Backend : accepter ces valeurs dans `evenement_tentative.action` et `bilan.erreurs`. Front-end : rien, ces valeurs viennent du moteur.

## Proposition exacte
Nouvelles actions (champ `action`) :
| Action | Valeurs |
|---|---|
| deplacer_materiel | materiel_id, position_cm |
| allumer_source | allume |
| deposer_cristal | materiel_id |
| agiter | duree_s |
| introduire_tranches | tube_id |
| regler_gbf, regler_sensibilite, regler_base_temps, choisir_couplage, relier_masse, inverser_branchement, choisir_calibre, regler_rheostat, regler_tension, fermer_interrupteur, ouvrir_interrupteur | déjà dans `labo_core`, à lister dans le contrat |

Nouveaux codes d'erreur du bilan (dosage manuel) : `zero_imprecis`, `bulle_air`, `trop_indicateur`, `goutte_hors_erlenmeyer`, `calcul_concentration`, `rangement`.
Codes déjà dans le contrat et réutilisés : `pince_non_serree`, `lunettes_oubliees`, `erreur_volume_acide`, `debit_trop_rapide`, `depassement_equivalence`, `lecture_burette`.

Valeurs d'optique : le contrat et `reference_values.json` donnent f' = 15 cm et une tolérance de 0,5 cm. Le banc interactif utilise les mêmes valeurs.

Réponses : backend ... / front-end ... / simulations ok
