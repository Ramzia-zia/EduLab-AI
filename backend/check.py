"""Controle du backend : tests + openapi.json a jour.

  python check.py         lance les tests, puis verifie que openapi.json est a jour
  python check.py --maj   regenere openapi.json (a faire apres un changement de route)
"""
import json
import subprocess
import sys
from pathlib import Path

from app.main import app

CHEMIN_OPENAPI = Path(__file__).with_name("openapi.json")


def generer_openapi() -> str:
    return json.dumps(app.openapi(), indent=2, ensure_ascii=False, sort_keys=True) + "\n"


def main() -> int:
    if "--maj" in sys.argv:
        CHEMIN_OPENAPI.write_text(generer_openapi(), encoding="utf-8", newline="\n")
        print(f"{CHEMIN_OPENAPI.name} regenere.")
        return 0

    code = subprocess.call([sys.executable, "-m", "pytest", "-q"])
    if code != 0:
        print("ECHEC : des tests ne passent pas.")
        return code
    if not CHEMIN_OPENAPI.exists():
        print("ECHEC : openapi.json n'existe pas. Lance : python check.py --maj")
        return 1
    actuel = CHEMIN_OPENAPI.read_text(encoding="utf-8").replace("\r\n", "\n")
    if actuel != generer_openapi():
        print("ECHEC : openapi.json n'est pas a jour. Lance : python check.py --maj")
        return 1
    print("OK : tests passes et openapi.json a jour.")
    return 0


if __name__ == "__main__":
    sys.exit(main())