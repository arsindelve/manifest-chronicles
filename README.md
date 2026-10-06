# Catacombs of Despair II: The Manifest Chronicles

> *"The quest has failed. You have become victims of the Catacombs of Despair.
> This will be the last entry in the Manifest Chronicles."*
> (the game-over screen)

A first-person dungeon crawler for MS-DOS, written in **Microsoft QuickBASIC**. You pick a race
and a class, name a companion, and the two of you go down through four levels of maze.
Along the way you fight 48 kinds of monsters, cast spells, drink potions of unknown effect,
and loot chests for better swords and armor.

**I wrote this in high school.** The first game, *Catacombs of Despair*, came first. This
sequel followed a few months later, and I kept coming back to it for years after that.

---

## Timeline

These dates come from the original files' timestamps.

| When | What happened |
| --- | --- |
| **Jun – Dec 1991** | *Catacombs of Despair*, the first game. `CATACOMB.EXE` was compiled with QuickBASIC 4.0 on **Dec 15, 1991**. (Not in this repo; only the compiled game survives.) |
| **Jan 24, 1992** | The first maze for the sequel, `MAP.1`, is saved. |
| **Jan 30, 1992** | The player spell list, `SPELLS.DAT`, is written. |
| **Feb – Apr 1992** | Levels 2–4 and the story text (`MAPTEXT.3`–`.8`) are written. |
| **Apr 16 – 22, 1992** | `ENDGAME.EXE` and `MANIFEST.EXE` are compiled. *The Manifest Chronicles* v1 is done. |
| **1994** | **Version 2.01**, as shown on the title screen. Weapons and armor are rebalanced (`WEAPONS.DAT`/`ARMOR.DAT`, Aug 16, 1994). |
| **Jul 19, 1995** | **`M.BAS` is last saved. This is the source in this repo.** Monster spells are added, and the first bitmaps and sound effects are made for a Windows version. |
| **1995 – 1998** | A **Visual Basic remake** (*Manifest* 3.0) with real graphics, WAV sound effects and Windows forms. Its project file was last saved Oct 10, 1998. |
| **Aug 1997** | Most of the WAV sound effects and backdrops are made. The opening story and the monster table are rewritten. |
| **Nov 10, 1999** | The last change to any file: a new bitmap for the remake's main screen. |

The QuickBASIC version uses no image or sound files at all. It draws everything with `LINE` and
beeps with `SOUND`. The bitmaps, WAV sound effects and *Blade Runner* MIDI made for the Visual Basic
remake aren't in this repo.

---

## The story

750,000 years ago, before recorded history, the world had two continents:
**Garnloken** (in the north) and **Carrion** (in the south). The people of Garnloken were farmers,
craftsmen and traders, ruled by a monarchy that always crowned the most popular man of the day. The Carrions were bigger, stronger and closer
to the wild, and they understood the natural world much better.

The Manifest Chronicles is the record of one expedition into the Catacombs of Despair.
How it ends is up to you.

---

## Playing the game

### Making your party

You choose one of four races. Each one trades strength for intelligence:

| Race | Description in the game |
| --- | --- |
| **North Garkonen** | "Very intelligent creatures that excel at magic. They are weak and make poor fighters." |
| **South Garkonen** | "Average strength and intelligence. A good magic user or a fighter." |
| **North Carrion** | "Short, strong and stocky. Not great magicians; much better fighters." |
| **South Carrion** | "A very dumb creature that excels on the field of battle... no concept of what magic is." |

Then you pick **Magic User** or **Fighter**, and your companion automatically becomes the other one.
Attack points, hit points, intelligence and magic points are rolled at random. If you don't like
the rolls, you can reroll as many times as you want.

### Controls

Use the **numeric keypad** with **Num Lock on**. The game makes a point of telling you this.

| Key | Action |
| --- | --- |
| `8` / `2` | Step forward / back |
| `4` / `6` | Turn left / right |
| `M` | Cast a spell |
| `D` | Drink a potion |
| `S` / `R` | Save / restore a game |
| `H` | Hints |
| `E` | Turn sound effects on or off |
| `C` | Show the command list |
| `Q` | Quit |
| `U` / `D` | Speed up / slow down scrolling story text |

### The catacombs

- **Four levels**, each a 50×50 grid. The view is a first-person wireframe corridor,
  drawn in 640×480 VGA with nothing but `LINE` boxes.
- Every level has **ten possible staircases**, and only one of them is real.
  A different one is picked at random each time a level loads.
- Every step has a **1-in-20 chance of an ambush** and a **1-in-600 chance of finding a chest**.
- Some squares trigger **story text**, which scrolls onto the screen in color.
- Magic points come back slowly while you walk. An invisibility potion keeps monsters
  away for 50 steps.

### What's down there

- **48 monsters**, from Giant Rats and Slimes up to Vampires, Hydras, the Chrome Dragon,
  a Dracolich, a Beholder and the Titan. Some of them cast their own spells
  (Blizzard, Metal Storm, Lightning, Acid Rain, Maelstrom...).
