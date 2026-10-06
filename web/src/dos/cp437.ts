// CP437, the IBM PC character set: index = byte value, value = Unicode character.
export const CP437 = "\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

const toByte = new Map<string, number>();
for (let i = 0; i < 256; i++) toByte.set(CP437[i], i);

/**
 * Character -> CP437 byte. ASCII (control codes included) maps to itself;
 * anything else is looked up by its glyph, with unknown characters as '?'.
 */
export function cp437Byte(ch: string): number {
  const c = ch.charCodeAt(0);
  return c < 0x80 ? c : (toByte.get(ch) ?? 0x3f);
}

/** Decode raw file bytes. ASCII stays as-is (line breaks too); the upper half becomes its CP437 glyph. */
export function decodeCP437(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += b < 0x80 ? String.fromCharCode(b) : CP437[b];
  return s;
}

/** Encode a string to CP437 bytes. */
export function encodeCP437(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = cp437Byte(s[i]);
  return out;
}
