// The title sequence and making a new pair of characters.

import type { Maze } from "./maze";
import { restoreGame } from "./records";
import type { Game, Job } from "./state";
import { footer, hline, vline } from "./ui";

/** The animated title, then "Restore or Start?". */
export async function titleScreen(g: Game, maze: Maze) {
  const s = g.screen;
  s.clear();
  s.mode(0);

  // Each letter drops from row 2 to row 10...
  s.color(15);
  const title = "Catacombs of Despair II";
  for (let i = 1; i <= title.length; i++) {
    for (let row = 2; row <= 10; row++) {
      s.put(row, i + 27, title[i - 1]);
      s.put(row - 1, i + 27, " ");
      await g.clock.spin(2150);
    }
  }
  // ...and these rise from row 22 to row 12.
  s.color(9);
  const subtitle = "The Manifest Chronicles ";
  for (let i = 1; i <= subtitle.length; i++) {
    for (let row = 22; row >= 12; row -= 2) {
      s.put(row, i + 27, subtitle[i - 1]);
      s.put(row + 1, i + 27, " ");
      await g.clock.spin(2150);
    }
  }
  for (let row = 13; row <= 22; row++) for (let col = 20; col <= 70; col++) s.put(row, col, " ");

  s.color(15);
  s.tab(30);
  s.writeln(" Version 2.01 1994 ");

  // The random numbers are never seeded; how long you wait here is what varies each game.
  let key = "";
  while (!key) {
    key = await g.pc.keyboard.poll();
    g.rng.next();
  }

  s.clear();
  s.writeln();
  s.color(15);
  s.writeln("Will you (R)estore a previous quest, or (S)tart a new one? (r/s) ");
  for (;;) {
    const choice = await s.inputText();
    if (choice === "R" || choice === "r") {
      if (await restoreGame(g, maze)) return;
      s.clear();
      s.writeln();
      s.color(15);
      s.writeln("Will you (R)estore a previous quest, or (S)tart a new one? (r/s) ");
      continue;
    }
    if (choice === "S" || choice === "s") {
      await newCharacterScreens(g);
      return;
    }
  }
}

interface Race {
  name: string;
  /** Multipliers for the intelligence and strength dice. */
  intel: number;
  strength: number;
}

/** Your companion is always one of these. */
const SOUTH_GARKONEN: Race = { name: "A South Garkonen", intel: 6, strength: 6 };

/** The four races, as the race notes describe them. */
const RACES: Record<string, Race> = {
  "1": { name: "A North Garkonen", intel: 10, strength: 2 },
  "2": SOUTH_GARKONEN,
  "3": { name: "A North Carrion", intel: 4, strength: 8 },
  "4": { name: "A South Carrion", intel: 1, strength: 11 },
};

