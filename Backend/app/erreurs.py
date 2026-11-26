"""Format d'erreur unique : {"code", "message", "details"}."""
import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

journal = logging.getLogger("edulab")


class ErreurApi(Exception):
    def __init__(
        self,
        statut: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
        entetes: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.statut = statut
        self.code = code
        self.message = message
        self.details = details or {}
        self.entetes = entetes


def corps_erreur(code: str, message: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"code": code, "message": message, "details": details or {}}


_CODES_HTTP = {
    404: ("introuvable", "Ressource ou route introuvable."),
    405: ("methode_non_autorisee", "Méthode non autorisée pour cette route."),
    413: ("corps_trop_gros", "Le corps de la requête dépasse 256 ko."),
}


def installer_gestionnaires(app: FastAPI) -> None:
    @app.exception_handler(ErreurApi)
    async def _erreur_api(_: Request, exc: ErreurApi) -> JSONResponse:
        return JSONResponse(
            corps_erreur(exc.code, exc.message, exc.details),
            status_code=exc.statut,
            headers=exc.entetes,
        )

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        erreurs = [
            {"champ": ".".join(str(p) for p in e["loc"]), "message": e["msg"], "type": e["type"]}
            for e in exc.errors()
        ]
        return JSONResponse(
            corps_erreur("donnees_invalides", "Les données envoyées sont invalides.", {"erreurs": erreurs}),
            status_code=422,
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code, message = _CODES_HTTP.get(exc.status_code, (f"erreur_http_{exc.status_code}", "Erreur de requête."))
        return JSONResponse(corps_erreur(code, message), status_code=exc.status_code)

    @app.exception_handler(Exception)
    async def _inattendue(_: Request, exc: Exception) -> JSONResponse:
        journal.exception("Erreur inattendue")
        return JSONResponse(corps_erreur("erreur_interne", "Erreur interne du serveur."), status_code=500)
