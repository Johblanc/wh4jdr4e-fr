# Scripts de Conversion FoundryVTT

## Description

Scripts pour convertir le fichier `stuff-features.json` vers le format DB de FoundryVTT avec organisation automatique en packs séparés par Category/Division.

## Architecture des packs

Le script organise automatiquement les items en utilisant la structure :

- **Category** (dossier parent) : Bonus, Malus, Group
- **Division** (sous-dossier) : Armor, Weapon, Melee_Weapon, Ballistic_Weapon, etc.

## Fichiers

### `convert-stuff-features.ps1`

Script PowerShell qui fait le travail de conversion.

**Usage :**

```powershell
# Depuis la racine du projet
.\src\scripts\packs\stuff-features\convert-stuff-features.ps1
```

**Ce que fait le script :**

1. Lit le fichier `stuff-features.json` (dans le même dossier)
2. Analyse les propriétés `system.category` et `system.division` de chaque item
3. Crée automatiquement les dossiers de destination `packs/stuff-features/<Category>/`
4. Génère 19 fichiers `.db` séparés par Category et Division
5. Chaque fichier contient uniquement les items de sa catégorie/division

## Résultat

- **Fichier d'entrée :** `stuff-features.json` (90 items)
- **Fichiers de sortie :** 19 packs séparés dans `packs/stuff-features/<Category>/<Division>.db`
- **Structure :** Packs organisés par Category/Division (ex: Bonus/Weapon.db, Malus/Armor.db, etc.)

## Utilisation

1. Exécutez `.\src\scripts\packs\stuff-features\convert-stuff-features.ps1`
2. Les fichiers `.db` sont générés dans `packs/stuff-features/` et prêts pour FoundryVTT

## Structure des packs créés

```
packs/stuff-features/
├── Bonus/
│   ├── Armor.db
│   ├── Ballistic_Weapon.db
│   ├── Container.db
│   ├── Melee_Weapon.db
│   ├── Objet.db
│   └── Weapon.db
├── Group/
│   ├── Armor.db
│   ├── Ballistic_Weapon.db
│   ├── Consumable.db
│   ├── Container.db
│   ├── Melee_Weapon.db
│   ├── Objet.db
│   └── Service.db
└── Malus/
    ├── Armor.db
    ├── Ballistic_Weapon.db
    ├── Consumable.db
    ├── Melee_Weapon.db
    ├── Objet.db
    └── Weapon.db
```

## Notes techniques

- Chaque pack `.db` contient uniquement les items de sa catégorie/division
- Les fichiers sont encodés en UTF-8 sans BOM pour éviter les problèmes d'affichage
- Chaque item a une propriété `_key` au format `!items!<id>` pour FoundryVTT
- Les packs sont organisés via `packFolders` dans `system.json`
