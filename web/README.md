# The web version

*Catacombs of Despair II: The Manifest Chronicles*, rewritten in TypeScript to
run in a browser. It looks like version 2.01 running in QuickBASIC 4.0 in
1995 (same screens, same colours, same random numbers), with its bugs fixed
(see [Fixed in this version](#fixed-in-this-version)).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests and headless playthroughs
npm run lint     # type check, ESLint, Prettier
npm run format   # fix formatting
npm run build    # static site in dist/
```

The game reads its data files (maps, monsters, spells, story text) from
[`data/`](data): copies of the 1995 files in [`original/`](../original) with
their typos fixed. The build copies them into `dist/data/`.

## How it's put together

```
src/
  dos/      the PC the game ran on
  game/     the game itself
  ide.ts    QuickBASIC's error screen
  main.ts   loads everything and runs it in the page
```

### `src/dos/`: a 1990s PC

Not an emulator: just the parts of a DOS PC and the QuickBASIC runtime whose
behaviour shows on screen, each measured against QuickBASIC 4.0 in DOSBox.

| Module | What it does |
| --- | --- |
| `video.ts` | VGA text mode at its real 720×400 resolution (9×16 character cells, the IBM VGA font, the line-drawing 9th column) and 640×480 16-colour graphics, with QB's exact line algorithm |
| `terminal.ts` | Text output and line input, with QB's rules: strings that don't fit move to the next line whole, 14-column print zones, lazy wrapping at column 80, a bottom line outside the scrolling area, half-to-even rounding of cursor positions, "Redo from start" |
| `format.ts` | How QB prints numbers (`" 42 "`, `".5"`, `"4.363585E-02"`, 7 significant digits) and what it accepts as one |
| `rng.ts` | QuickBASIC 4.0's `RND`: a 24-bit LCG that starts from seed 5 |
| `keyboard.ts`, `clock.ts`, `speaker.ts` | The 15-key BIOS buffer, delay loops timed like a 486, and PC-speaker beeps |
| `disk.ts`, `textfile.ts` | A DOS disk (the game's files, plus saves kept in `localStorage`) and BASIC's comma-and-line-break file format |

### `src/game/`: the game

Ordinary typed TypeScript. The original's structure is still recognisable,
but nothing is a line-for-line translation.

| Module | |
| --- | --- |
| `state.ts` | `Game`, `Character`, potions, position |
| `data.ts` | Monsters, spells, weapons and armour, parsed from the `.DAT` files |
| `title.ts` | The title sequence and character creation |
| `explore.ts` | The turn loop, side panel, stairs and Commands menu |
| `maze.ts`, `view3d.ts` | The levels and the first-person view |
| `battle.ts` | Ambushes: the monster card, rounds, magic, fleeing, loot, levelling up |
| `fight.ts` | What ambushes and the final battle share: the battle screen, the message line, the four ways a round can go |
| `fieldspells.ts` | Heal, Location, Eagle Eye, Life and Teleport |
| `items.ts` | Potions and treasure chests |
| `records.ts` | Saving, restoring, high scores, hints, game over |
| `endgame.ts` | The final battle against Beldan (from `ENDGAME.BAS`) |

## Fixed in this version

This is the corrected version of the game. The faithful port, which keeps
every 1995 bug and was checked screen by screen against the original, is the
[`faithful-1995`](https://github.com/arsindelve/manifest-chronicles/tree/faithful-1995)
tag. What changed:

**Bugs**

- **The race stats matched the wrong races.** The race notes say North
  Garkonens are the clever, weak ones and South Garkonens are average; the dice
  had it the other way round. A fighter companion's magic also came from *your*
  race instead of theirs (they're always a South Garkonen).
- **The footer moved you.** Drawing the "Manifest Chronicles v2.01" footer
  stored the cursor position as your position, so saving or casting from the
  Commands menu, or after an ambush or a chest, used square (1, 1): Location
  said North-west, Eagle Eye crashed, and restoring such a save put you in rock.
- **Your first step went nowhere.** The direction you walk was updated after
  the move, so the first step of a game, or after a restore, went nowhere or
  followed the old heading.
- **Your armour protected your companion,** never their own, in ambushes and
  against Beldan.
- **One counter did two jobs:** steps of invisibility and whether a chest had
  given out Excalibur. Drinking an invisibility potion could stop chests
  offering their best weapons.
- **White potions dropped by monsters counted twice.**
- **After a party member died, (A)ttack never stopped on its own**, and every
  attack after the first ran one round fewer than the first.
- **A capital Q in a fight** skipped the monster's turn.
- **Healing could overheal:** after one rejected amount, later amounts weren't
  checked.
- **Level 4 reused level 3's staircase list**, turning a few of its squares
  into floor.
- **Your companion's health and magic turned red** at the wrong thresholds
  (25% and 35%, the other way round from yours).
- **Against Beldan, any key that wasn't a command repeated your last blow.**
- **Monsters offered loot that was further down the list, not better.** Some
  items are out of order (a Wizard Staff after a Silver Sword), so you were
  offered worse gear and denied better.
- **A monster brought to exactly 0 hit points by a spell still struck back.**
- **Eagle Eye's sizes were mislabelled** (it shows 7x7, 13x13 and 19x19, not
  5x5, 10x10 and 20x20), and **Location's precise reading was one step off.**
- **Life needed 501 magic points**, while saying 500.
- **Potion names were case-sensitive** ("wHITE" didn't work), and the
  invisibility potion asked which of you drinks it, though it covers you both.
- **The Potions hint topic wasn't on the Hints menu.**
- **The maze side panel flashed up in the middle of a battle**, and was
  missing after the fight that follows invisibility wearing off.
- **When a monster's stats equalled yours**, its card left the rating blank.

**Crashes** (each stopped the game with a QuickBASIC error)

- Restoring with no saves, or typing the name of a save that doesn't exist.
  Both now say so, and Enter on its own goes back.
- Leaving the restore prompt blank at the title screen.
- Save names with characters DOS doesn't allow.
- Typing -1 as a battle spell; fractions are now rounded to a whole spell.
- Eagle Eye, the 3D view and the stairs near the edge of the map.

**Text**

- Spelling and typos in the game's messages ("Decend", "sufficent",
  "posseses", "shorlty", "Loracs magic", "23damage") and in the story,
  hint and item text in [`data/`](data) ("possesed", "granfather",
  "Play close attention", "Excaliber", "Ninja Assasin"). `data/` holds the
  web version's copies of the data files, so `original/` stays exactly as it
  was in 1995.
- Little layout slips: the grey-potion message sat one column left of the
  others, and two lines meant to clear part of the screen cleared the line
  below instead (QuickBASIC moves a string that doesn't fit to the next line).

As in the faithful version, stepping onto the exit of level 4 plays the
final battle. In version 2.01 QuickBASIC stopped there with "Type mismatch".

## Not the original

- **Arrow keys** stand in for the numeric keypad. On touch screens there's an
  on-screen keypad.
- **Saves and high scores** live in your browser (`localStorage`).
- **If a QuickBASIC error does happen,** it's shown the way the QuickBASIC 4.0
  editor showed it, and a key starts the game again.
- **Speed**: the original's delays were empty loops, so they ran as fast as
  your PC. They're timed here as if on a 486.

## Credits

The screen font (`public/vga8x16.bin`) is the IBM VGA 8×16 ROM font, taken
from DOSBox Staging's copy of it.
