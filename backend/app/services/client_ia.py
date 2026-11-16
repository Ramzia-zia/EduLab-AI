import httpx

URL_API = "https://api.anthropic.com/v1/messages"
VERSION_API = "2023-06-01"


class ErreurIA(Exception):
    """L'IA n'a pas pu repondre."""


class ClientAnthropic:
    def __init__(self, cle_api: str, modele: str, transport=None, url: str = URL_API):
        self._cle_api = cle_api
        self._modele = modele
        self._url = url
        self._transport = transport

    def completer(self, systeme: str, message: str) -> str:
        corps = {
            "model": self._modele,
            "max_tokens": 400,
            "system": systeme,
            "messages": [{"role": "user", "content": message}],
        }
        entetes = {
            "x-api-key": self._cle_api,
            "anthropic-version": VERSION_API,
            "content-type": "application/json",
        }
        try:
            with httpx.Client(timeout=15.0, transport=self._transport) as client:
                reponse = client.post(self._url, json=corps, headers=entetes)
        except httpx.HTTPError:
            raise ErreurIA("Pas de reponse de l'IA.")
        if reponse.status_code != 200:
            raise ErreurIA(f"L'IA a repondu {reponse.status_code}.")
        try:
            blocs = reponse.json()["content"]
            texte = "".join(b["text"] for b in blocs if b.get("type") == "text")
        except (ValueError, KeyError, TypeError):
            raise ErreurIA("Reponse de l'IA illisible.")
        return texte