#!/usr/bin/env pwsh
# Script de push vers GitHub - EduLab AI Backend

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Push Backend EduLab AI vers GitHub" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
$currentDir = Get-Location
Write-Host "📁 Dossier actuel: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Afficher l'état Git
Write-Host "📊 État Git:" -ForegroundColor Green
git status --short
Write-Host ""

# Afficher le remote
Write-Host "🔗 Remote configuré:" -ForegroundColor Green
git remote -v
Write-Host ""

# Afficher la branche
Write-Host "🌿 Branche actuelle:" -ForegroundColor Green
git branch
Write-Host ""

# Afficher le dernier commit
Write-Host "💾 Dernier commit:" -ForegroundColor Green
git log -1 --oneline
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Prêt à pusher vers GitHub !" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Lancement du push..." -ForegroundColor Yellow
Write-Host "⚠️  Une fenêtre de navigateur va s'ouvrir pour l'authentification GitHub" -ForegroundColor Yellow
Write-Host ""

# Tenter le push
git push -u origin backend

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "   ✅ SUCCÈS ! Backend pushé vers GitHub" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Voir ton code sur:" -ForegroundColor Cyan
    Write-Host "   https://github.com/Ramzia-zia/EduLab-AI/tree/backend" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "   ⚠️  Authentification nécessaire" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "1. Utilise GitHub Desktop (plus simple)" -ForegroundColor White
    Write-Host "2. Génère un Personal Access Token sur GitHub" -ForegroundColor White
    Write-Host "3. Configure Git Credential Manager" -ForegroundColor White
    Write-Host ""
    Write-Host "Voir PUSH_TO_GITHUB.md pour les instructions détaillées" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Appuie sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