export async function newCharacterScreens(g: Game) {
  const s = g.screen;
  const { hero, companion } = g;
  s.mode(0);

  await askNames(g);

  // Race
  let race: Race | undefined;
  while (!race) {
    s.clear();
    footer(g);
    s.mode(0);
    s.color(7);
    s.writeln("Are you a......");
    s.color(8);
    s.writeln();
    s.writeln();
    s.tab(25);
    s.write("╔");
    let col = 26;
    for (; col <= 53; col++) {
      s.tab(col);
      s.write("═");
    }
    s.tab(col);
    s.write("╗");
    const options: Array<[string, number]> = [
      ["1) North Garkonen.......", 7],
      ["2) South Garkonen.......", 4],
      ["3) North Carrion........", 9],
      ["4) South Carrion........", 7],
      ["?) What are all these?", 9],
    ];
    options.forEach(([text, color], i) => {
      if (i === 0) s.color(8);
      s.tab(25);
      s.write("║");
      s.color(color);
      s.tab(27);
      s.write(text);
      s.color(8);
      s.tab(54);
      if (i < options.length - 1) s.writeln("║");
      else s.write("║");
    });
    s.tab(25);
    s.write("╚");
    for (col = 26; col <= 53; col++) s.write("═");
    s.tab(col);
    s.writeln("╝");
    s.writeln();
    s.writeln();
    s.color(7);
    s.write("Type (1), (2), (3), (4) or (?) ");
    const choice = await s.inputText();
    race = RACES[choice];
    if (choice === "?") {
      s.clear();
      const notes: Array<[number, string[]]> = [
        [
          9,
          [
            "North Garkonens are very intelligent creatures that excel at magic.",
            "They are weak and make poor fighters.",
          ],
        ],
        [
          7,
          [
            "The South Garkonen possesses average strength and intelligence.",
            "He will make a good magic user or a fighter.",
          ],
        ],
        [
          9,
          [
            "North Carrions are short, strong and stocky. They are not great magicians.",
            "They are much better fighters.",
          ],
        ],
        [
          7,
          [
            "The South Carrion is a very dumb creature that excels on the field",
            "of battle. They make terrible magicians, though, because they",
            "have no concept of what magic is.",
          ],
        ],
      ];
      for (const [color, lines] of notes) {
        s.color(color);
        lines.forEach((l) => {
          s.writeln(l);
        });
        s.writeln();
      }
      s.color(8);
      await g.pause();
    }
  }

  // Class: whatever you pick, your companion is the other.
  let job: Job | undefined;
  while (!job) {
    s.clear();
    s.mode(0);
    s.at(12, 20);
    s.color(7);
    s.write("Will you be a ");
    s.color(4);
    s.write("Magic User ");
    s.color(7);
    s.write("or a ");
    s.color(4);
    s.writeln("Fighter?");
    s.at(14, 28);
    s.color(8);
    s.write("Type (1), (2) or (?) ");
    const choice = await s.inputText();
    if (choice === "1") job = "A Magic User";
    else if (choice === "2") job = "A Fighter";
    else if (choice === "?") {
      s.clear();
      s.color(9);
      for (const l of [
        "You have the choice of being either a magic user or a fighter.",
        "A magic user will have the ability to use powerful spells, but",
        "won't be able to carry the heavy weapons that the fighter can,",
        "and will not fight as well. Whatever you decide to be, your",
        "partner will be the other.",
      ])
        s.writeln(l);
      s.writeln();
      s.color(8);
      await g.pause();
    }
  }
  hero.job = job;
  companion.job = job === "A Fighter" ? "A Magic User" : "A Fighter";

  // Roll until the player is happy. Your companion is always a South Garkonen.
  for (;;) {
    g.rng.roll(5); // rolled and never used, but it moves the random sequence on
    s.clear();

    hero.attack = Math.min(99, g.rng.below(race.strength * 10) + 30);
    hero.hp = Math.min(99, g.rng.below(race.strength * 15) + 70);
    const intel = g.rng.below(race.intel * 7) + 1;
    companion.attack = Math.min(99, g.rng.below(60) + 30);
    companion.hp = Math.min(99, g.rng.below(90) + 50);
    const companionIntel = g.rng.below(42) + 1;
    // A fighter's magic is just their race's intelligence factor.
    companion.mp = Math.min(99, companion.job === "A Fighter" ? SOUTH_GARKONEN.intel : companionIntel * 5);
    hero.mp = Math.min(99, hero.job === "A Fighter" ? race.intel : intel * 5);

    statsTable(g);

    s.color(14);
    s.put(5, hero.name.length < 3 ? 29 : 26, hero.name);
    s.color(15);
    s.put(5, companion.name.length < 3 ? 49 : companion.name.length < 6 ? 48 : 46, companion.name);

    s.color(14);
    s.put(8, 21, race.name);
    s.at(9, 21);
    s.writeln("Job: ", hero.job);
    s.color(15);
    s.put(8, 42, "A South Garkonen");
    s.at(9, 42);
    s.writeln("Job: ", companion.job);
    s.color(14);
    stat(g, 21, hero.attack, hero.hp, intel, hero.mp);
    s.color(15);
    stat(g, 42, companion.attack, companion.hp, companionIntel, companion.mp);

    let answer = "";
    while (!["y", "n"].includes(answer.toLowerCase())) {
      s.at(20, 14);
      answer = await s.inputText("Are you happy with these characters? (y/n) ? ");
    }
    if (answer.toLowerCase() === "y") break;
  }

  g.level = 1;
  hero.mpMax = hero.mp;
  hero.hpMax = hero.hp;
  companion.hpMax = companion.hp;
  companion.mpMax = companion.mp;
  g.isNewCharacter = true;

  await instructions(g);
}

