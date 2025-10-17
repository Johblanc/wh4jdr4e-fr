# Script PowerShell pour convertir stuff-currencies.json vers fichiers .db FoundryVTT
# Génère des packs séparés par Origine : packs/stuff-currencies/<Origin>.db

param(
    [string]$InputFile = "stuff-currencies.json"
)

# S'assurer qu'on travaille dans le bon répertoire
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDir)))
Set-Location $rootDir

try {
    # Le fichier JSON est dans le même dossier que le script
    if (-not (Split-Path $InputFile)) {
        $InputFile = Join-Path $scriptDir $InputFile
    } else {
        $InputFile = Join-Path $rootDir $InputFile
    }
    
    Write-Host "=== CONVERSION JSON VERS PACKS FOUNDRY VTT PAR ORIGINE ===" -ForegroundColor Green
    Write-Host "Répertoire de travail: $rootDir" -ForegroundColor Magenta
    Write-Host "Fichier d'entrée: $InputFile" -ForegroundColor Cyan
    Write-Host ""

    # Vérifier que le fichier JSON existe
    if (-not (Test-Path $InputFile)) {
        throw "Le fichier '$InputFile' n'existe pas."
    }

    # Charger le JSON
    Write-Host "Chargement du fichier JSON..." -ForegroundColor Yellow
    $jsonContent = Get-Content $InputFile -Raw -Encoding UTF8
    $data = $jsonContent | ConvertFrom-Json

    Write-Host "Trouvé $($data.Count) monnaies à traiter" -ForegroundColor Yellow

    # Créer le répertoire de base
    $basePackDir = Join-Path $rootDir "packs\stuff-currencies"
    if (-not (Test-Path $basePackDir)) {
        New-Item -ItemType Directory -Path $basePackDir -Force | Out-Null
    }

    # Analyser les origines
    Write-Host "Analyse des origines..." -ForegroundColor Yellow
    $origins = @{}
    
    foreach ($item in $data) {
        if ($item.system -and $item.system.origin) {
            $origin = $item.system.origin
            
            if (-not $origins.ContainsKey($origin)) {
                $origins[$origin] = @()
            }
            $origins[$origin] += $item
        }
    }

    # Afficher les origines trouvées
    $totalOrigins = 0
    foreach ($origin in $origins.Keys) {
        $count = $origins[$origin].Count
        Write-Host "Origine '$origin': $count monnaies" -ForegroundColor Cyan
        $totalOrigins++
    }
    Write-Host "Total: $totalOrigins packs à créer" -ForegroundColor Yellow
    Write-Host ""

    # Créer les packs pour chaque origine
    Write-Host "Création des packs..." -ForegroundColor Yellow
    $packsCreated = 0
    $totalItems = 0

    foreach ($origin in $origins.Keys) {
        $items = $origins[$origin]
        
        # Nettoyer le nom de l'origine pour le nom de fichier
        $cleanOriginName = $origin -replace '[\\/:*?"<>|]', '_' -replace '\s+', '_' -replace '%C3%A9', 'e'
        $packFile = Join-Path $basePackDir "$cleanOriginName.db"
        
        # Supprimer l'ancien fichier s'il existe
        if (Test-Path $packFile) {
            Remove-Item $packFile -Force
        }

        # Écrire les items au format JSONL (un objet JSON par ligne)
        $jsonLines = @()
        foreach ($item in $items) {
            # Ajouter la clé _key si elle n'existe pas (nécessaire pour FoundryVTT)
            if (-not $item._key) {
                $item | Add-Member -NotePropertyName "_key" -NotePropertyValue "!items!$($item._id)" -Force
            }
            $jsonLines += ($item | ConvertTo-Json -Depth 10 -Compress)
        }
        
        # Utiliser UTF8NoBOMEncoding pour éviter le BOM
        $content = $jsonLines -join "`n"
        $utf8NoBOM = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($packFile, $content, $utf8NoBOM)

        $fileSize = (Get-Item $packFile).Length
        $fileSizeKB = [Math]::Round($fileSize / 1KB, 2)
        
        Write-Host "Pack créé: stuff-currencies/$cleanOriginName.db ($($items.Count) monnaies, $fileSizeKB KB)" -ForegroundColor Green
        $packsCreated++
        $totalItems += $items.Count
    }

    Write-Host ""
    Write-Host "=== CONVERSION TERMINÉE ===" -ForegroundColor Green
    Write-Host "Packs créés: $packsCreated" -ForegroundColor Green
    Write-Host "Monnaies traitées: $totalItems / $($data.Count)" -ForegroundColor Green

} catch {
    Write-Host "Erreur lors de la conversion:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
