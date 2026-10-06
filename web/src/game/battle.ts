// Ambushes: the monster card, the battle screen, and everything that can
// happen in a round.

import { QBError } from "../dos/errors";
import { NUMBER_LEN, roundHalfEven, single } from "../dos/format";
import type { Monster } from "./data";
import { statusPanel } from "./explore";
import { potionDrops, potionMenu } from "./items";
import { death } from "./records";
import type { Character, Game } from "./state";
import { footer, hline, vline } from "./ui";

interface Battle {
  g: Game;
  /** Index of the monster in data.monsters; also its strength in the damage maths. */
  index: number;
  monster: Monster;
  hp: number;
  over: boolean;
}

/** Print on the message line, centred the way the original centred it. */
function say(g: Game, row: number, width: number, ...parts: Array<string | number>) {
  g.screen.at(row, 40 - Math.floor(width / 2));
  g.screen.writeln(...parts);
}

function clearRow(g: Game, row: number, from: number, to: number) {
  for (let c = from; c <= to; c++) g.screen.put(row, c, " ");
}

export async function encounter(g: Game) {
  const s = g.screen;
  const { level } = g;
  s.clear();
  s.mode(0);

  // Deeper levels bring tougher monsters: up to three per level, plus level / 1.3.
  let index = Math.floor(single(single(g.rng.next() * (level * 3)) + single(level / single(1.3))));
  if (index < 1) index = 1;
  if (index > 48) while (!(index < 48)) index = Math.floor(g.rng.next() * 48 + 1);

  s.color(4);
  const b: Battle = { g, index, monster: g.data.monsters[index], hp: 0, over: false };
  await monsterCard(b);
  b.hp = b.monster.hp;

  let key = "";
  let autoRounds = 0;
  let drankPotion = false;
  while (!b.over) {
    s.put(22, 20, " ".repeat(63));

    if (key.toLowerCase() !== "a") await battleScreen(b);

    s.color(7);
    if (b.hp > 0) {
      s.at(13, 49);
      s.writeln(b.hp, "/", b.monster.hp, "       ");
    }
    showPartyHp(g, 14, g.companion, g.fallen === "C");
    showPartyHp(g, 8, g.hero, g.fallen === "U");

    // (A)ttack runs three rounds on its own before asking again.
    if (key.toLowerCase() === "a") {
      if (++autoRounds === 4) {
        key = "Q";
        autoRounds = 1;
      }
    } else key = await g.pc.keyboard.waitKey();

    let event = 0;
    switch (key.toLowerCase()) {
      case "a":
        event = g.rng.roll(4);
        if (g.fallen === "U") event = event === 3 ? 1 : event === 4 ? 2 : event;
        else if (g.fallen === "C") event = event === 1 ? 3 : event === 2 ? 4 : event;
        break;
      case "m":
        await battleMagic(b);
        break;
      case "d":
        await potionMenu(g);
        drankPotion = true;
        break;
      case "r":
        await flee(b);
        break;
    }

    if (!b.over) {
      if (event === 1) await strike(b, g.companion, g.companionOffense);
      else if (event === 2) await monsterHitsCompanion(b);
      else if (event === 3) await monsterHitsYou(b);
      else if (event === 4) await strike(b, g.hero, g.heroOffense);

      if (b.monster.spellLevel > 0 && b.hp > 0 && key !== "Q") await monsterCasts(b);
    }

    if (key !== "Q" && !drankPotion) await g.pause();
    drankPotion = false;
    clearRow(g, 22, 5, 70);

    if (b.hp < 1) {
      key = "o";
      b.over = true;
      g.xp += b.monster.xp;
      s.color(4);
      s.at(22, 40 - Math.floor((b.monster.name.length + 20) / 2));
      s.write("You have killed the ", b.monster.name);
      await g.pause();

      await potionDrops(g, b.monster.name);
      if (b.monster.armor > 0) await lootArmor(b);
      if (b.monster.weapon > 0) await lootWeapon(b);
      if (g.xp >= g.nextLevelXp) await levelUp(g);
    }

    if (g.hero.hp < 1 && g.fallen !== "U") {
      key = "Q";
      // Leaves the round counter past 4, so the next (A)ttack never stops on its own.
      autoRounds = 4;
      s.color(4);
      s.put(22, 27, "Oh no! You've been killed!               ");
      await g.pause();
      if (g.fallen === "C") await death(g);
      g.fallen = "U";
    } else if (g.companion.hp < 1 && g.fallen !== "C") {
      key = "Q";
      autoRounds = 4;
      s.color(4);
      say(g, 22, g.companion.name.length + 25, "Oh, no! ", g.companion.name, " has been killed!         ");
      await g.pause();
      if (g.fallen === "U") await death(g);
      g.fallen = "C";
    }

    clearRow(g, 22, 1, 80);

    if (key === "Q") {
      s.put(22, 34, "Attack finished", 9);
      await g.pause();
    }
  }
}

