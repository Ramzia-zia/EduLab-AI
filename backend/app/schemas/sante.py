from pydantic import BaseModel


class SanteReponse(BaseModel):
    etat: str