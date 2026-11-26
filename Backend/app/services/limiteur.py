"""Limite de débit en mémoire : `maximum` appels par `fenetre_s` secondes et par clé.

Limite connue : l'état est propre à un processus. Avec plusieurs workers, chacun compte
séparément ; il faudra alors un stockage partagé (ex. Redis).
"""
import math
import time
from collections import deque
from collections.abc import Callable


class LimiteurDebit:
    def __init__(self, maximum: int, fenetre_s: float, horloge: Callable[[], float] = time.monotonic) -> None:
        self._maximum = maximum
        self._fenetre = fenetre_s
        self._horloge = horloge
        self._appels: dict[str, deque[float]] = {}

    def verifier(self, cle: str) -> int | None:
        """Enregistre un appel. Renvoie None si autorisé, sinon le nombre de secondes à attendre."""
        maintenant = self._horloge()
        file = self._appels.setdefault(cle, deque())
        while file and maintenant - file[0] >= self._fenetre:
            file.popleft()
        if len(file) >= self._maximum:
            return max(1, math.ceil(self._fenetre - (maintenant - file[0])))
        file.append(maintenant)
        return None
