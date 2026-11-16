import time
from collections import deque
from threading import Lock


class LimiteurDebit:
    """Limite le nombre d'appels par utilisateur sur une fenetre glissante.

    Memoire du processus : si le serveur tourne avec plusieurs processus,
    chacun a son propre compteur.
    """

    def __init__(self, maximum: int = 10, fenetre_s: float = 60.0, horloge=time.monotonic):
        self.maximum = maximum
        self.fenetre_s = fenetre_s
        self._horloge = horloge
        self._appels: dict[str, deque] = {}
        self._verrou = Lock()

    def autoriser(self, cle: str) -> bool:
        maintenant = self._horloge()
        with self._verrou:
            appels = self._appels.setdefault(cle, deque())
            while appels and maintenant - appels[0] >= self.fenetre_s:
                appels.popleft()
            if len(appels) >= self.maximum:
                return False
            appels.append(maintenant)
            return True