function showPartyHp(g: Game, row: number, c: Character, dead: boolean) {
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

/** The "There is a ... here." card shown before a fight. */
async function monsterCard(b: Battle) {
  const { g, monster: m } = b;
  const s = g.screen;
  const { weapons, armor } = g.data;
  const rate = (theirs: number, ours: number) =>
    theirs > ours * 2 ? "Overwhelming"
    : theirs > ours ? "Excellent"
    : theirs * 3 < ours ? "Very Poor"
    : theirs * 2 < ours ? "Poor"
    : theirs < ours ? "Good"
    : "";
  const speed = ["Very Slow", "Slow", "Fast", "Very Fast"][m.speed] ?? (m.speed > 3 ? "Extremely Fast" : "");
  /** A label, then its value centred on column 45. */
  const field = (row: number, label: string, value: string) => {
    s.at(row, 15);
    s.write(label);
    if (value) s.put(row, 45 - value.length / 2, value);
  };

  s.clear();
  footer(g);
  s.color(15);
  s.writeln("There is a ", m.name, " here. ");
  s.writeln();
  s.put(5, 38 - m.name.length / 2, m.name, 14);

  s.color(1);
  hline(g, 6, 15, 59, "─");
  s.color(15);
  field(7, "Speed: ", speed);
  s.color(1);
  s.writeln();
  hline(g, 8, 15, 59, "─");
  s.color(15);
  field(9, "Weapon: ", weapons[m.weapon].name);
  field(10, "Armor: ", armor[m.armor].name);
  s.writeln();
  s.color(15);
  field(12, "Endurance: ", rate(m.hp, g.hero.hpMax));
  s.color(1);
  hline(g, 11, 15, 59, "─");
  s.color(15);
  field(13, "Power: ", rate(m.attack, g.hero.attack));
  s.writeln();
  s.color(1);
  hline(g, 14, 15, 59, "─");
  s.color(15);
  field(15, "Spell Level: ", "");
  s.put(15, 44, m.spellLevel);

  s.color(1);
  vline(g, 30, 7, 16, "│");
  s.put(6, 30, "┬");
  for (const r of [8, 11, 14]) s.put(r, 30, "┼");
  hline(g, 4, 15, 60, "═");
  hline(g, 16, 15, 60, "═");
  vline(g, 14, 5, 15, "║");
  vline(g, 60, 5, 15, "║");
  s.put(4, 14, "╔");
  s.put(4, 60, "╗");
  s.put(16, 14, "╚");
  s.put(16, 60, "╝");
  s.put(16, 30, "╧");

  await g.pause();
}

/** The battle screen: both party members, the monster, and the four choices. */
async function battleScreen(b: Battle) {
  const { g, monster: m } = b;
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
  showPartyHp(g, 8, g.hero, g.fallen === "U");

  box(11, 15);
  s.put(13, Math.floor(21 - g.companion.name.length / 2), g.companion.name, 15);
  s.color(14);
  showPartyHp(g, 14, g.companion, g.fallen === "C");

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

  s.at(8, Math.floor(55 - m.name.length / 2));
  s.color(7);
  s.writeln(m.name);
  s.put(10, 44, "Weapon: " + g.data.weapons[m.weapon].name);
  s.put(11, 44, "Armor:  " + g.data.armor[m.armor].name);
  s.at(13, 49);
  s.writeln(b.hp, "/", m.hp, "        ");
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

/** You (or your companion) swing at the monster; a miss is 1 in level + 5. */
async function strike(b: Battle, who: Character, offense: number) {
  const { g, monster: m } = b;
  const isHero = who === g.hero;
  g.screen.color(isHero ? 14 : 15);
  if (g.rng.roll(g.level + 5) === 1) {
    if (isHero) say(g, 22, 26, "You have swung and missed.");
    else say(g, 22, who.name.length + 19, who.name, " swings and misses.");
    return;
  }
  let damage = g.rng.below(who.attack + offense - g.level) + g.level ** 2;
  damage = Math.floor(damage - g.data.armor[m.armor].rating);
  if (damage < 1) damage = 1;
  if (isHero) say(g, 22, m.name.length + NUMBER_LEN + 25, "You hit the ", m.name, " for ", damage, " damage.");
  else say(g, 22, m.name.length + NUMBER_LEN + who.name.length + 15, who.name, " hits the ", m.name, " for ", damage);
  if (g.soundOn) await g.clock.hitSound();
  b.hp -= damage;
}

/** Monsters miss 1 time in (index + 1) - almost never, deep down - and always while you're invisible. */
function monsterMisses(b: Battle) {
  const roll = b.g.rng.roll(b.index + 1);
  return b.g.invisible || roll === 1;
}

async function monsterHitsCompanion(b: Battle) {
  const { g, monster: m } = b;
  const c = g.companion;
  g.screen.color(4);
  if (monsterMisses(b)) {
    g.screen.at(22, 25);
    say(g, 22, m.name.length + c.name.length + 24, "The ", m.name, " attacks ", c.name, " and misses");
    return;
  }
  let damage = g.rng.below(m.attack) + b.index;
  damage = Math.floor(damage - g.heroDefense); // your armour, not theirs
  if (damage < 1) damage = 1;
  c.hp -= damage;
  say(g, 22, c.name.length + NUMBER_LEN + 17, c.name, " has taken ", damage, "damage");
  if (g.soundOn) await g.clock.hitSound();
}

async function monsterHitsYou(b: Battle) {
  const { g, monster: m } = b;
  g.screen.color(4);
  if (monsterMisses(b)) {
    say(g, 22, m.name.length + 34, "The ", m.name, " attacks but does not hit you");
    return;
  }
  let damage = Math.floor(g.rng.next() * m.attack + g.data.weapons[m.weapon].rating) + b.index;
  damage = Math.floor(damage - g.heroDefense);
  if (damage < 1) damage = 1;
  say(g, 22, NUMBER_LEN + 19, "You sustain ", damage, " damage");
  if (g.soundOn) await g.clock.hitSound();
  g.hero.hp -= damage;
}

/** A 1-in-4 chance the monster casts one of its spells, hurting both of you. */
async function monsterCasts(b: Battle) {
  const { g, monster: m } = b;
  if (g.rng.roll(4) !== 2) return;
  await g.pause();
  clearRow(g, 22, 5, 70);
  const spell = g.data.monsterSpells[g.rng.roll(m.spellLevel)];
  const damage = g.rng.below(spell.high) + spell.low;
  g.companion.hp -= damage;
  g.hero.hp -= damage;
  g.screen.at(22, 40 - Math.floor((m.name.length + spell.name.length + NUMBER_LEN + 21) / 2));
  g.screen.color(4);
  if (g.soundOn) await g.clock.monsterSpellSound();
  g.screen.writeln("The ", m.name, " casts ", spell.name, ", ", damage, " damage.");
}

async function flee(b: Battle) {
  const { g, monster: m } = b;
  let roll = g.rng.roll(10);
  if (g.invisible || g.fallen !== "") roll = 99999;
  if (roll > m.speed) {
    say(g, 22, m.name.length + 21, "You have escaped the ", m.name);
    b.over = true;
    return;
  }
  g.screen.at(22, 25);
  say(g, 22, m.name.length + 22, "You cannot escape the ", m.name);
  await g.pause();
  clearRow(g, 22, 1, 70);
  if (!g.invisible && g.fallen === "") await monsterResponds(b, false);
}

/** After you flee or cast: the monster casts, or (if fast enough) attacks one of you. */
async function monsterResponds(b: Battle, announce: boolean) {
  const { g, monster: m } = b;
  if (m.spellLevel > 0 && b.hp > 0) {
    if (!announce || g.rng.roll(2) === 2) await monsterCasts(b);
    return;
  }
  let chance = g.rng.roll(5);
  if (announce && g.invisible) chance = 999;
  const target = chance <= m.speed ? g.rng.roll(2) : 0;
  // When fleeing, 1 means you and 2 your companion; after a spell it's the other way round.
  const hitsCompanion = announce ? target === 1 : target === 2;
  const hitsYou = announce ? target === 2 : target === 1;
  if (hitsCompanion) {
    if (announce) say(g, 21, m.name.length + 14 + g.companion.name.length, "The ", m.name, " attacks ", g.companion.name);
    await monsterHitsCompanion(b);
  } else if (hitsYou) {
    if (announce) say(g, 21, m.name.length + 17, "The ", m.name, " attacks you.");
    await monsterHitsYou(b);
  }
}

/** Spells in battle: pick who casts, then a spell from the three columns of five. */
async function battleMagic(b: Battle) {
  const { g } = b;
  const s = g.screen;
  const { spells } = g.data;

  s.clear();
  s.color(15);
  s.put(2, 6, "Pain Spells");
  s.put(2, 29, "Elemental Spells");
  s.put(2, 56, "Wrecking Spells");
  s.color(4);
  for (let i = 1; i <= 15; i++) {
    const column = Math.floor((i - 1) / 5);
    s.at(((i - 1) % 5) + 6, [4, 27, 54][column]);
    s.write(i, "- ", spells[i].name, ": ");
    s.writeln(spells[i].cost);
  }

  s.color(9);
  s.at(15, 25);
  if (g.fallen !== "U") s.writeln("You have ", g.hero.mp, " magic points");
  s.at(16, 25);
  if (g.fallen !== "C") s.writeln(g.companion.name, " has ", g.companion.mp, " magic points");

  s.at(17, 25);
  if (g.fallen === "") {
    if (g.hero.job === "A Magic User") {
      s.write("Use your magic? (y/n)");
      g.caster = 1;
    } else {
      s.write("Use ", g.companion.name, "s magic? (y/n)");
      g.caster = 2;
    }
    const k = await g.pc.keyboard.waitFor("y", "n");
    if (k.toLowerCase() === "n") g.caster = g.caster === 2 ? 1 : 2;
    s.put(16, 28, " ".repeat(55));
    s.put(17, 28, " ".repeat(54));
    for (const row of [15, 16]) clearRow(g, row, 1, 80);
  }

  s.at(16, 28);
  if (g.fallen === "U") {
    g.caster = 2;
    s.at(15, 28);
  } else if (g.fallen === "C") {
    g.caster = 1;
    s.at(16, 28);
  }
  s.writeln("What spell? (1-15)                   ");

  const caster = g.caster === 1 ? g.hero : g.companion;
  // The typed number is kept as typed: 0.4 looks up spell 0 (free) but still "casts" it.
  let chosen = 0;
  let spell = 0;
  for (;;) {
    s.at(g.fallen === "U" ? 15 : 16, 47);
    const n = await s.inputNumber();
    if (n >= -1 && n < 16) {
      // n can be -1 (or a fraction rounding to it): the original then reads
      // before the start of its spell table and stops with an error.
      const i = roundHalfEven(n);
      if (i < 0) throw new QBError(9, g.caster === 1 ? 2052 : 2063);
      if (spells[i].cost <= caster.mp) {
        chosen = n;
        spell = i;
        break;
      }
      if (g.caster === 1) {
        s.put(18, 20, "You do not have sufficent Magic to cast that spell");
        await g.pause();
        s.put(18, 20, " ".repeat(58));
      } else {
        say(g, 18, caster.name.length + 49, caster.name, " does not have suffient Magic to cast that spell");
        await g.pause();
        s.put(18, 1, " ".repeat(72));
      }
    }
  }

  if (chosen > 0) {
    const sp = spells[spell];
    s.put(17, 40 - sp.text.length / 2, sp.text);
    const damage = g.rng.below(sp.high) + sp.low;
    say(g, 18, NUMBER_LEN + 10, damage, " Damage");
    b.hp -= damage;
    caster.mp -= sp.cost;
  }

  if (b.hp > -1 && g.fallen === "") await monsterResponds(b, true);
}

async function lootArmor(b: Battle) {
  const { g, monster: m } = b;
  const item = g.data.armor[m.armor];
  await offerLoot(g, item.role, (c) => c.armor, (c) => (c.armor = m.armor), m.armor,
    m.name.length + item.name.length + 27, ["The ", m.name, " has ", item.name, ". Want it? (y/n)? "]);
}

async function lootWeapon(b: Battle) {
  const { g, monster: m } = b;
  const item = g.data.weapons[m.weapon];
  await offerLoot(g, item.role, (c) => c.weapon, (c) => (c.weapon = m.weapon), m.weapon,
    m.name.length + item.name.length + 29, ["The ", m.name, " has a ", item.name, ". Want it? (y/n)? "]);
  await statusPanel(g); // the original redraws the maze panel here, mid-battle
}

/** Offer a dropped item to whoever can use it, if it beats what they have. */
async function offerLoot(
  g: Game, role: string, current: (c: Character) => number, equip: (c: Character) => void,
  index: number, width: number, message: Array<string | number>,
) {
  g.screen.color(9);
  clearRow(g, 22, 10, 70);
  if (role !== "f" && role !== "m") return;
  const wearer = g.wearer(role);
  if (index <= current(wearer)) return;
  const half = Math.floor(width / 2);
  g.screen.color(13);
  say(g, 22, width, ...message);
  g.screen.at(22, 40 + 11 + half);
  const k = await g.pc.keyboard.waitFor("y", "n");
  if (k.toLowerCase() === "y") equip(wearer);
}

async function levelUp(g: Game) {
  clearRow(g, 22, 5, 70);
  g.screen.put(22, 25, "You have gained a level.......          ", 14);
  await g.pause();
  for (const c of [g.hero, g.companion]) {
    c.hpMax = Math.min(9999, Math.floor(single(c.hpMax * 1.25)));
    c.attack = Math.floor(single(c.attack * single(1.15)));
    c.mpMax = Math.min(999, Math.floor(single(c.mpMax * single(1.3))));
  }
  g.level++;
  if (g.fallen !== "U") g.hero.hp = g.hero.hpMax;
  if (g.fallen !== "C") g.companion.hp = g.companion.hpMax;
  await statusPanel(g);
}
