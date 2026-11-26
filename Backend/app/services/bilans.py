"""Calcul du bilan d'une classe (fonction pure, testable sans serveur)."""
from collections import defaultdict
from typing import Any

from app.schemas.classes import BilanClasse, BilanExperience


def _moyenne(scores: list[float]) -> float | None:
    return round(sum(scores) / len(scores), 2) if scores else None


def calculer_bilan(
    classe_id: str,
    nombre_eleves: int,
    tentatives: list[dict[str, Any]],
    experiences: dict[str, dict[str, str]] | None = None,
) -> BilanClasse:
    experiences = experiences or {}
    scores_par_experience: dict[str, list[float]] = defaultdict(list)
    compte_par_experience: dict[str, int] = defaultdict(int)
    tous_les_scores: list[float] = []
    for t in tentatives:
        experience = str(t["experience_id"])
        compte_par_experience[experience] += 1
        if t.get("score") is not None:
            scores_par_experience[experience].append(float(t["score"]))
            tous_les_scores.append(float(t["score"]))
    return BilanClasse(
        classe_id=classe_id,
        nombre_eleves=nombre_eleves,
        nombre_tentatives=len(tentatives),
        nombre_tentatives_terminees=sum(1 for t in tentatives if t.get("fin_le") is not None),
        score_moyen=_moyenne(tous_les_scores),
        par_experience=[
            BilanExperience(
                experience_id=experience,
                nombre_tentatives=compte,
                score_moyen=_moyenne(scores_par_experience[experience]),
                titre=experiences.get(experience, {}).get("titre"),
                matiere=experiences.get(experience, {}).get("matiere"),
            )
            for experience, compte in sorted(compte_par_experience.items())
        ],
    )
