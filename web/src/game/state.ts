// Everything about a quest in progress, and the shared context the game's
// modules work with.

import type { PC } from "../dos/pc";
import type { GameData } from "./data";

export type Job = "A Fighter" | "A Magic User";

export interface Character {
  name: string;
  job: Job;
  attack: number;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  /** Indexes into data.armor / data.weapons. */
  armor: number;
  weapon: number;
}

/** Who has fallen: nobody, you ("U"), or your companion ("C") - the save-file codes. */
export type Fallen = "" | "U" | "C";

export const POTION_COLORS = ["purple", "green", "white", "yellow", "blue", "red", "grey"] as const;
export type PotionColor = (typeof POTION_COLORS)[number];

/** Compass headings in degrees, as the game stores them. */
export type Heading = 0 | 90 | 180 | 270;

export interface Point {
  /** Row of the map file (north is up). */
  row: number;
  /** Column of the map file. */
  col: number;
}

export function newCharacter(): Character {
  return { name: "", job: "A Fighter", attack: 0, hp: 0, hpMax: 0, mp: 0, mpMax: 0, armor: 0, weapon: 0 };
}

export class Game {
  hero = newCharacter();
  companion = newCharacter();
  fallen: Fallen = "";
  level = 0;
  xp = 0;
  map = 0;
  heading: Heading = 0;
  pos: Point = { row: 11, col: 11 };
  potions: Record<PotionColor, number> = { purple: 0, green: 0, white: 0, yellow: 0, blue: 0, red: 0, grey: 0 };
  invisible = false;
  soundOn = true;
  /** Map 4's story squares are told in order: MAPTEXT.4, .5, .6 ... */
  storiesTold = 0;
  /** Set once a new pair has been rolled, so the first level gets loaded. */
  isNewCharacter = false;
  /** Which of the pair casts out-of-battle spells: 1 = you, 2 = your companion. */
  caster: 1 | 2 = 1;

  /**
   * The position the game saves and casts location spells from: where you
   * stood at the start of the turn. Stairs and Teleport set it and
   * `jumpPending`, and the move happens at the end of the turn.
   */
  anchor: Point = { row: 0, col: 0 };
  /** Set when the next turn should jump to `anchor` (stairs, teleport, restore). */
  jumpPending = false;

  /** Steps taken while invisible; the potion wears off at 50. */
  invisibleSteps = 0;
  /** Set once a chest has given out Excalibur; after that, chests offer only lesser weapons. */
  excaliburFound = false;

  /** Combat bonuses from equipped gear (see refreshGear). */
  heroDefense = 0;
  heroOffense = 0;
  companionDefense = 0;
  companionOffense = 0;

  /** The 3D view's last drawn depth; carries over between frames like the original. */
  viewDepth = 0;

  constructor(
    readonly pc: PC,
    readonly data: GameData,
  ) {}

  get screen() {
    return this.pc.screen;
  }
  get rng() {
    return this.pc.rng;
  }
  get clock() {
    return this.pc.clock;
  }

  /** Wait for any key (the game's DELAY2). */
  pause() {
    return this.pc.keyboard.waitKey();
  }

  refreshGear() {
    const { armor, weapons } = this.data;
    this.heroDefense = armor[this.hero.armor].rating;
    this.heroOffense = weapons[this.hero.weapon].rating;
    this.companionDefense = armor[this.companion.armor].rating;
    this.companionOffense = weapons[this.companion.weapon].rating;
  }

  /** XP needed to reach the next level. */
  get nextLevelXp() {
    return this.level * 50 * this.level ** 2;
  }

  /** The party member who uses gear of the given kind: the fighter or the magic user. */
  wearer(role: "f" | "m"): Character {
    const wantsFighter = role === "f";
    return (this.hero.job === "A Fighter") === wantsFighter ? this.hero : this.companion;
  }
}
