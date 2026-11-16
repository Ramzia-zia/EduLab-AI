from app.services.limiteur import LimiteurDebit


class Horloge:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


def test_dix_appels_passent_le_onzieme_est_refuse():
    horloge = Horloge()
    limiteur = LimiteurDebit(10, 60.0, horloge)
    assert all(limiteur.autoriser("a") for _ in range(10))
    assert limiteur.autoriser("a") is False


def test_apres_une_minute_c_est_de_nouveau_possible():
    horloge = Horloge()
    limiteur = LimiteurDebit(10, 60.0, horloge)
    for _ in range(10):
        limiteur.autoriser("a")
    horloge.t = 59.9
    assert limiteur.autoriser("a") is False
    horloge.t = 60.0
    assert limiteur.autoriser("a") is True


def test_chaque_utilisateur_a_son_compteur():
    limiteur = LimiteurDebit(1, 60.0, Horloge())
    assert limiteur.autoriser("a") is True
    assert limiteur.autoriser("a") is False
    assert limiteur.autoriser("b") is True