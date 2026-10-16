import test from "node:test";
import assert from "node:assert/strict";
import { canAccept, canDecline, canDeliver } from "./contractPolicy.js";

test("a contract cannot be accepted without an assigned funded project", () => {
  assert.equal(canAccept("assigned", "assigned", "assigned"), true);
  for (const state of ["unpaid", "disputed", "cancelled", "refunded", "released"])
    assert.equal(canAccept("assigned", "assigned", state), false);
  assert.equal(canAccept("submitted", "submitted", "submitted"), false);
});
test("a decline cannot undo a submitted or already-active contract", () => {
  assert.equal(canDecline("assigned", "assigned", "assigned"), true);
  assert.equal(canDecline("in_progress", "in_progress", "in_progress"), false);
  assert.equal(canDecline("assigned", "assigned", "disputed"), false);
});
test("a delivery can only be submitted during valid work or revision", () => {
  assert.equal(canDeliver("in_progress", "in_progress", "in_progress"), true);
  assert.equal(canDeliver("in_progress", "revision_requested", "revision_requested"), true);
  assert.equal(canDeliver("assigned", "assigned", "assigned"), false);
  assert.equal(canDeliver("submitted", "submitted", "submitted"), false);
  assert.equal(canDeliver("in_progress", "in_progress", "disputed"), false);
  assert.equal(canDeliver("in_progress", "in_progress", "unpaid"), false);
});
