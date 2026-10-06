// The PC layer's rules, each measured against QuickBASIC 4.0 in DOSBox.

import { describe, expect, it } from "vitest";
import { formatNumber, isNumeric, parseNumber, roundHalfEven } from "../src/dos/format";
import { QBRandom } from "../src/dos/rng";
import { TextReader, TextWriter } from "../src/dos/textfile";
import { makePC, screenLines, type } from "./headless";

describe("numbers", () => {
  it("prints like STR$", () => {
    const cases: Array<[number, string]> = [
      [1 / 3, " .3333333"], [1e7, " 1E+07"], [-5, "-5"], [0.5, " .5"], [2 ** 24, " 1.677722E+07"],
      [9999999, " 9999999"], [Math.fround(Math.fround(1 / 7) * 1e6), " 142857.2"], [0, " 0"], [-0.25, "-.25"], [115, " 115"],
      [0.001, " .001"], [0.0001, " .0001"], [1e-8, " 1E-08"], [123456.7, " 123456.7"], [-1e7, "-1E+07"],
      [4.363585e-2, " 4.363585E-02"], [8.977669e-2, " 8.977669E-02"], [0.99058, " .99058"], [1234567, " 1234567"],
    ];
    for (const [n, s] of cases) expect(formatNumber(n)).toBe(s);
  });

  it("accepts what QB accepts as a number", () => {
    for (const ok of ["", "12", " -3 ", "1.5", ".5", "d", "e", "1e3", "2D2", ".", "7#"]) expect(isNumeric(ok), ok).toBe(true);
    for (const bad of ["12x", "hello", "1,2", "--1"]) expect(isNumeric(bad), bad).toBe(false);
    expect([parseNumber("d"), parseNumber("1e3"), parseNumber(" 15  You"), parseNumber("04")]).toEqual([0, 1000, 15, 4]);
  });

  it("rounds screen positions half to even", () => {
    expect(roundHalfEven(40.5)).toBe(40);
    expect(roundHalfEven(41.5)).toBe(42);
    expect(roundHalfEven(-0.5)).toBe(0);
  });

  it("generates QuickBASIC 4.0's RND sequence", () => {
    const r = new QBRandom();
    const printed = Array.from({ length: 7 }, () => formatNumber(r.next()).trim());
    expect(printed).toEqual([".7107346", ".99058", ".8523988", ".3503776", "4.363585E-02", "8.977669E-02", ".5111076"]);
  });
});

describe("screen", () => {
  it("moves a string that doesn't fit to the next line, whole", () => {
    const pc = makePC();
    pc.screen.at(5, 75);
    pc.screen.writeln("HELLOWORLD");
    pc.screen.at(7, 78);
    pc.screen.writeln(12345);
    const lines = screenLines(pc);
    expect(lines[5].trimEnd()).toBe("HELLOWORLD");
    expect(lines[7].trimEnd()).toBe(" 12345");
  });

  it("uses 14-column zones and TAB like QB", () => {
    const pc = makePC();
    const s = pc.screen;
    s.at(10, 1);
    s.write("a");
    s.zone();
    s.write("b");
    s.zone();
    s.write("c");
    s.tab(5);
    s.write("t5");
    s.tab(3);
    s.writeln("t3");
    const lines = screenLines(pc);
    expect(lines[9].trimEnd()).toBe("a             b             c");
    expect(lines[10].trimEnd()).toBe("    t5");
    expect(lines[11].trimEnd()).toBe("  t3");
  });

  it("wraps a full 80-column line without a blank line after it", () => {
    const pc = makePC();
    pc.screen.writeln("=".repeat(80));
    pc.screen.writeln("next");
    expect(screenLines(pc)[1].trimEnd()).toBe("next");
  });

  it("keeps line 25 outside the scrolling area", () => {
    const pc = makePC();
    const s = pc.screen;
    s.at(25, 1);
    s.write("BOTTOM");
    s.writeln("X");
    s.writeln("after25");
    s.at(24, 1);
    s.writeln("L24");
    s.writeln("next");
    const lines = screenLines(pc).map((l) => l.trimEnd());
    expect(lines[24]).toBe("BOTTOMX");
    expect(lines.slice(20, 23)).toEqual(["after25", "L24", "next"]);
  });

  it("answers bad numbers with Redo from start", async () => {
    const pc = makePC();
    const answer = pc.screen.inputNumber("num? ");
    await type(pc, "12x\r7\r");
    expect(await answer).toBe(7);
    const lines = screenLines(pc).map((l) => l.trimEnd());
    expect(lines.slice(0, 4)).toEqual(["num? 12x", "", "Redo from start", "num? 7"]);
  });
});

describe("text files", () => {
  it("reads BASIC's sequential format, including empty lines", () => {
    const f = new TextReader(' 5 \r\n\r\n 10 \r\nMike\r\n\r\nHawke\r\n  spaced  \r\n"quo,ted"\r\n');
    expect([f.number(), f.string(), f.number(), f.string(), f.string(), f.string(), f.string(), f.string()])
      .toEqual([5, "", 10, "Mike", "", "Hawke", "spaced", "quo,ted"]);
  });

  it("writes high-score records in print zones", () => {
    const w = new TextWriter();
    w.record("Mike      ", "Lane", 42, 3704400);
    expect(w.text).toBe("Mike          ,Lane         , 42          , 3704400 \r\n");
  });
});

describe("graphics", () => {
  it("draws lines like QB's LINE", () => {
    const pc = makePC();
    pc.screen.mode(12);
    pc.video.line(1, 450, 214, 235, 14);
    const lit = (x: number, y: number) => pc.video.pixels[y * 640 + x] === 14;
    // Measured in DOSBox: the steep line repeats a column at rows 262 and 370.
    expect(lit(188, 261) && lit(188, 262)).toBe(true);
    expect(lit(81, 369) && lit(81, 370)).toBe(true);
    expect(lit(214, 235) && lit(1, 450)).toBe(true);
    // A perspective line from the 3D view: its one sideways step lands at x = 401.
    pc.video.line(450, 0, 254, 195, 14);
    expect(lit(401, 48) && !lit(401, 49) && lit(400, 49)).toBe(true);
  });
});
