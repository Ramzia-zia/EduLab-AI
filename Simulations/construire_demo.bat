@echo off
REM Reconstruit la demo navigateur (Windows).
cd /d "%~dp0packages\labo_core" || exit /b 1
dart pub get
if errorlevel 1 dart pub get --offline
dart run tool/generer_demo.dart
if errorlevel 1 (pause & exit /b 1)
dart compile js -O2 --no-source-maps web/api.dart -o demo/labo_core.js
del demo\labo_core.js.deps 2>nul
del demo\labo_core.js.map 2>nul
echo Demo reconstruite. Ouvre packages\labo_core\demo\index.html
pause
