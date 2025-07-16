# Script PowerShell pour convertir stuff-features.json vers fichiers .db FoundryVTT
# Génère des packs séparés par Division et Catégorie : packs/stuff-features/<Category>/<Division>.db

param(
    [string]$InputFile = "stuff-features.json"
)

# S'assurer qu'on travaille dans le bon répertoire
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDir)))
Set-Location $rootDir

try {
    # Le fichier JSON est maintenant dans le même dossier que le script
    if (-not (Split-Path $InputFile)) {
        $InputFile = Join-Path $scriptDir $InputFile
    } else {
        $InputFile = Join-Path $rootDir $InputFile
    }
    
    Write-Host "=== CONVERSION JSON VERS PACKS FOUNDRY VTT PAR DIVISION/CATÉGORIE ===" -ForegroundColor Green
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

    Write-Host "Trouvé $($data.Count) éléments à traiter" -ForegroundColor Yellow

    # Créer les répertoires de base
    $basePackDir = Join-Path $rootDir "packs\stuff-features"
    if (-not (Test-Path $basePackDir)) {
        New-Item -ItemType Directory -Path $basePackDir -Force | Out-Null
    }

    # Analyser les combinaisons Division/Catégorie
    Write-Host "Analyse des divisions et catégories..." -ForegroundColor Yellow
    $combinations = @{}
    
    foreach ($item in $data) {
        if ($item.system -and $item.system.division -and $item.system.category) {
            $division = $item.system.division
            $category = $item.system.category
            
            if (-not $combinations.ContainsKey($category)) {
                $combinations[$category] = @{}
            }
            if (-not $combinations[$category].ContainsKey($division)) {
                $combinations[$category][$division] = @()
            }
            $combinations[$category][$division] += $item
        }
    }

    # Afficher les combinaisons trouvées
    $totalCombinations = 0
    foreach ($category in $combinations.Keys) {
        Write-Host "Catégorie '$category':" -ForegroundColor Cyan
        foreach ($division in $combinations[$category].Keys) {
            $count = $combinations[$category][$division].Count
            Write-Host "  - Division '$division': $count items" -ForegroundColor Gray
            $totalCombinations++
        }
    }
    Write-Host "Total: $totalCombinations packs à créer" -ForegroundColor Yellow
    Write-Host ""

    # Créer les packs pour chaque combinaison
    Write-Host "Création des packs..." -ForegroundColor Yellow
    $packsCreated = 0
    $totalItems = 0

    foreach ($category in $combinations.Keys) {
        # Créer le répertoire de catégorie
        $categoryDir = Join-Path $basePackDir $category
        if (-not (Test-Path $categoryDir)) {
            New-Item -ItemType Directory -Path $categoryDir -Force | Out-Null
            Write-Host "Créé répertoire: $categoryDir" -ForegroundColor Green
        }

        foreach ($division in $combinations[$category].Keys) {
            $items = $combinations[$category][$division]
            $packFile = Join-Path $categoryDir "$division.db"
            
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
            
            Write-Host "Pack créé: stuff-features/$category/$division.db ($($items.Count) items, $fileSizeKB KB)" -ForegroundColor Green
            $packsCreated++
            $totalItems += $items.Count
        }
    }

    Write-Host ""
    Write-Host "=== CONVERSION TERMINÉE ===" -ForegroundColor Green
    Write-Host "Packs créés: $packsCreated" -ForegroundColor Green
    Write-Host "Items traités: $totalItems / $($data.Count)" -ForegroundColor Green

} catch {
    Write-Host "Erreur lors de la conversion:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
