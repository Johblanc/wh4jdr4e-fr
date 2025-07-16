# Script de génération des packs FoundryVTT
# Appelle tous les scripts de conversion de packs

# S'assurer qu'on travaille dans le bon répertoire
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDir))
Set-Location $rootDir

Write-Host "=== GÉNÉRATION DES PACKS FOUNDRY VTT ===" -ForegroundColor Green
Write-Host "Répertoire de travail: $rootDir" -ForegroundColor Magenta
Write-Host ""

try {
    # Conversion des stuff-features
    Write-Host "🔄 Conversion des stuff-features..." -ForegroundColor Yellow
    $stuffFeaturesScript = Join-Path $scriptDir "stuff-features\convert-stuff-features.ps1"
    
    if (Test-Path $stuffFeaturesScript) {
        & $stuffFeaturesScript
        Write-Host "✅ Stuff-features convertis avec succès" -ForegroundColor Green
    } else {
        throw "Script stuff-features introuvable: $stuffFeaturesScript"
    }
    
    Write-Host ""
    Write-Host "🎉 Tous les packs ont été générés avec succès !" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
