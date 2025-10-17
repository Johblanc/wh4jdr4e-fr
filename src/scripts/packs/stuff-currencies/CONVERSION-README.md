# Scripts de Conversion FoundryVTT - Monnaies

## Description

Scripts pour convertir le fichier `stuff-currencies.json` vers le format DB de FoundryVTT avec organisation automatique en packs séparés par Origine.

## Architecture des packs

Le script organise automatiquement les monnaies en utilisant la propriété `system.origin` :

- **Origine** (pack séparé) : Empire, Bretonie, Tilée, Estalie, Kislev, etc.
- **Structure** : `packs/stuff-currencies/<Origin>.db`

## Fichiers

### `convert-stuff-currencies.ps1`

Script PowerShell qui fait le travail de conversion.

**Usage :**

```powershell
# Depuis la racine du projet
.\src\scripts\packs\stuff-currencies\convert-stuff-currencies.ps1
```

**Ce que fait le script :**

1. Lit le fichier `stuff-currencies.json` (dans le même dossier)
2. Analyse la propriété `system.origin` de chaque monnaie
3. Crée automatiquement les dossiers de destination `packs/stuff-currencies/`
4. Génère des fichiers `.db` séparés par origine
5. Chaque fichier contient uniquement les monnaies de son origine

## Résultat

- **Fichier d'entrée :** `stuff-currencies.json` (41 monnaies)
- **Fichiers de sortie :** ~16 packs séparés dans `packs/stuff-currencies/<Origin>.db`
- **Organisation :** Packs par faction/région (ex: Empire.db, Bretonie.db, Cathay.db, etc.)

## Utilisation

1. Exécutez `.\src\scripts\packs\stuff-currencies\convert-stuff-currencies.ps1`
2. Les fichiers `.db` sont générés dans `packs/stuff-currencies/` et prêts pour FoundryVTT

## Structure des packs créés

```
packs/stuff-currencies/
├── Empire.db
├── Bretonie.db
├── Tilée.db
├── Estalie.db
├── Kislev.db
├── Marienburg.db
├── Norsca.db
├── Arabie.db
├── Royaumes_Nains.db
├── Ulthuan.db
├── Naggaroth.db
├── Lustrie.db
├── Cathay.db
├── Ind.db
├── Nippon.db
└── Empire_Skaven.db
```

## Avantages de l'organisation par origine

- **Navigation intuitive** : Monnaies groupées par faction/région
- **Performance** : Packs plus petits, chargement plus rapide
- **Modularité** : Possibilité de charger seulement certaines régions
- **Cohérence lore** : Respect des divisions géopolitiques de Warhammer
- **Extensibilité** : Facile d'ajouter de nouvelles factions

## Notes techniques

- Chaque pack `.db` contient uniquement les monnaies de son origine
- Les fichiers sont encodés en UTF-8 sans BOM pour éviter les problèmes d'affichage
- Chaque monnaie a une propriété `_key` au format `!items!<id>` pour FoundryVTT
- Les noms de fichiers sont nettoyés (caractères spéciaux remplacés)
- Les packs peuvent être organisés via `packFolders` dans `system.json`
