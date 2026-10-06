// Number conventions of the QuickBASIC runtime the game was written for.
// All measured against QuickBASIC 4.0 in DOSBox.

/** Round to nearest, ties to even (how QB turns 40.5 into a screen column: 40). */
export function roundHalfEven(x: number): number {
  const f = Math.floor(x);
  const d = x - f;
  if (d !== 0.5) return d < 0.5 ? f : f + 1;
  return f % 2 === 0 ? f : f + 1;
}

/**
 * A number as QB writes it (STR$): a leading space or minus sign, then up to
 * 7 significant digits with no leading zero (".5"). It switches to exponent
 * form ("1E+07", "4.363585E-02") when the plain form would need more than 7
 * digits before or after the decimal point.
 */
export function formatNumber(n: number): string {
  n = Math.fround(n);
  if (n === 0) return " 0";
  const sign = n < 0 ? "-" : " ";
  const [mantissa, expPart] = Math.abs(n).toExponential(6).split("e");
  const exp = parseInt(expPart, 10);
  const digits = mantissa.replace(".", "").replace(/0+$/, "");
  if (exp >= 7 || (exp < 0 && -exp - 1 + digits.length > 7)) {
    const m = mantissa.replace(/\.?0+$/, "");
    return `${sign}${m}E${exp < 0 ? "-" : "+"}${String(Math.abs(exp)).padStart(2, "0")}`;
  }
  let s: string;
  if (exp < 0) s = "." + "0".repeat(-exp - 1) + digits;
  else {
    const whole = digits.slice(0, exp + 1).padEnd(exp + 1, "0");
    const frac = digits.slice(exp + 1);
    s = frac ? `${whole}.${frac}` : whole;
  }
  return sign + s;
}

/** How PRINT shows a number: formatNumber plus a trailing space. */
export const printed = (n: number) => formatNumber(n) + " ";

/** QB's LEN() of a numeric variable is its storage size, not its digits. */
export const NUMBER_LEN = 4;

/**
 * BASIC's number grammar: sign, digits, point, digits, then an exponent
 * marker (E, or D for double precision) with its own sign and digits. Every
 * part is optional, so "d", "e5" or "." are numbers too - all zero.
 */
const NUMBER = /^[+-]?(\d*)(?:\.(\d*))?(?:[ED][+-]?\d*)?/i;

/** VAL(): the leading number in a string (spaces ignored), or 0. */
export function parseNumber(s: string): number {
  const m = s.replace(/[ \t]/g, "").match(NUMBER);
  if (!m || (!m[1] && !m[2])) return 0;
  const n = Number(m[0].replace(/[ED]([+-]?)$/i, "").replace(/d/i, "e"));
  return Math.fround(Number.isFinite(n) ? n : 0);
}

/** Whether a typed INPUT reply is acceptable as a number. */
export function isNumeric(s: string): boolean {
  const t = s.replace(/[ \t]/g, "");
  const m = t.match(NUMBER);
  return !!m && /^[!#%&]?$/.test(t.slice(m[0].length));
}

/** SINGLE-precision arithmetic, for the few calculations where rounding shows. */
export const single = Math.fround;
