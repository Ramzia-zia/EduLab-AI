"""Reponses de secours (source = "regles") quand l'IA est absente ou en panne.

Aucune ne donne la reponse de l'exercice.
"""

GENERIQUE = {
    1: "Relis bien l'énoncé et regarde ce que tu as fait jusqu'ici. Qu'est-ce qui te semble bizarre dans tes mesures ?",
    2: "Compare ce que tu observes avec ce que tu attendais. Quelle étape pourrait expliquer la différence ?",
    3: "Reprends ton expérience étape par étape : vérifie le matériel, puis chaque action dans l'ordre. Note ce qui change à chaque étape.",
}

PAR_ERREUR = {
    "depassement_equivalence": "Tu as versé trop de solution. Observe le changement de couleur : arrête-toi dès qu'il apparaît et verse goutte à goutte vers la fin.",
    "erreur_volume_acide": "Vérifie le volume d'acide que tu as mesuré avant de commencer. Relis l'énoncé pour voir le volume demandé.",
    "lecture_burette": "Regarde la burette à hauteur des yeux et lis le bas du ménisque.",
    "debit_trop_rapide": "Ralentis : ouvre moins le robinet pour que la solution coule goutte à goutte.",
    "angle_trop_grand": "L'angle est trop grand. Reviens vers une valeur plus petite et observe l'effet.",
    "pince_non_serree": "Vérifie que la pince tient bien le matériel avant de continuer.",
    "gants_oublies": "Mets tes gants avant de manipuler les produits.",
    "lunettes_oubliees": "Mets tes lunettes de protection avant de continuer.",
}


def reponse_de_secours(niveau_indice: int, derniere_erreur: str | None) -> str:
    if derniere_erreur in PAR_ERREUR:
        return PAR_ERREUR[derniere_erreur]
    return GENERIQUE[niveau_indice]