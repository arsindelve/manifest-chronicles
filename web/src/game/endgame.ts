// The final battle against Beldan (ENDGAME.BAS, April 1992), reached by
// stepping onto the exit square of level 4.
//
// It reuses the battle layout but has its own rules: Beldan can't be fled
// from, silences your magic on the first round, heals himself when he's
// down to his last 1000 points, and the fight plays no sound effects. It
// counts as level 10 whatever level you are.

import { NUMBER_LEN } from "../dos/format";
import { potionMenu } from "./items";
import { endProgram, slideIn } from "./records";
import type { Character, Game } from "./state";
import { hline, typeOut, vline } from "./ui";

const BELDAN = { name: "Beldan", weapon: "Satan's Blade", armor: "Demon Armor", hp: 3500, attack: 1000, spellLevel: 10 };
/** Beldan's strength in the damage maths (a regular monster's table index). */
const STRENGTH = 30;
const LEVEL = 10;

export async function endgame(g: Game): Promise<never> {
  const s = g.screen;
  s.mode(0);
  s.clear();

  s.clear();
  s.mode(0);
  await typeOut(g, "MAPTEXT.7", 250);
  s.clear();

  s.clear();
  s.mode(0);
  s.color(4);
  let hp = BELDAN.hp;
  let key = "";
  let autoRounds = 0;
  let muted = false;
  /**
   * What happens this round. Unlike a normal battle it's only re-rolled when
   * you attack and only cleared by Magic, Drink or Run - so the round that
   * ends an (A)ttack run, or any other key, repeats the previous round's action.
   */
  let event = 0;

  const say = (width: number, ...parts: Array<string | number>) => {
    s.at(22, 40 - Math.floor(width / 2));
    s.writeln(...parts);
  };
  const clearRow = (from: number, to: number) => {
    for (let c = from; c <= to; c++) s.put(22, c, " ");
  };

  const strike = (who: Character, offense: number) => {
    const isHero = who === g.hero;
    s.color(isHero ? 14 : 15);
    if (g.rng.roll(LEVEL + 5) === 1) {
      if (isHero) say(26, "You have swung and missed.");
      else say(who.name.length + 19, who.name, " swings and misses.");
      return;
    }
    let damage = g.rng.below(who.attack + offense - LEVEL) + LEVEL ** 2;
    if (damage < 1) damage = 1;
    if (isHero) say(NUMBER_LEN + 26, "You hit Beldan for ", damage, " damage.");
    else say(NUMBER_LEN + who.name.length + 16, who.name, " hits Beldan for ", damage);
    hp -= damage;
  };

  const attacks = (target: Character) => {
    const you = target === g.hero;
    s.color(4);
    if (g.rng.roll(STRENGTH + 1) === 1) {
      if (you) say(35, "Beldan attacks but does not hit you");
      else {
        s.at(22, 25);
        say(23 + target.name.length, "Beldan attacks ", target.name, " and misses");
      }
      return;
    }
    let damage = g.rng.below(BELDAN.attack) + STRENGTH;
    damage = Math.floor(damage - g.heroDefense);
    if (damage < 1) damage = 1;
    if (you) say(NUMBER_LEN + 19, "You sustain ", damage, " damage");
    else say(target.name.length + NUMBER_LEN + 17, target.name, " has taken ", damage, "damage");
    target.hp -= damage;
  };

  const casts = async () => {
    if (g.rng.roll(4) !== 2) return;
    await g.pause();
    clearRow(5, 70);
    const spell = g.data.monsterSpells[g.rng.roll(BELDAN.spellLevel)];
    const damage = g.rng.below(spell.high) + spell.low;
    g.companion.hp -= damage;
    g.hero.hp -= damage;
    s.at(22, 40 - Math.floor((spell.name.length + NUMBER_LEN + 22) / 2));
    s.color(4);
    s.writeln("Beldan casts ", spell.name, ", ", damage, " damage.");
  };

  for (;;) {
    s.put(22, 20, " ".repeat(63));
    if (key.toLowerCase() !== "a") battleScreen(g, hp);

    s.color(7);
    if (hp > 0) {
      s.at(13, 49);
      s.writeln(hp, "/", BELDAN.hp, "       ");
    }
    partyHp(g, 14, g.companion, g.fallen === "C");
    partyHp(g, 8, g.hero, g.fallen === "U");

    if (key.toLowerCase() === "a") {
      if (++autoRounds === 4) {
        key = "Q";
        autoRounds = 1;
      }
    } else key = await g.pc.keyboard.waitKey();

    if (!muted) {
      say(40, "Beldan casts Mute. You cannot use magic.");
      await g.pause();
      clearRow(5, 70);
      muted = true;
    }

    if (key.toLowerCase() === "a") {
      event = g.rng.roll(4);
      if (g.fallen === "U") event = event === 3 ? 1 : event === 4 ? 2 : event;
      else if (g.fallen === "C") event = event === 1 ? 3 : event === 2 ? 4 : event;
    }
    if (key.toLowerCase() === "m") {
      say(22, "You cannot cast Magic");
      event = 0;
    } else if (key.toLowerCase() === "d") {
      await potionMenu(g, { blueMax: 250, beldanSeesYou: true });
      event = 0;
    } else if (key.toLowerCase() === "r") {
      s.color(14);
      say(24, "You cannot escape Beldan");
      await g.pause();
      event = 0;
    }

    if (event === 1) strike(g.companion, g.companionOffense);
    else if (event === 2) attacks(g.companion);
    else if (event === 3) attacks(g.hero);
    else if (event === 4) strike(g.hero, g.heroOffense);

    if (hp < 1000 && hp > 0 && g.rng.roll(3) === 1) {
      await g.pause();
      s.color(4);
      const heal = g.rng.roll(500);
      say(40, "Beldan casts heal. He regains ", heal, " points.");
      hp += heal;
      await g.pause();
    }
    await casts();

    await g.pause();
    clearRow(5, 70);

    if (hp < 1) await victory(g);

    if (g.hero.hp < 1 && g.fallen !== "U") {
      key = "Q";
      autoRounds = 4;
      s.color(4);
      s.put(22, 27, "Oh no! You've been killed!               ");
      await g.pause();
      if (g.fallen === "C") await defeat(g);
      g.fallen = "U";
    } else if (g.companion.hp < 1 && g.fallen !== "C") {
      key = "Q";
      autoRounds = 4;
      s.color(4);
      say(g.companion.name.length + 25, "Oh, no! ", g.companion.name, " has been killed!         ");
      await g.pause();
      if (g.fallen === "U") await defeat(g);
      g.fallen = "C";
    }

    clearRow(1, 80);
    if (key === "Q") {
      s.put(22, 34, "Attack finished", 9);
      await g.pause();
    }
  }
}

