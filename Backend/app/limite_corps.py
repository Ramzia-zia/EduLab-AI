"""Refuse les corps de requête de plus de `taille_max` octets (413)."""
import json

from fastapi.exceptions import HTTPException


class LimiteTailleCorps:
    def __init__(self, app, taille_max: int) -> None:
        self.app = app
        self.taille_max = taille_max

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Cas 1 : la taille annoncée est déjà trop grande -> on refuse sans rien lire.
        for nom, valeur in scope["headers"]:
            if nom == b"content-length":
                try:
                    trop_gros = int(valeur) > self.taille_max
                except ValueError:
                    trop_gros = False
                if trop_gros:
                    await self._refuser(send)
                    return

        # Cas 2 : pas de taille annoncée (envoi par morceaux) -> on compte les octets reçus.
        recu = 0

        async def recevoir():
            nonlocal recu
            message = await receive()
            if message["type"] == "http.request":
                recu += len(message.get("body", b""))
                if recu > self.taille_max:
                    # HTTPException de FastAPI : elle traverse la lecture du corps sans devenir un 400.
                    raise HTTPException(status_code=413)
            return message

        await self.app(scope, recevoir, send)

    async def _refuser(self, send) -> None:
        corps = json.dumps(
            {
                "code": "corps_trop_gros",
                "message": f"Le corps de la requête dépasse {self.taille_max // 1024} ko.",
                "details": {"taille_max_octets": self.taille_max},
            }
        ).encode()
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(corps)).encode())],
            }
        )
        await send({"type": "http.response.body", "body": corps})
