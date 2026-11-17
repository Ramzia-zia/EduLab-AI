from fastapi import APIRouter, FastAPI

from app.erreurs import installer_gestion_erreurs
from app.routers import assistant, tentatives, moi, experiences
from app.schemas.sante import SanteReponse

PREFIXE_API = "/api/v1"

app = FastAPI(title="EduLab AI", version="0.1.0")
installer_gestion_erreurs(app)

routeur_public = APIRouter(prefix=PREFIXE_API)


@routeur_public.get(
    "/sante",
    response_model=SanteReponse,
    description="Indique que le serveur repond. Aucun jeton n'est demande.",
)
def sante() -> SanteReponse:
    return SanteReponse(etat="ok")


app.include_router(routeur_public)
app.include_router(tentatives.routeur, prefix=PREFIXE_API)
app.include_router(assistant.routeur, prefix=PREFIXE_API)
app.include_router(moi.routeur, prefix=PREFIXE_API)
app.include_router(experiences.routeur, prefix=PREFIXE_API)
