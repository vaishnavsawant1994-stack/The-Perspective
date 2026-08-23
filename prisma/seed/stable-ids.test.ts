import { describe, expect, it } from "vitest";

import { stableId } from "./stable-ids";

describe("deterministic R2 seed identifiers", () => {
  it("returns the same UUIDv5 value for the same scenario key", () => {
    expect(stableId("org:asteria-systems")).toBe(
      stableId("org:asteria-systems"),
    );
    expect(stableId("org:asteria-systems")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("separates different scenario keys", () => {
    expect(stableId("org:asteria-systems")).not.toBe(
      stableId("org:northstar-labs"),
    );
  });

  it("rejects empty keys", () => {
    expect(() => stableId("  ")).toThrow("must not be empty");
  });
});