function stat(g: Game, col: number, attack: number, hp: number, intel: number, mp: number) {
  const s = g.screen;
  const rows: Array<[string, number]> = [
    ["Attack Points..", attack],
    ["Hit Points.....", hp],
    ["Intelligence...", intel],
    ["Magic Points...", mp],
  ];
  rows.forEach(([label, value], i) => {
    s.at(11 + i, col);
    s.writeln(label, value);
  });
}

async function askNames(g: Game) {
  const s = g.screen;
  const { hero, companion } = g;
  for (;;) {
    s.clear();
    footer(g);
    s.at(11, 20);
    s.color(15);
    hero.name = await s.inputText("What is your name? ");
    if (hero.name.length > 9) {
      s.tab(20);
      s.writeln("Please make your character name less than 10 characters.");
      await g.pause();
      continue;
    }
    if (hero.name.length < 1) {
      s.tab(20);
      s.writeln("Please enter something.");
      await g.pause();
      continue;
    }

    s.color(9);
    s.put(13, 20, "Type (?) if you don't understand.");
    s.at(12, 20);
    companion.name = await s.inputText("What is your companion's name? ");
    const problem =
      companion.name.length > 9
        ? "Please make your character name less than 10 characters."
        : companion.name.length < 1
          ? "Please enter something.                         "
          : companion.name === hero.name
            ? "Wouldn't that be a bit confusing?                "
            : "";
    if (problem) {
      s.tab(20);
      s.writeln(problem);
      await g.pause();
    } else if (companion.name === "?") {
      s.at(15, 20);
      s.color(15);
      s.writeln("You will venture through the Catacombs with a friend.");
      s.tab(20);
      s.writeln("He or she will fight alongside you. Please type a");
      s.tab(20);
      s.writeln("name for this person.");
      await g.pause();
    } else return;
  }
}

/** The double-lined box the stats are shown in. */
function statsTable(g: Game) {
  const s = g.screen;
  s.color(1);
  vline(g, 40, 5, 15, "│");
  hline(g, 6, 20, 60, "─");
  s.put(6, 40, "┼");
  s.put(4, 19, "╔");
  hline(g, 4, 20, 60, "═");
  s.put(4, 40, "╤");
  s.put(4, 61, "╗");
  vline(g, 19, 5, 15, "║");
  vline(g, 61, 5, 15, "║");
  s.put(6, 19, "╟");
  s.put(6, 61, "╢");
  s.put(15, 19, "╚");
  s.put(15, 61, "╝");
  hline(g, 15, 20, 60, "═");
  s.put(15, 40, "╧");
}

async function instructions(g: Game) {
  const s = g.screen;
  s.clear();
  s.color(15);
  s.tab(34);
  s.writeln("Instructions:");
  for (let i = 0; i < 5; i++) s.writeln();
  s.color(9);
  for (const l of [
    "  THIS IS VERY IMPORTANT! - Inside the maze, use the arrows on the",
    "  numeric keypad, not the group of four arrows beside them. Because of ",
    "  this, please ensure now that NUM LOCK has been selected ON.",
    "",
    "  At any time during the game, except during a battle, press 'C' for",
    "  a list of commands, and 'Q' to quit.",
    "",
    "  If there is a pause during the game, especially after a battle, keep",
    "  pressing 'ENTER' and the game will continue.",
    "",
    "                                         Enjoy the game",
    "                                          (Be Careful!)",
    "  ",
  ])
    s.writeln(l);
  s.color(15);
  s.writeln("Press any key to continue...");
  await g.pause();
}
