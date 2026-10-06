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

### ▶ [Play it in your browser](https://arsindelve.github.io/manifest-chronicles/)

The web version is a TypeScript rewrite that looks and plays exactly like version 2.01 did
in 1995, down to the pixel, the random numbers and the bugs. It was checked screen by screen
against the original running in QuickBASIC 4.0. See [web/README.md](web/README.md).

---

## Timeline

These dates come from the original files' timestamps.

| When | What happened |
| --- | --- |
| **Jun – Dec 1991** | *Catacombs of Despair*, the first game. `CATACOMB.EXE` was compiled with QuickBASIC 4.0 on **Dec 15, 1991**. (Not in this repo; only the compiled game survives.) |
| **Jan 24, 1992** | The first maze for the sequel, `MAP.1`, is saved. |
| **Jan 30, 1992** | The player spell list, `SPELLS.DAT`, is written. |
| **Feb – Apr 1992** | Levels 2–4 and the story text (`MAPTEXT.3`–`.8`) are written. |
| **Apr 16 – 22, 1992** | `ENDGAME.BAS` (the final battle) and the main game are compiled into `ENDGAME.EXE` and `MANIFEST.EXE`. *The Manifest Chronicles* v1 is done. |
| **1994** | **Version 2.01**, as shown on the title screen. Weapons and armor are rebalanced (`WEAPONS.DAT`/`ARMOR.DAT`, Aug 16, 1994). |
| **Jul 19, 1995** | **`M.BAS` is last saved. This is the source in this repo.** By now it's too big for QuickBASIC 4.0's compiler, which allows 64 KB of code per module ("Program-memory overflow"), so version 2.01 only ever ran inside the QuickBASIC editor. |
| **1995 – 1998** | A **Visual Basic remake** (*Manifest* 3.0) with real graphics, WAV sound effects and Windows forms. Its project file was last saved Oct 10, 1998. |
| **Aug 1997** | Most of the remake's WAV sound effects and backdrops are made. |
| **Nov 10, 1999** | The last change to any file: a new bitmap for the remake's main screen. |

The QuickBASIC version uses no image or sound files at all. It draws everything with `LINE` and
beeps with `SOUND`. The bitmaps, WAV sound effects and *Blade Runner* MIDI made for the Visual Basic
remake aren't in this repo.

---

## The story

750,000 years ago, before recorded history, the world had two continents:
**Garnloken** (in the north) and **Carrion** (in the south). The people of Garnloken were farmers,
craftsmen and traders, ruled by a monarchy that always crowned the most popular man of the day.
The Carrions were bigger, stronger and closer to the wild, and they understood the natural world
much better.

Long ago the wizard **Beldan**, possessed by a demon of his own making, made himself ruler of
Garnloken, until a young soldier went into the catacombs where he lived and slew him. The
Manifest Chronicles pick up fifty years later, with that soldier's grandson, and the rumour that
Beldan might not be dead after all.

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
(The web version also takes the arrow keys.)

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
- At the bottom of level 4 waits **Beldan**: 3,500 hit points, *Satan's Blade* and *Demon Armor*.
  He silences your magic, heals himself, and can't be run from.

### What's down there

- **48 monsters**, from Giant Rats and Slimes up to Vampires, Hydras, the Chromatic Dragon,
  a Dracolich, a Beholder and the Titan. Some of them cast their own spells
  (Blizzard, Metal Storm, Lightning, Acid Rain, Maelstrom...).
- **15 player spells** in rising order of violence: *Distress → Ache → Agony → Misery →
  Anguish → Tornado → Blizzard → Inferno → Earthquake → Acid Flood → Mutilation →
  Devastation → Eradication → Annihilation → Obliteration*. Mutilation is my favorite:
  *"A man with a hockey mask appears with a machete and hacks your opponent."*
  Obliteration's description is just *"All hell breaks loose."*
- **Five spells for exploring**: Heal, Location, Eagle Eye (an overhead map), Life and Teleport.
- **26 weapons**, from the **Paper Sword** to **Excaliber** (spelled that way), and
  **23 kinds of armor**, from the **Loin Cloth** to **Mithril**. Each one is marked for
  fighters (`f`) or magic users (`m`).
- **Seven colors of potion**: purple, green, white, yellow, blue, red and grey.
- A **high-score table** that ranks the top ten adventurers and their companions by XP.

---

## Running the original

