import { expect, it } from "vitest";
import { runManifest } from "../src/game/game";
import { makePC, screenLines, settle } from "./headless";

it("starts up and shows the title", async () => {
  const pc = makePC();
  let failure: unknown;
  void runManifest(pc).catch((e) => (failure = e));
  await settle(pc);
  if (failure) throw failure;
  expect(screenLines(pc).join("\n")).toContain("Version 2.01 1994");
});
