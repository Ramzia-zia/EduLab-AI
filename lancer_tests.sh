#!/bin/sh
# Lance l'analyse et les tests de labo_core (Mac / Linux).
cd "$(dirname "$0")/packages/labo_core" || exit 1
if ! command -v dart >/dev/null 2>&1; then
  echo "Dart n'est pas installé (ou pas dans le PATH). Installe Dart ou Flutter, puis relance."
  exit 1
fi
dart --version
dart pub get || dart pub get --offline
dart analyze || exit 1
dart run test/tous_test.dart
