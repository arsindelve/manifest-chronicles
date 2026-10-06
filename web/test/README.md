# Tests

## Unit tests

```bash
npm test
```

These pin down the behaviour of the PC layer (`src/dos/`): number formatting,
`RND`, cursor rounding, line wrapping, print zones, `INPUT`, the text-file
format and the line-drawing algorithm. Each expectation was measured by running
small programs in Microsoft QuickBASIC 4.0 under DOSBox.

## Side-by-side comparison with the original

`compare.dosbox.test.ts` plays the original game, QuickBASIC 4.0 running
`M.BAS` in [DOSBox Staging](https://www.dosbox-staging.org/), next to the
TypeScript version, typing the same keys into both. After every step it
compares:

- **text screens, cell for cell** (character and colour), read straight from
  DOSBox's video memory through its REST API
- **graphics screens, pixel for pixel**, captured from the DOSBox window
- **the random number streams**: it finds QuickBASIC's `RND` seed in DOSBox's
  memory and checks that ours matches after every step

There are five scenarios:

1. **A full game:** title screen, character creation, the opening story, 60 turns of
   walking and fighting, then the Commands menu, Hints, field spells (Eagle
   Eye, Location), the potion menu, saving, restoring, quitting and the high-score table.
2. **The QuickBASIC error screen** you get by restoring when there are no saves.
3. **A walk on level 4** from a prepared save, up to the exit. Here the original
   stops with "Type mismatch" (see the main README).
4. **`ENDGAME.BAS` run directly**, given a party through `CHECK.TMP`, and played
   through to the end.
5. **Magic, potions and mishaps** from a prepared save. It answers whatever the
   original's cursor is waiting on: it casts and drinks in fights, and uses
   field spells while walking. Its usual ending is a real 1995 bug. Restoring a
   save made on a story square jumps you to square (1, 1). From there you can
   walk onto row 0, and the 3D view then stops with "Subscript out of range".
   Both versions show the same error screen.

### Setup (Windows)

1. Install DOSBox Staging (0.83 or later; the REST API is needed).
2. Make a folder with two subfolders:
   - `QB\`: QuickBASIC 4.0 (`QB.EXE` and its files)
   - `GAME\`: `M.BAS`, `ENDGAME.BAS` and the data files from the repo root
3. Copy `dosbox/compare.conf.template` to `compare.conf`, and replace `@DOS@` with
   the folder from step 2. Make an `endgame.conf` copy that runs `ENDGAME.BAS`.
4. For pixel comparison, install Python with Pillow. The capture uses Windows'
   `PrintWindow`, so it works even when the DOSBox window is covered.

```bash
DOSBOX_EXE="C:/.../DOSBox Staging/dosbox.exe" \
DOSBOX_CONF="C:\\...\\compare.conf" ENDGAME_CONF="C:\\...\\endgame.conf" \
GAME_DIR="C:/.../GAME" GRAB_SCRIPT="test/dosbox/grab_compare.py" \
npx vitest run --config vitest.dosbox.config.ts
```

`TURNS` sets how many turns the walking part plays (60 by default). A full run
takes about 15 minutes, because QuickBASIC types its story text out slowly.
