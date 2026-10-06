// Potions and treasure chests.

import { single } from "../dos/format";
import type { Character, Game, PotionColor } from "./state";
import { footer } from "./ui";

/** Potion menu lines, in the order and colours the game lists them. */
const MENU: Array<[PotionColor, string, number]> = [
  ["white", " White x ", 15],
  ["grey", "  Grey x ", 8],
  ["purple", "Purple x ", 13],
  ["blue", "  Blue x ", 9],
  ["yellow", "Yellow x ", 14],
  ["red", "   Red x ", 4],
  ["green", " Green x ", 10],
];

const ATTRIBUTE = Object.fromEntries(MENU.map(([color, , attr]) => [color, attr])) as Record<PotionColor, number>;

/** Healing potions restore this share of the missing health. */
const HEALING: Partial<Record<PotionColor, number>> = { white: 0.15, grey: 0.25, purple: 0.5 };

export interface PotionRules {
  /** Blue potions restore up to this much magic (450; 250 in the final battle). */
  blueMax: number;
  /** In the final battle, Beldan isn't fooled by invisibility and says so. */
  beldanSeesYou: boolean;
}

/** "Drink" from the maze or in battle. */
export async function potionMenu(g: Game, rules: PotionRules = { blueMax: 450, beldanSeesYou: false }) {
  const s = g.screen;
  s.clear();
  s.mode(0);

  for (const [color, label, attr] of MENU) {
    if (g.potions[color] > 0) {
      s.color(attr);
      s.writeln(label, g.potions[color]);
    }
  }
  s.writeln();
  s.color(15);
  s.write("Type the colour of the potion you want to drink");
  const typed = await s.inputText();

  // Only "white", "White" and "WHITE" count - not "wHITE".
  const color = MENU.map(([c]) => c).find((c) => [c, c.toUpperCase(), c[0].toUpperCase() + c.slice(1)].includes(typed));
  if (color) await drink(g, color, rules);
  else if (typed === "") s.writeln();
  else s.writeln("There is no such potion.");

  await g.pause();
}

async function drink(g: Game, color: PotionColor, rules: PotionRules) {
  const s = g.screen;
  const { hero, companion } = g;
  if (g.potions[color] < 1) {
    s.writeln(`You do not have a ${color} potion.`);
    return;
  }
  g.potions[color]--;
  s.color(ATTRIBUTE[color]);

  // Who drinks it? Asked only while both are alive - except for green, which always asks.
  const askWho = async () => {
    s.writeln("Who? 1) You");
    s.writeln("     2) ", companion.name);
    return g.pc.keyboard.waitFor("1", "2");
  };
  let who = "";
  if (color === "green" || g.fallen === "") who = await askWho();
  if (color !== "green" && color !== "yellow") {
    if (g.fallen === "U") who = "2";
    if (g.fallen === "C") who = "1";
  }
  const drinker = who === "1" ? hero : who === "2" ? companion : null;
  const you = drinker === hero;
  const named = (c: Character, yours: string, theirs: string) => (c === hero ? yours : `${c.name} ${theirs}`);

  const heal = HEALING[color];
  if (heal !== undefined && drinker) {
    if (drinker.hp === drinker.hpMax) {
      s.writeln(named(drinker, "You drink", "drinks"), ` the ${color} potion. Nothing happens`);
    } else {
      drinker.hp += Math.floor(single((drinker.hpMax - drinker.hp) * single(heal)));
      if (drinker.hp > drinker.hpMax) drinker.hp = drinker.hpMax;
      s.writeln(named(drinker, "You feel", "feels"), " much better.");
    }
  } else if (color === "blue" && drinker) {
    drinker.mp += g.rng.roll(rules.blueMax);
    s.writeln(named(drinker, "You feel", "feels"), " much more powerful and much more intelligent.");
  } else if (color === "red" && drinker) {
    drinker.hp -= Math.floor(single(drinker.hp / 1.25));
    s.writeln(named(drinker, "You suddenly feel", "suddenly feels"), " very weak.");
  } else if (color === "yellow") {
    g.invisible = true;
    s.writeln("You and your companion are invisible.");
    if (rules.beldanSeesYou) s.writeln("Beldan says, 'You pathetic fool, I can still see you!'");
  } else if (color === "green" && drinker) {
    if (you && g.fallen === "U") {
      g.fallen = "";
      hero.hp = 1;
      s.writeln("You have been revived.");
    } else if (!you && g.fallen === "C") {
      g.fallen = "";
      companion.hp = 1;
      s.writeln(companion.name, " has been restored.");
    } else s.writeln(you ? "Nothing Happens." : "Nothing Happens");
  }
}

