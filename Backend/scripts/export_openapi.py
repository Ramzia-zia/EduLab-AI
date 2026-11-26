"""Écrit (ou vérifie avec --verifier) backend/openapi.json, source de vérité de l'API."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402

CHEMIN = Path(__file__).resolve().parents[1] / "openapi.json"


def generer() -> str:
    return json.dumps(app.openapi(), indent=2, sort_keys=True, ensure_ascii=False) + "\n"


if __name__ == "__main__":
    attendu = generer()
    if "--verifier" in sys.argv:
        if not CHEMIN.exists() or CHEMIN.read_text(encoding="utf-8") != attendu:
            print("openapi.json n'est pas à jour. Lance : make openapi")
            sys.exit(1)
        print("openapi.json est à jour.")
    else:
        CHEMIN.write_text(attendu, encoding="utf-8")
        print(f"Écrit : {CHEMIN}")
