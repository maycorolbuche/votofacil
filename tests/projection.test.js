import test from "node:test";
import assert from "node:assert/strict";
import { projectionData, validSnapshot } from "../src/helpers/Projection.js";
const snapshot = () => ({
  phase: "preparing",
  room: {
    id: 1,
    status: "closed",
    is_active: true,
    candidates: [
      { id: 2, sequence: 2, name: "Bruna", total_votes: 99 },
      { id: 1, sequence: 1, name: "Ana", total_votes: 0 },
    ],
    devices: [
      {
        status: "approved",
        users: [
          { id: 1, name: "José", votes_count: 1 },
          { id: 2, name: "Maria", votes_count: 3 },
        ],
      },
      { status: "pending", users: [{ id: 3, name: "Carla", votes_count: 3 }] },
      {
        status: "disapproved",
        users: [{ id: 4, name: "Paulo", votes_count: 3 }],
      },
    ],
  },
  configs: { votes: { items: { num_candidates: { value: 3 } } } },
});
test("preparation hides tallies and never sorts by votes", () => {
  const model = projectionData(snapshot());
  assert.equal(model.showResults, false);
  assert.deepEqual(
    model.candidates.map((c) => c.id),
    [1, 2],
  );
  assert.ok(
    model.candidates.every((c) => !("total" in c) && !("position" in c)),
  );
});
test("open voting never reveals even a contradictory results phase", () => {
  const data = snapshot();
  data.room.status = "open";
  data.phase = "results";
  assert.equal(projectionData(data).showResults, false);
  assert.equal(validSnapshot(data), false);
  data.phase = "voting";
  assert.equal(validSnapshot(data), true);
});
test("closed result is recognized on a new device with no storage", () => {
  const data = snapshot();
  data.phase = "results";
  const model = projectionData(data);
  assert.equal(model.showResults, true);
  assert.deepEqual(
    model.candidates.map((c) => c.id),
    [2, 1],
  );
});
test("shared-device voters progress independently; pending cannot complete", () => {
  const { voters } = projectionData(snapshot());
  assert.equal(voters.length, 3);
  assert.equal(voters[0].percent, 33);
  assert.equal(voters[0].complete, false);
  assert.equal(voters[1].percent, 100);
  assert.equal(voters[1].complete, true);
  assert.equal(voters[2].percent, 0);
  assert.equal(voters[2].complete, false);
});
test("results preserve ties", () => {
  const data = snapshot();
  data.phase = "results";
  data.room.candidates.push({
    id: 3,
    sequence: 3,
    name: "Carlos",
    total_votes: 99,
  });
  assert.deepEqual(
    projectionData(data).candidates.map((c) => c.position),
    [1, 1, 2],
  );
});
test("reopening and clearing use server phase", () => {
  const data = snapshot();
  data.phase = "results";
  assert.equal(projectionData(data).showResults, true);
  data.room.status = "open";
  data.phase = "voting";
  assert.equal(projectionData(data).showResults, false);
  data.room.status = "closed";
  data.phase = "preparing";
  assert.equal(projectionData(data).showResults, false);
});
test("inactive, deleted, missing phase and malformed snapshots are rejected", () => {
  const data = snapshot();
  assert.equal(validSnapshot(data), true);
  data.phase = undefined;
  assert.equal(validSnapshot(data), false);
  data.phase = "preparing";
  data.room.is_active = false;
  assert.equal(validSnapshot(data), false);
  data.room.is_active = true;
  data.room.status = "deleted";
  assert.equal(validSnapshot(data), false);
  assert.equal(validSnapshot({}), false);
});
