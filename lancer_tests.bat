@echo off
REM Lance l'analyse et les tests de labo_core (Windows).
cd /d "%~dp0packages\labo_core" || exit /b 1
where dart >nul 2>nul
if errorlevel 1 (
  echo Dart n'est pas installe ^(ou pas dans le PATH^). Installe Dart ou Flutter, puis relance.
  pause
  exit /b 1
)
dart --version
dart pub get
if errorlevel 1 dart pub get --offline
dart analyze
if errorlevel 1 (pause & exit /b 1)
dart run test/tous_test.dart
pause
