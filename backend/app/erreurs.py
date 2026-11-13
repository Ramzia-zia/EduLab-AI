from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

TAILLE_MAX_CORPS = 256 * 1024

CODES_PAR_STATUT = {
    401: "non_authentifie",
    403: "interdit",
    404: "introuvable",
    409: "conflit",
    413: "corps_trop_gros",
    422: "donnees_invalides",
    429: "limite_depassee",
}


class ErreurApi(Exception):
    """Erreur metier : le code est celui du contrat (docs/CONTRAT.md)."""

    def __init__(self, statut: int, code: str, message: str, details: dict | None = None):
        self.statut = statut
        self.code = code
        self.message = message
        self.details = details or {}


def reponse_erreur(statut: int, code: str, message: str, details: dict | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=statut,
        content={"code": code, "message": message, "details": details or {}},
    )


async def limiter_taille_corps(request: Request, call_next):
    taille = request.headers.get("content-length")
    if taille is not None and taille.isdigit() and int(taille) > TAILLE_MAX_CORPS:
        return reponse_erreur(
            413, "corps_trop_gros", "Le corps de la requete depasse 256 ko."
        )
    return await call_next(request)


def installer_gestion_erreurs(app: FastAPI) -> None:
    app.middleware("http")(limiter_taille_corps)

    @app.exception_handler(ErreurApi)
    async def gerer_erreur_api(request: Request, exc: ErreurApi):
        return reponse_erreur(exc.statut, exc.code, exc.message, exc.details)

    @app.exception_handler(StarletteHTTPException)
    async def gerer_erreur_http(request: Request, exc: StarletteHTTPException):
        code = CODES_PAR_STATUT.get(exc.status_code, "erreur_serveur")
        return reponse_erreur(exc.status_code, code, str(exc.detail))

    @app.exception_handler(RequestValidationError)
    async def gerer_validation(request: Request, exc: RequestValidationError):
        erreurs = exc.errors()
        champ = ".".join(str(p) for p in erreurs[0]["loc"]) if erreurs else ""
        return reponse_erreur(
            422,
            "donnees_invalides",
            "Les donnees envoyees sont invalides.",
            {"champ": champ},
        )

    @app.exception_handler(Exception)
    async def gerer_erreur_imprevue(request: Request, exc: Exception):
        return reponse_erreur(500, "erreur_serveur", "Une erreur imprevue est survenue.")