- **In a browser:** [the web version](https://arsindelve.github.io/manifest-chronicles/).
- **In DOSBox, as it ran in 1995:** mount the `original/` folder in [DOSBox](https://www.dosbox-staging.org/)
  with QuickBASIC 4.0 or 4.5, and run `QB /RUN M.BAS`. It won't compile into an `.EXE` with
  QuickBASIC 4.0 (see the 1995 entry in the timeline), but it runs in the editor. Lower the
  DOSBox `cycles` setting until the story text types out at a readable speed.
- **In [QB64](https://qb64.com/):** open `original/M.BAS` and run it from that folder. The empty
  `FOR` loops the game uses for delays will run far too fast on a modern PC.

---

## Bugs from the 1990s

Writing the web version meant reading every line, and turned up some things nobody noticed back then:

- **The ending was unreachable in version 2.01.** Stepping onto the exit `CHAIN`s to
  `ENDGAME.BAS`, which receives the party's stats through `COMMON` variables, matched by
  position. By 1995 `M.BAS`'s list had changed, so QuickBASIC stops with **"Type mismatch"**
  before the fight begins. The web version plays the ending anyway, as the 1992 build did.
- **The race stats are backwards.** The help says North Garkonens are the brainy ones, but the
  code gives South Garkonens the best intelligence (`INTELPOS = 10`) and North Garkonens an even split.
- **The screen footer moves you.** The routine that draws "Manifest Chronicles v2.01" stores the
  cursor position in the variables that hold your position. Save from the Commands menu and your
  save puts you inside the rock at square (1, 1).
- **Your armor protects your companion; theirs does nothing.** Monsters subtract *your* armor from
  the damage they do to either of you.
- **After one of you dies, (A)ttack never stops on its own,** because the round counter is
  left at 4 and only ever checked for equal to 4.

The [web version's README](web/README.md#kept-on-purpose) lists every quirk, all kept as they were.

---

## Under the hood

The whole game is one file, `M.BAS`, with about 4,300 lines, 38 `SUB`s and more than 60 global
variables, plus `ENDGAME.BAS` (1,160 lines) for the final battle.

**Main loop:** read a key, move or turn, roll for an ambush or a chest, regenerate MP,
redraw the corridor, repeat. The structure is plain 1990s QuickBASIC: `SCREEN 12`
for the maze, `SCREEN 0` for every menu, and a lot of `COMMON SHARED`.

**The 3D view:** the `DATA` block at the end of the main module holds nine sets of nested
rectangles (front wall, left opening, right opening), one per square of depth. The renderer
walks forward from the player until it hits a wall. For each square, it blacks out the
rectangles for any side passage that's open. The vanishing-point lines are drawn last.
There's no math, just lookup tables.

**Randomness:** the game never calls `RANDOMIZE`, so QuickBASIC's random numbers start from the
same seed every time. What made each game different was the title screen, which calls `RND`
over and over while it waits for you to press a key.

**Data formats:** everything is plain text read with `INPUT #`, one field per line:

| File | Format |
| --- | --- |
| `MAP.n` | 2,500 numbers (50×50): `0` floor, `1` wall, `2` stairs, `3` story trigger, `4` the final exit |
| `MAPTEXT.n`, `HELP.n` | Story and hint text. The first two characters of each line set the color, `/` stands for a comma, and `Ç` pauses for a keypress. Ends with `EOD`. |
| `MONSTERS.DAT` | Name, speed, HP, attack, XP, weapon, armor, spell level. Ends with `Eod`. |
| `SPELLS.DAT` | Name, minimum damage, damage range, magic cost, description |
| `MONSPELL.DAT` | Monster spell name, minimum damage, damage range |
| `WEAPONS.DAT` / `ARMOR.DAT` | Name, rating, `f`/`m` (fighter or magic user) |
| `HIGH.DAT` | 10 rows of `name, companion, level, xp` |
| `*.SAV` | A saved game: 38 values, one per line |

---

## What's in this repo

The original game is in [`original/`](original):

| File | Contents |
| --- | --- |
| `M.BAS` | The complete QuickBASIC source (version 2.01, last saved 1995) |
| `ENDGAME.BAS` | The final battle against Beldan (1992) |
| `MAP.1`–`MAP.4` | The four levels |
| `MAPTEXT.1`–`MAPTEXT.8` | Story text (`.7` and `.8` belong to the ending) |
| `HELP.1`–`HELP.7` | The in-game hints |
| `MONSTERS.DAT`, `MONSPELL.DAT`, `SPELLS.DAT`, `WEAPONS.DAT`, `ARMOR.DAT` | Game data |
| `HIGH.DAT` | High-score table (reset to empty slots; the game needs all ten) |
| `DRAW.DAT` | Drawing data |
| `AUTOEXEC.BAT`, `CONFIG.SYS` | The DOS boot setup it ran on: a Sound Blaster VIBRA16, a CD-ROM and a three-way boot menu for XMS, EMS or a "maintenance boot" |

The browser version, in TypeScript, is in [`web/`](web). It reads the data files straight from
`original/`, so there is only one copy of the game's content ([how it works](web/README.md)).

`ENDGAME.BAS`, the hint files and the 1995 versions of the data files came from the QuickBASIC
working folder the game was written in. Other copies in the archive had been rewritten for the
Visual Basic remake in a format `M.BAS` can't read.

The original save games and high scores weren't included. Line endings are kept exactly as they
were (`.gitattributes` turns off conversion) so every data file matches its original byte for byte.
