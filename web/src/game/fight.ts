// What every fight has in common, ambushes and Beldan alike: the message
// line, the party's hit points, and who lands a blow when you attack.

import type { Character, Game } from "./state";
import { hline, vline } from "./ui";

/** The line under the battle screen where each round's events are reported. */
export const MESSAGE_ROW = 22;

/** Where the battle screen shows each side's hit points. */
const HERO_HP_ROW = 8;
const COMPANION_HP_ROW = 14;
const FOE_HP_ROW = 13;
const FOE_HP_COL = 49;

/** Print on a message line, centred the way the original centred it: on a width it worked out by hand. */
export function say(g: Game, row: number, width: number, ...parts: Array<string | number>) {
  g.screen.at(row, 40 - Math.floor(width / 2));
  g.screen.writeln(...parts);
}

export function clearRow(g: Game, row: number, from: number, to: number) {
  for (let c = from; c <= to; c++) g.screen.put(row, c, " ");
}

/** A party member's hit points on the battle screen, or "Dead". */
export function showPartyHp(g: Game, row: number, c: Character, dead: boolean) {
  const s = g.screen;
  if (dead) {
    s.at(row, 18);
    s.color(4);
    s.writeln("Dead");
  } else {
    s.at(row, c.hpMax > 99 ? 16 : 17);
    s.color(14);
    s.writeln(c.hp, "/", c.hpMax);
  }
}

/** Who lands a blow when you (A)ttack: one of four outcomes, equally likely. */
export type Exchange = "companionStrikes" | "monsterHitsCompanion" | "monsterHitsYou" | "youStrike";

const EXCHANGES = ["companionStrikes", "monsterHitsCompanion", "monsterHitsYou", "youStrike"] as const;

export function rollExchange(g: Game): Exchange {
  const exchange = EXCHANGES[g.rng.roll(4) - 1];
  // With one of the party dead, the blows that would have involved them go to the other.
  if (g.fallen === "U") {
    if (exchange === "monsterHitsYou") return "companionStrikes";
    if (exchange === "youStrike") return "monsterHitsCompanion";
  } else if (g.fallen === "C") {
    if (exchange === "companionStrikes") return "monsterHitsYou";
    if (exchange === "monsterHitsCompanion") return "youStrike";
  }
  return exchange;
}

/** The opponent's side of the battle screen. */
export interface Foe {
  name: string;
  weapon: string;
  armor: string;
  hp: number;
  maxHp: number;
}

/** The battle screen: both party members, the opponent, and the four choices. */
export function drawBattleScreen(g: Game, foe: Foe, dead: { hero: boolean; companion: boolean }) {
  const s = g.screen;
  const box = (top: number, color: number) => {
    s.color(color);
    s.put(top, 10, "┌");
    hline(g, top, 11, 30, "─");
    s.put(top, 30, "┐");
    vline(g, 10, top + 1, top + 5, "│");
    s.put(top + 5, 10, "└");
    hline(g, top + 5, 11, 30, "─");
    s.put(top + 5, 30, "┘");
    vline(g, 30, top + 1, top + 4, "│");
    s.writeln();
  };

  s.clear();
  box(5, 14);
  s.put(7, Math.floor(21 - g.hero.name.length / 2), g.hero.name, 15);
  s.color(14);
  showPartyHp(g, HERO_HP_ROW, g.hero, dead.hero);

  box(11, 15);
  s.put(13, Math.floor(21 - g.companion.name.length / 2), g.companion.name, 15);
  s.color(14);
  showPartyHp(g, COMPANION_HP_ROW, g.companion, dead.companion);

  s.color(4);
  s.put(5, 40, "╔");
  hline(g, 5, 41, 70, "═");
  s.put(5, 70, "╗");
  vline(g, 40, 6, 15, "║");
  s.put(16, 40, "╚");
  hline(g, 16, 41, 70, "═");
  s.put(16, 70, "╝");
  vline(g, 70, 6, 15, "║");
  s.writeln();

  s.at(8, Math.floor(55 - foe.name.length / 2));
  s.color(7);
  s.writeln(foe.name);
  s.put(10, 44, "Weapon: " + foe.weapon);
  s.put(11, 44, "Armor:  " + foe.armor);
  s.at(FOE_HP_ROW, FOE_HP_COL);
  s.writeln(foe.hp, "/", foe.maxHp, "        ");
  s.writeln();
  s.writeln();

  s.color(1);
  s.put(18, 10, "╔ ");
  hline(g, 18, 11, 69, "═");
  s.put(20, 10, "╚");
  hline(g, 20, 11, 69, "═");
  s.put(19, 10, "║");
  s.put(19, 70, "║");
  s.put(20, 70, "╝");
  s.put(18, 70, "╗");

  s.put(19, 16, "(A)ttack", 4);
  s.put(19, 30, "(M)agic", 14);
  s.put(19, 44, "(R)un", 10);
  s.put(19, 57, "(D)rink", 9);
}

/** Refresh the hit points shown on the battle screen after a round. */
export function showRoundHp(g: Game, foe: Pick<Foe, "hp" | "maxHp">) {
  const s = g.screen;
  s.color(7);
  if (foe.hp > 0) {
    s.at(FOE_HP_ROW, FOE_HP_COL);
    s.writeln(foe.hp, "/", foe.maxHp, "       ");
  }
  showPartyHp(g, COMPANION_HP_ROW, g.companion, g.fallen === "C");
  showPartyHp(g, HERO_HP_ROW, g.hero, g.fallen === "U");
}
