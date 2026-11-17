from pydantic import BaseModel

class ErreurImport(BaseModel):
    ligne: int
    code: str

class ImportReponse(BaseModel):
    crees: int
    ignores: int
    erreurs: list[ErreurImport]