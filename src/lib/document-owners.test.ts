import { expect, test } from "bun:test";
import { attachDocumentOwners } from "./document-owners";

test("each document is attributed to its uploader, not profile order", () => {
  const result = attachDocumentOwners(
    [{ id: "front", user_id: "partner-b" }, { id: "back", user_id: "partner-a" }],
    [
      { id: "partner-a", full_name: "Partner A", email: "a@example.test" },
      { id: "partner-b", full_name: "Partner B", email: "b@example.test" },
    ],
  );
  expect(result[0]?.owner).toEqual({ id: "partner-b", full_name: "Partner B", email: "b@example.test" });
  expect(result[1]?.owner?.id).toBe("partner-a");
});

test("missing profiles never attribute a document to another partner", () => {
  const result = attachDocumentOwners(
    [{ user_id: "missing" }],
    [{ id: "other", full_name: "Other partner", email: "other@example.test" }],
  );
  expect(result[0]?.owner).toBeNull();
});