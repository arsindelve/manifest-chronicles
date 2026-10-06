// Every file the game opens. The game's data lives in web/data/: copies of the
// 1995 files in original/, with their typos fixed. M.BAS is read from
// original/ itself.
export const DATA_FILES = [
  "MAP.1",
  "MAP.2",
  "MAP.3",
  "MAP.4",
  "MAPTEXT.1",
  "MAPTEXT.2",
  "MAPTEXT.3",
  "MAPTEXT.4",
  "MAPTEXT.5",
  "MAPTEXT.6",
  "MAPTEXT.7",
  "MAPTEXT.8",
  "HELP.1",
  "HELP.2",
  "HELP.3",
  "HELP.4",
  "HELP.5",
  "HELP.6",
  "HELP.7",
  "MONSTERS.DAT",
  "MONSPELL.DAT",
  "SPELLS.DAT",
  "WEAPONS.DAT",
  "ARMOR.DAT",
  "HIGH.DAT",
  // Not read by the game; shown on the QuickBASIC error screen.
  "M.BAS",
];

/** The folder, relative to web/, that holds a data file. */
export function dataFolder(name: string) {
  return name === "M.BAS" ? "../original" : "data";
}
