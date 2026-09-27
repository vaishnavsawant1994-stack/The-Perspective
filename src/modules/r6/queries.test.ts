import { describe, expect, it } from "vitest";

import { projectR6ReadableFields } from "./queries";

describe("R6 API canonical field projection", () => {
  it("drops serializer fields that canonical authorization did not approve", () => {
    const projected = projectR6ReadableFields(
      {
        id: "lead-1",
        resourceId: "resource-1",
        lifecycleState: "QUALIFIED",
        updatedAt: "should-never-leak",
        providerSecret: "should-never-leak",
      },
      ["id", "resourceId", "lifecycleState"],
    );

    expect(projected).toEqual({
      id: "lead-1",
      resourceId: "resource-1",
      lifecycleState: "QUALIFIED",
    });
    expect(projected).not.toHaveProperty("updatedAt");
    expect(projected).not.toHaveProperty("providerSecret");
  });
});
