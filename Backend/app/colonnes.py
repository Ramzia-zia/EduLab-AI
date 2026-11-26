"""Colonnes demandées explicitement à la base. Jamais de select=* : on ne lit que ce qu'on renvoie."""

EXPERIENCE_RESUME = "id,matiere,titre,niveau,version"
EXPERIENCE_DETAIL = "id,matiere,titre,niveau,version,parametres"
TENTATIVE = "id,eleve_id,experience_id,classe_id,debut_le,fin_le,score,resultat"
CLASSE = "id,etablissement_id,enseignant_id,nom,niveau"
