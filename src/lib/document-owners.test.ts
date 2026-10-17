import assert from "node:assert/strict";
import { test } from "node:test";
import { attachDocumentOwners } from "./document-owners";

test("each document is attributed to its uploader, not profile order", () => {
  const result = attachDocumentOwners(
    [{ id: "front", user_id: "partner-b" }, { id: "back", user_id: "partner-a" }],
    [
      { id: "partner-a", full_name: "Partner A", email: "a@example.test" },
      { id: "partner-b", full_name: "Partner B", email: "b@example.test" },
    ],
  );
  assert.deepEqual(result[0]?.owner, { id: "partner-b", full_name: "Partner B", email: "b@example.test" });
  assert.equal(result[1]?.owner?.id, "partner-a");
});

test("missing profiles never attribute a document to another partner", () => {
  const result = attachDocumentOwners(
    [{ user_id: "missing" }],
    [{ id: "other", full_name: "Other partner", email: "other@example.test" }],
  );
  assert.equal(result[0]?.owner, null);
});