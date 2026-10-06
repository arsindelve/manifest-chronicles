# The web version

*Catacombs of Despair II: The Manifest Chronicles*, rewritten in TypeScript to
run in a browser. It looks and plays exactly like version 2.01 running in
QuickBASIC 4.0 in 1995: same screens, same colours, same random numbers, same
bugs. It was checked against the original screen by screen (see
[test/README.md](test/README.md)).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests and headless playthroughs
npm run lint     # type check, ESLint, Prettier
npm run format   # fix formatting
npm run build    # static site in dist/
```

The game reads its original data files (maps, monsters, spells, story text)
straight from [`original/`](../original), unchanged. The build copies them into `dist/data/`.

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

## Kept on purpose

Every quirk of the original that you can see in play is still here, written
as a deliberate, commented rule rather than reproduced by accident:

- **The race stats are backwards.** The help says North Garkonens are the
  clever ones; the dice favour South Garkonens.
- **The footer moves you.** Drawing the "Manifest Chronicles v2.01" footer
  stores the cursor position in the position the game saves and casts spells
  from. Save or cast from the **Commands** menu, or in the same turn as an
  ambush or a chest, and it uses square (1, 1). Location then says you're in
  the North-west quadrant, Eagle Eye stops with "Subscript out of range", and the
  save puts you inside solid rock when you restore it in play.
- **Your first step goes nowhere.** The direction you walk is updated after
  you move, so the first step of a game, or after a restore, goes nowhere or
  follows the old heading.
- **Your armour protects your companion,** never their own. Gear picked up
  in a fight only counts from the next turn.
- **One counter, two jobs:** it counts steps of invisibility and records that
  the chests have given out Excaliber.
- **White potions dropped by monsters count twice.**
- **After a party member dies, (A)ttack runs until the fight is over.**
- **A capital Q in a fight ends the round early.** The original marked the end
  of an attack by setting the key to "Q", so typing one does the same: the
  monster doesn't cast that round.
- **Heal can overheal:** after one rejected amount, later amounts skip the check.
- **Level 4 reuses level 3's staircase list**, opening up a few extra squares.
- **Health and magic turn red** below 35% and 25% for you, but the other way
  round for your companion.
- **Against Beldan, any key that isn't a command repeats your last attack.**
- **Some mistakes stop the game with a QuickBASIC error,** shown the way the
  QuickBASIC 4.0 editor showed it: restoring when there are no saves, cancelling
  a restore at the title screen, or typing -1 as a spell number.
- **Little layout slips stay:** the grey-potion message sits one column left
  of the others, and a line meant to clear the message row clears the row
  below it.

### The one thing that isn't kept

In version 2.01, stepping onto the exit of level 4 doesn't start the final
battle. QuickBASIC stops with **"Type mismatch"**: `CHAIN` hands variables to
`ENDGAME.BAS` by position, and by 1995 `M.BAS`'s list no longer lined up with
it. The web version plays the ending, as the 1992 compiled build did.

## Not the original

- **Arrow keys** stand in for the numeric keypad. On touch screens there's an
  on-screen keypad.
- **Saves and high scores** live in your browser (`localStorage`).
- **After a QuickBASIC error,** a key starts the game again. In 1995 you'd
  have been left in the QuickBASIC editor.
- **Speed**: the original's delays were empty loops, so they ran as fast as
  your PC. They're timed here as if on a 486.

## Credits

The screen font (`public/vga8x16.bin`) is the IBM VGA 8×16 ROM font, taken
from DOSBox Staging's copy of it.
