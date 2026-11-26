#!/bin/sh
# Reconstruit la démo navigateur (demo/labo_core.js et demo/definitions.js). Mac / Linux.
cd "$(dirname "$0")/packages/labo_core" || exit 1
dart pub get || dart pub get --offline
dart run tool/generer_demo.dart || exit 1
dart compile js -O2 --no-source-maps web/api.dart -o demo/labo_core.js
rm -f demo/labo_core.js.deps demo/labo_core.js.map
echo "Démo reconstruite. Ouvre packages/labo_core/demo/index.html"
