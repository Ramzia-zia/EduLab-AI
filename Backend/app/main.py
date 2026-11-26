from contextlib import asynccontextmanager
import os

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import TAILLE_MAX_CORPS_OCTETS
from app.erreurs import installer_gestionnaires
from app.limite_corps import LimiteTailleCorps
from app.routers import assistant, classes, experiences, profil, stats, tentatives


@asynccontextmanager
async def _cycle_de_vie(app: FastAPI):
    app.state.http = httpx.AsyncClient(timeout=10.0)
    yield
    await app.state.http.aclose()


def creer_app() -> FastAPI:
    app = FastAPI(
        title="EduLab AI - API",
        version="0.1.0",
        description="Serveur des laboratoires virtuels EduLab AI. Erreurs : {code, message, details}.",
        lifespan=_cycle_de_vie,
    )
    app.add_middleware(LimiteTailleCorps, taille_max=TAILLE_MAX_CORPS_OCTETS)
    origines = [
        origine.strip()
        for origine in os.environ.get("CORS_ORIGINES", "*").split(",")
        if origine.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origines,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )
    installer_gestionnaires(app)
    for module in (profil, experiences, tentatives, assistant, classes, stats):
        app.include_router(module.router)
    return app


app = creer_app()
