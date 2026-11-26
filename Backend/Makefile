.PHONY: test openapi check

test:
	python -m pytest -q

openapi:
	python scripts/export_openapi.py

# Commande unique : tests + openapi.json à jour
check: test
	python scripts/export_openapi.py --verifier
