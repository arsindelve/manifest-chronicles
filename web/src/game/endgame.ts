// The final battle against Beldan (ENDGAME.BAS, April 1992), reached by
// stepping onto the exit square of level 4.
//
// It reuses the battle layout but has its own rules: Beldan can't be fled
// from, silences your magic on the first round, heals himself when he's
// down to his last 1000 points, and the fight plays no sound effects. It
// counts as level 10 whatever level you are.

import { NUMBER_LEN } from "../dos/format";
import { clearRow, drawBattleScreen, type Exchange, MESSAGE_ROW, rollExchange, say, showRoundHp } from "./fight";
import { potionMenu } from "./items";
import { endProgram, slideIn } from "./records";
import type { Character, Game } from "./state";
import { typeOut } from "./ui";

const BELDAN = {
  name: "Beldan",
  weapon: "Satan's Blade",
  armor: "Demon Armor",
  hp: 3500,
  attack: 1000,
  spellLevel: 10,
};
/** Beldan's strength in the damage maths (a regular monster's table index). */
const STRENGTH = 30;
const LEVEL = 10;

export async function endgame(g: Game): Promise<never> {
  const s = g.screen;
  s.mode(0);
  s.clear();
  await typeOut(g, "MAPTEXT.7", 250);
  s.clear();
  s.color(4);
  g.refreshGear();

  let hp = BELDAN.hp;
  // (A)ttack keeps fighting on its own for three rounds, then asks again.
  let attacking = false;
  let autoRounds = 0;
  let muted = false;

  const message = (width: number, ...parts: Array<string | number>) => {
    say(g, MESSAGE_ROW, width, ...parts);
  };

  const strike = (who: Character, offense: number) => {
    const isHero = who === g.hero;
    s.color(isHero ? 14 : 15);
    if (g.rng.roll(LEVEL + 5) === 1) {
      if (isHero) message(26, "You have swung and missed.");
      else message(who.name.length + 19, who.name, " swings and misses.");
      return;
    }
    let damage = g.rng.below(who.attack + offense - LEVEL) + LEVEL ** 2;
    if (damage < 1) damage = 1;
    if (isHero) message(NUMBER_LEN + 26, "You hit Beldan for ", damage, " damage.");
    else message(NUMBER_LEN + who.name.length + 24, who.name, " hits Beldan for ", damage, " damage.");
    hp -= damage;
  };

  const attacks = (target: Character) => {
    const you = target === g.hero;
    s.color(4);
    if (g.rng.roll(STRENGTH + 1) === 1) {
      if (you) message(35, "Beldan attacks but does not hit you");
      else {
        s.at(MESSAGE_ROW, 25);
        message(23 + target.name.length, "Beldan attacks ", target.name, " and misses");
      }
      return;
    }
    let damage = g.rng.below(BELDAN.attack) + STRENGTH;
    damage = Math.floor(damage - (you ? g.heroDefense : g.companionDefense));
    if (damage < 1) damage = 1;
    if (you) message(NUMBER_LEN + 19, "You sustain ", damage, " damage");
    else message(target.name.length + NUMBER_LEN + 18, target.name, " has taken ", damage, " damage");
    target.hp -= damage;
  };

  const casts = async () => {
    if (g.rng.roll(4) !== 2) return;
    await g.pause();
    clearRow(g, MESSAGE_ROW, 5, 70);
    const spell = g.data.monsterSpells[g.rng.roll(BELDAN.spellLevel)];
    const damage = g.rng.below(spell.high) + spell.low;
    g.companion.hp -= damage;
    g.hero.hp -= damage;
    s.at(MESSAGE_ROW, 40 - Math.floor((spell.name.length + NUMBER_LEN + 22) / 2));
    s.color(4);
    s.writeln("Beldan casts ", spell.name, ", ", damage, " damage.");
  };

  for (;;) {
    clearRow(g, MESSAGE_ROW, 20, 80);
    // Unlike an ambush, "Dead" here means 0 hit points or less.
    if (!attacking)
      drawBattleScreen(
        g,
        { ...BELDAN, hp, maxHp: BELDAN.hp },
        { hero: !(g.hero.hp > 0), companion: !(g.companion.hp > 0) },
      );
    showRoundHp(g, { hp, maxHp: BELDAN.hp });

    // As in an ambush, an attack that has run its course ends the round with
    // "Attack finished". Here Beldan still gets his turn.
    let attackOver = false;
    let command = "a";
    if (attacking) {
      if (++autoRounds === 4) {
        attacking = false;
        attackOver = true;
        autoRounds = 0;
      }
    } else {
      command = (await g.pc.keyboard.waitKey()).toLowerCase();
      attacking = command === "a";
    }

    if (!muted) {
      message(40, "Beldan casts Mute. You cannot use magic.");
      await g.pause();
      clearRow(g, MESSAGE_ROW, 5, 70);
      muted = true;
    }

    let exchange: Exchange | undefined;
    if (!attackOver) {
      if (command === "a") exchange = rollExchange(g);
      else if (command === "m") message(22, "You cannot cast Magic");
      else if (command === "d") await potionMenu(g, { blueMax: 250, beldanSeesYou: true });
      else if (command === "r") {
        s.color(14);
        message(24, "You cannot escape Beldan");
        await g.pause();
      }
    }

    if (exchange === "companionStrikes") strike(g.companion, g.companionOffense);
    else if (exchange === "monsterHitsCompanion") attacks(g.companion);
    else if (exchange === "monsterHitsYou") attacks(g.hero);
    else if (exchange === "youStrike") strike(g.hero, g.heroOffense);

    if (hp < 1000 && hp > 0 && g.rng.roll(3) === 1) {
      await g.pause();
      s.color(4);
      const heal = g.rng.roll(500);
      message(40, "Beldan casts heal. He regains ", heal, " points.");
      hp += heal;
      await g.pause();
    }
    await casts();

    await g.pause();
    clearRow(g, MESSAGE_ROW, 5, 70);

    if (hp < 1) await victory(g);

    if (g.hero.hp < 1 && g.fallen !== "U") {
      [attacking, attackOver] = [false, true];
      autoRounds = 0;
      s.color(4);
      s.put(MESSAGE_ROW, 27, "Oh no! You've been killed!               ");
      await g.pause();
      if (g.fallen === "C") await defeat(g);
      g.fallen = "U";
    } else if (g.companion.hp < 1 && g.fallen !== "C") {
      [attacking, attackOver] = [false, true];
      autoRounds = 0;
      s.color(4);
      message(g.companion.name.length + 25, "Oh, no! ", g.companion.name, " has been killed!         ");
      await g.pause();
      if (g.fallen === "U") await defeat(g);
      g.fallen = "C";
    }

    clearRow(g, MESSAGE_ROW, 1, 80);
    if (attackOver) {
      s.put(MESSAGE_ROW, 34, "Attack finished", 9);
      await g.pause();
    }
  }
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
    if (i !== 12)
      for (let col = 1; col <= 79; col++) {
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
