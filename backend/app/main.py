from fastapi import APIRouter, FastAPI

from app.schemas.sante import SanteReponse

PREFIXE_API = "/api/v1"

app = FastAPI(title="EduLab AI", version="0.1.0")

routeur_public = APIRouter(prefix=PREFIXE_API)


@routeur_public.get(
    "/sante",
    response_model=SanteReponse,
    description="Indique que le serveur repond. Aucun jeton n'est demande.",
)
def sante() -> SanteReponse:
    return SanteReponse(etat="ok")


app.include_router(routeur_public)