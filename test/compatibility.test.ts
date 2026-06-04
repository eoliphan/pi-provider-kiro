import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const streamSource = readFileSync(resolve(testDir, "../src/stream.ts"), "utf8");

describe("OMP compatibility", () => {
  it("does not use a named root import for the removed event-stream helper", () => {
    expect(streamSource).not.toMatch(/import\\s*\\{[^}]*createAssistantMessageEventStream/);
    expect(streamSource).toContain("createAssistantMessageEventStream");
  });
});