/** After a kill, each colour has its own chance to drop (white is counted twice - an old bug). */
export async function potionDrops(g: Game, monster: string) {
  const s = g.screen;
  const odds: Array<[PotionColor, number]> = [
    ["green", 100],
    ["red", 30],
    ["yellow", 25],
    ["blue", 30],
    ["purple", 20],
    ["grey", 10],
    ["white", 5],
  ];
  const dropped = new Set(odds.filter(([, n]) => g.rng.roll(n) === 1).map(([c]) => c));
  // [colour, attribute, potions gained, message width used for centring - grey's is one short]
  const shown: Array<[PotionColor, number, number, number]> = [
    ["green", 10, 1, 23],
    ["red", 4, 1, 21],
    ["yellow", 14, 1, 24],
    ["blue", 9, 1, 22],
    ["white", 15, 2, 23],
    ["grey", 8, 1, 21],
    ["purple", 13, 1, 24],
  ];
  for (const [color, attr, count, width] of shown) {
    if (!dropped.has(color)) continue;
    s.color(attr);
    s.at(22, 40 - (monster.length + width) / 2);
    s.writeln("The ", monster, ` has a ${color} potion`);
    await g.pause();
    for (let c = 1; c <= 80; c++) s.put(22, c, " ");
    g.potions[color] += count;
  }
}

/** A 1-in-600 find while walking: random potions, then armour and a weapon near what the fighter has. */
export async function openChest(g: Game) {
  const s = g.screen;
  s.clear();
  footer(g);
  s.mode(0);

  s.color(15);
  s.writeln("There is a chest here. You discover...");
  s.writeln();

  const odds: Array<[PotionColor, number]> = [
    ["green", 3],
    ["red", 2],
    ["yellow", 2],
    ["blue", 2],
    ["purple", 2],
    ["grey", 2],
    ["white", 2],
  ];
  const found = new Set(odds.filter(([, n]) => g.rng.roll(n) === 1).map(([c]) => c));
  const shown: Array<[PotionColor, number]> = [
    ["green", 2],
    ["red", 4],
    ["yellow", 14],
    ["blue", 9],
    ["white", 15],
    ["grey", 8],
    ["purple", 13],
  ];
  for (const [color, attr] of shown) {
    if (!found.has(color)) continue;
    s.color(attr);
    s.writeln(`A ${color} potion`);
    g.potions[color]++;
  }
  if (!found.size) s.writeln("There are no potions.");

  await g.pause();
  s.writeln();

  // Offers are based on the fighter's current gear, whoever that is.
  const fighter = g.wearer("f");
  let armor: number, weapon: number;
  if (fighter === g.hero) {
    armor = g.rng.below(fighter.armor) + (fighter.armor - 3);
    weapon = g.rng.below(fighter.weapon) + (fighter.weapon - 3);
  } else {
    armor = g.rng.below(fighter.armor + 1) + (fighter.armor - 2);
    weapon = g.rng.below(fighter.weapon + 1) + (fighter.weapon - 2);
  }
  if (weapon < 1) weapon = 1;
  if (armor < 1) armor = 1;
  if (armor > 23) while (!(armor < 23)) armor = g.rng.roll(23);
  if (g.sharedCounter !== 1) {
    if (weapon > 26) while (!(weapon < 26)) weapon = g.rng.roll(26);
  } else weapon = g.rng.roll(20); // Excaliber has been found (or you're 1 step into invisibility)
  if (weapon === 26) g.sharedCounter = 1;

  const offer = async (text: string, role: string, equip: (c: Character) => void) => {
    s.color(13);
    s.writeln(text);
    const k = await g.pc.keyboard.waitFor("y", "n");
    if (k.toLowerCase() === "y" && (role === "f" || role === "m")) equip(g.wearer(role));
  };
  const a = g.data.armor[armor],
    w = g.data.weapons[weapon];
  await offer(`The chest contains ${a.name}. Want it? (y/n) `, a.role, (c) => (c.armor = armor));
  await offer(
    `The chest contains ${weapon === 26 ? "" : "a "}${w.name}. Want it? (y/n)? `,
    w.role,
    (c) => (c.weapon = weapon),
  );
}