function partyHp(g: Game, row: number, c: Character, dead: boolean) {
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

/** The battle screen, as for any monster - except "Dead" here means 0 hit points or less. */
function battleScreen(g: Game, hp: number) {
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
  partyHp(g, 8, g.hero, !(g.hero.hp > 0));
  box(11, 15);
  s.put(13, Math.floor(21 - g.companion.name.length / 2), g.companion.name, 15);
  s.color(14);
  partyHp(g, 14, g.companion, !(g.companion.hp > 0));

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

  s.at(8, Math.floor(55 - BELDAN.name.length / 2));
  s.color(7);
  s.writeln(BELDAN.name);
  s.at(10, 44);
  s.writeln("Weapon: ", BELDAN.weapon);
  s.at(11, 44);
  s.writeln("Armor:  ", BELDAN.armor);
  s.at(13, 49);
  s.writeln(hp, "/", BELDAN.hp, "        ");
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

async function victory(g: Game): Promise<never> {
  const s = g.screen;
  s.clear();
  s.mode(0);
  await typeOut(g, "MAPTEXT.8", 250);

  // Each letter wipes a row of the screen (all but row 12) and slides in.
  const text = "Congratulations Warrior ";
  s.color(4);
  for (let i = 1; i <= text.length; i++) {
    if (i !== 12) for (let col = 1; col <= 79; col++) {
      s.at(i, col);
      s.write(" ");
    }
    for (let j = 55; j >= 28; j -= 2) {
      s.put(12, j + i, text[i - 1]);
      s.put(12, j + 1 + i, " ");
    }
  }
  await g.pause();
  s.clear();
  endProgram();
}

async function defeat(g: Game): Promise<never> {
  const s = g.screen;
  s.clear();
  s.mode(0);
  s.color(15);
  s.writeln("The quest has failed. You have become victims of the Catacombs of Despair.");
  s.writeln("This will be the last entry in the Manifest Chronicles.");
  await g.pause();
  await slideIn(g, "The End ", 4, 70, 33, 30);
  await g.pause();
  endProgram();
}
