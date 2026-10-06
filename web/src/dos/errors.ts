// QuickBASIC run-time errors, with the messages QB 4.0 shows. The game hits
// a few of these in normal play (restoring with no saves, an out-of-range
// spell number), and the web version stops with the same message.

export const ERROR_MESSAGES: Record<number, string> = {
  5: "Illegal function call",
  9: "Subscript out of range",
  52: "Bad file name or number",
  53: "File not found",
  62: "Input past end of file",
  64: "Bad file name",
};

export class QBError extends Error {
  /** The M.BAS line the failing operation comes from, for the error screen. */
  line?: number;

  constructor(public code: number, line?: number) {
    super(ERROR_MESSAGES[code] ?? "Unprintable error");
    this.line = line;
  }
}

/** Run `f`, marking any QuickBASIC error it raises with the M.BAS line it corresponds to. */
export function atLine<T>(line: number, f: () => T): T {
  const tag = (e: unknown) => {
    if (e instanceof QBError && e.line === undefined) e.line = line;
    return e;
  };
  try {
    const r = f();
    return (r instanceof Promise ? r.catch((e) => Promise.reject(tag(e))) : r) as T;
  } catch (e) {
    throw tag(e);
  }
}

/** The program reached END. */
export class ProgramEnded extends Error {}

/** The program was stopped from outside (restart); unwinds silently. */
export class ProgramStopped extends Error {}