- **15 player spells** in rising order of violence: *Distress → Ache → Agony → Misery →
  Anguish → Tornado → Blizzard → Inferno → Earthquake → Acid Flood → Mutilation →
  Devastation → Eradication → Annihilation → Obliteration*. Mutilation is my favorite:
  *"A man with a hockey mask appears with a machete and hacks your opponent."*
  Obliteration's description is just *"All hell breaks loose."*
- **26 weapons**, from the **Paper Sword** to **Excaliber** (spelled that way), and
  **23 kinds of armor**, from the **Loin Cloth** to **Mithril**. Each one is marked for
  fighters (`f`) or magic users (`m`).
- **Seven colors of potion**: purple, green, white, yellow, blue, red and grey.
- A **high-score table** that ranks the top ten adventurers and their companions by XP.

---

## Running it today

### QB64 (easiest)

1. Install [QB64](https://qb64.com/).
2. Clone this repo and open `M.BAS`.
3. Run it **from the repo folder** so it can find the data files.

QB64 is very compatible with QuickBASIC 4.5, but code from 1995 might still need a small fix or two.
The empty `FOR` loops the game uses for delays will run far too fast on a modern PC.

### DOSBox + QuickBASIC 4.5

For the authentic experience, mount the repo folder in [DOSBox](https://www.dosbox.com/),
start `QB.EXE /L` and load `M.BAS`. Lower the DOSBox `cycles` setting until the scrolling text
moves at a readable speed.

### What's missing or mismatched

- **Four data files are from the VB remake.** `MONSTERS.DAT`, `MAPTEXT.1`, `MAPTEXT.2` and
  `maptext.0` were rewritten in August 1997 for the Visual Basic version: one character per line,
  and the monster table has two extra stat columns. `M.BAS` expects the 1992 format,
  so those files need to be swapped for the originals before the QuickBASIC version will run cleanly.
- **`HELP.1`–`HELP.7`** are the topics in the in-game Hints menu (`H`). They aren't in this
  archive, so opening a hint topic will fail.
- **`ENDGAME`**: reaching the final square `CHAIN`s to a separate `ENDGAME` program
  that plays the ending. Only a compiled 1992 `ENDGAME.EXE` survives, and its source is lost.
- `HIGH.DAT` **must exist with ten entries**, because the game reads it without any error
  handling. It ships here reset to ten `Empty` slots.

---

## Under the hood

The whole game is one file, `M.BAS`, with about 4,300 lines, 38 `SUB`s and more than 60 global variables.

**Main loop:** read a key, move or turn, roll for an ambush or a chest, regenerate MP,
redraw the corridor, repeat. The structure is plain 1990s QuickBASIC: `SCREEN 12`
for the maze, `SCREEN 0` for every menu, and a lot of `COMMON SHARED`.

**The 3D view:** the `DATA` block at the end of the main module holds nine sets of nested
rectangles (front wall, left opening, right opening), one per square of depth. The renderer
walks forward from the player until it hits a wall. For each square, it blacks out the
rectangles for any side passage that's open. The vanishing-point lines are drawn last.
There's no math, just lookup tables.

**Data formats:** everything is plain text read with `INPUT #`, one field per line:

| File | Format |
| --- | --- |
| `MAP.n` | 2,500 numbers (50×50): `0` floor, `1` wall, `2` stairs, `3` story trigger, `4` the final exit |
| `MAPTEXT.n` | Story text. The first two characters of each line set the color, `/` stands for a comma, and a special marker pauses for a keypress. Ends with `EOD`. |
| `MONSTERS.DAT` | Name, speed, HP, attack, XP, weapon, armor, spell. Ends with `Eod`. |
| `SPELLS.DAT` | Name, required level, min damage, max damage, description |
| `MONSPELL.DAT` | Monster spell name, min damage, max damage |
| `WEAPONS.DAT` / `ARMOR.DAT` | Name, rating, `f`/`m` (fighter or magic user) |
| `HIGH.DAT` | 10 rows of `name, companion, level, xp` |

**A bug from 1995:** the character-creation help says North Garkonens are the brainy ones,
but the code swaps them. South Garkonens get the best intelligence modifier (`INTELPOS = 10`)
and North Garkonens get an even split. Nobody noticed for 30 years.

---

## What's in this repo

| Path | Contents |
| --- | --- |
| `M.BAS` | The complete QuickBASIC source (version 2.01, last saved 1995) |
| `MAP.1`–`MAP.4` | The four levels |
| `MAPTEXT.*`, `maptext.0` | Story text |
| `MONSTERS.DAT`, `MONSPELL.DAT`, `SPELLS.DAT`, `WEAPONS.DAT`, `ARMOR.DAT` | Game data |
| `HIGH.DAT` | High-score table (reset) |
| `DRAW.DAT` | Drawing data |
| `AUTOEXEC.BAT`, `CONFIG.SYS` | The DOS boot setup it ran on: a Sound Blaster VIBRA16, a CD-ROM and a three-way boot menu for XMS, EMS or a "maintenance boot" |

The original save games and high scores weren't included. Line endings are kept exactly as they
were (`.gitattributes` turns off conversion) so every data file matches its original byte for byte.
