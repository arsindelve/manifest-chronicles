// The game's tables, parsed from the original .DAT files. Lists are indexed
// from 1 like the originals (index 0 is "nothing"), because save games and
// the monster table refer to weapons, armour and spells by those numbers.
// Each list keeps its "EOD" end marker as its last entry, as the original
// arrays did, so an out-of-range pick reads the same values it did then.

import type { PC } from "../dos/pc";

export type Role = "f" | "m"; // usable by a fighter or a magic user

export interface Gear {
  name: string;
  /** Damage bonus for a weapon, damage reduction for armour. */
  rating: number;
  role: Role | "";
}

export interface Monster {
  name: string;
  /** 0 very slow ... 4+ extremely fast: how often it strikes back, how hard it is to flee. */
  speed: number;
  hp: number;
  attack: number;
  xp: number;
  /** Index into weapons / armor; also what it drops. */
  weapon: number;
  armor: number;
  /** How many of the monster spells it knows (0 = none). */
  spellLevel: number;
}

export interface Spell {
  name: string;
  /** Damage is INT(RND * high) + low. */
  low: number;
  high: number;
  cost: number;
  text: string;
}

export interface MonsterSpell {
  name: string;
  low: number;
  high: number;
}

export interface GameData {
  monsters: Monster[];
  weapons: Gear[];
  armor: Gear[];
  spells: Spell[];
  /** Weakest first: index 1 is Blizzard, 10 is Maelstrom. */
  monsterSpells: MonsterSpell[];
}

const NONE_MONSTER: Monster = { name: "", speed: 0, hp: 0, attack: 0, xp: 0, weapon: 0, armor: 0, spellLevel: 0 };

export function loadGameData(pc: PC): GameData {
  const monsters: Monster[] = [NONE_MONSTER];
  {
    const f = pc.readFile("MONSTERS.DAT");
    for (;;) {
      const m: Monster = {
        name: f.string(),
        speed: f.number(),
        hp: f.number(),
        attack: f.number(),
        xp: f.number(),
        weapon: f.number(),
        armor: f.number(),
        spellLevel: f.number(),
      };
      monsters.push(m);
      if (m.name === "Eod") break;
    }
  }

  const readGear = (file: string, none: string): Gear[] => {
    const list: Gear[] = [{ name: none, rating: 0, role: "" }];
    const f = pc.readFile(file);
    for (;;) {
      const g = { name: f.string(), rating: f.number(), role: f.string() as Role };
      list.push(g);
      if (g.name === "EOD") break;
    }
    return list;
  };

  const spells: Spell[] = [{ name: "", low: 0, high: 0, cost: 0, text: "" }];
  {
    const f = pc.readFile("SPELLS.DAT");
    for (;;) {
      const s = { name: f.string(), low: f.number(), high: f.number(), cost: f.number(), text: f.string() };
      spells.push(s);
      if (s.name === "EOD") break;
    }
  }

  // MONSPELL.DAT lists the strongest spell first; the game files them from 10 down to 1.
  const listed: MonsterSpell[] = [];
  {
    const f = pc.readFile("MONSPELL.DAT");
    for (;;) {
      const s = { name: f.string(), low: f.number(), high: f.number() };
      listed.push(s);
      if (s.name === "EOD") break;
    }
  }
  const monsterSpells: MonsterSpell[] = new Array<MonsterSpell>(11).fill({ name: "", low: 0, high: 0 });
  listed.forEach((s, i) => (monsterSpells[10 - i] = s)); // the EOD row lands at index 0

  return {
    monsters,
    weapons: readGear("WEAPONS.DAT", "No Weapon"),
    armor: readGear("ARMOR.DAT", "No Armor"),
    spells,
    monsterSpells,
  };
}
