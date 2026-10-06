# Catacombs of Despair II: The Manifest Chronicles

A DOS dungeon-crawler RPG written in Microsoft QuickBASIC. You and a companion explore
a maze across four maps, fighting monsters, casting spells, and collecting weapons and armor.

The original data files date from 1992; `M.BAS` was last saved in 1995, and the BMP/WAV
assets were added around 1999.

## What's here

| File(s) | What it is |
| --- | --- |
| `M.BAS` | The complete game source (~4,300 lines of QuickBASIC) |
| `MAP.1`–`MAP.4` | Maze maps |
| `MAPTEXT.*`, `maptext.0` | Location and event text |
| `MONSTERS.DAT`, `MONSPELL.DAT` | Monster stats and monster spells |
| `SPELLS.DAT`, `WEAPONS.DAT`, `ARMOR.DAT` | Player spells and equipment |
| `DRAW.DAT` | Drawing data |
| `HIGH.DAT` | High-score table (reset to blank entries) |
| `*.BMP`, `*.wav`, `*.mid` | Backdrops, sound effects, music |
| `AUTOEXEC.BAT`, `CONFIG.SYS` | The DOS boot config it was run under (Sound Blaster / VIBRA16 setup) |

## Running it

It runs in either of these:

- **QB64**: open `M.BAS` and run it. You may need to fix small QuickBASIC 4.x incompatibilities.
- **DOSBox + QuickBASIC 4.5**: load `M.BAS` and run it from the folder that holds the data files.

`HIGH.DAT` has to exist and hold 10 entries, because the game reads it with no error handling.
