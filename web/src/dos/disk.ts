// A tiny DOS disk: the game's original data files (read-only, fetched at
// startup) overlaid with files the game writes, which persist in
// localStorage. File contents are strings of CP437 characters.

import { QBError } from "./errors";

const PREFIX = "manifest-chronicles/disk/";
const INDEX = "manifest-chronicles/disk-index";

function storage(): Storage | null {
  try {
    const s = window.localStorage;
    s.getItem(INDEX);
    return s;
  } catch {
    return null;
  }
}

/** Normalise a DOS file name to upper-case 8.3, or throw "Bad file name". */
export function dosName(name: string): string {
  const n = name.trim().toUpperCase();
  const m = /^([^.\\/:*?"<>|+=;,[\] ]{1,})(?:\.([^.\\/:*?"<>|+=;,[\] ]{0,}))?$/.exec(n);
  if (!m) throw new QBError(64);
  // DOS silently truncates long names and extensions.
  const [, name8, ext3 = ""] = m;
  const base = name8.slice(0, 8),
    ext = ext3.slice(0, 3);
  return ext ? `${base}.${ext}` : base;
}

export class Disk {
  private data = new Map<string, string>();
  private written = new Map<string, string>();
  private order: string[] = [];
  private store = storage();

  constructor(files: Record<string, string>) {
    for (const [name, text] of Object.entries(files)) this.data.set(name.toUpperCase(), text);
    if (this.store) {
      try {
        this.order = JSON.parse(this.store.getItem(INDEX) ?? "[]") as string[];
      } catch {
        this.order = [];
      }
      for (const name of this.order) {
        const text = this.store.getItem(PREFIX + name);
        if (text !== null) this.written.set(name, text);
      }
    }
  }

  exists(name: string) {
    const n = dosName(name);
    return this.written.has(n) || this.data.has(n);
  }

  read(name: string): string {
    const n = dosName(name);
    const text = this.written.get(n) ?? this.data.get(n);
    if (text === undefined) throw new QBError(53);
    return text;
  }

  write(name: string, text: string) {
    const n = dosName(name);
    if (!this.written.has(n) && !this.data.has(n)) this.order.push(n);
    this.written.set(n, text);
    if (this.store) {
      try {
        this.store.setItem(PREFIX + n, text);
        this.store.setItem(INDEX, JSON.stringify(this.order));
      } catch {
        // Storage full or blocked: the file still exists for this session.
      }
    }
  }

  /** Directory listing in DOS order: original files first, then files in creation order. */
  list(): string[] {
    const names = [...this.data.keys()];
    for (const n of this.order) if (!this.data.has(n)) names.push(n);
    return names;
  }
}

/** DOS wildcard match ("*.SAV", "A?.DAT") against an 8.3 name. */
export function dosMatch(spec: string, name: string): boolean {
  const split = (s: string) => {
    const i = s.indexOf(".");
    return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)];
  };
  const part = (pat: string, s: string, len: number) => {
    const p = pat.padEnd(len, " "),
      v = s.padEnd(len, " ");
    for (let i = 0; i < len; i++) {
      if (p[i] === "*") return true;
      if (p[i] !== "?" && p[i] !== v[i]) return false;
    }
    return true;
  };
  const [pb, pe] = split(spec.toUpperCase());
  const [nb, ne] = split(name.toUpperCase());
  return part(pb, nb, 8) && part(pe, ne, 3);
}
