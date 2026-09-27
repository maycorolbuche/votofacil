import test from "node:test";
import assert from "node:assert/strict";
import {
  observePhase,
  projectionData,
  savePhase,
  validSnapshot,
} from "../src/helpers/Projection.js";
const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
};
const snapshot = () => ({
  room: {
    id: 1,
    status: "closed",
    is_active: 1,
    candidates: [
      {
        id: 2,
        sequence: 2,
        name: "Bruna",
        admin_votes: 99,
        user_votes: 0,
        total_votes: 99,
      },
      {
        id: 1,
        sequence: 1,
        name: "Ana",
        admin_votes: 0,
        user_votes: 0,
        total_votes: 0,
      },
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
test("initial manual votes do not reveal results or ranking", () => {
  const data = snapshot();
  const model = projectionData(data, observePhase(data, memory()));
  assert.equal(model.showResults, false);
  assert.deepEqual(
    model.candidates.map((c) => c.id),
    [1, 2],
  );
  assert.ok(
    model.candidates.every((c) => !("total" in c) && !("position" in c)),
  );
});
test("opening, automatic closing, reload, reopening and clearing", () => {
  const data = snapshot();
  const storage = memory();
  data.room.status = "open";
  assert.equal(observePhase(data, storage), "voting");
  data.room.status = "closed";
  assert.equal(observePhase(data, storage), "results");
  assert.equal(observePhase(data, storage), "results");
  data.room.status = "open";
  assert.equal(observePhase(data, storage), "voting");
  assert.equal(projectionData(data, "results").showResults, false);
  data.room.status = "closed";
  savePhase(1, "preparing", storage);
  assert.equal(observePhase(data, storage), "preparing");
});
test("late connection can use online totals consolidated by API at closing", () => {
  const data = snapshot();
  data.room.candidates[0].user_votes = 1;
  assert.equal(observePhase(data, memory()), "results");
  data.room.status = "open";
  assert.equal(observePhase(data, memory()), "voting");
});
test("shared-device voters have independent progress; pending cannot complete", () => {
  const { voters } = projectionData(snapshot(), "voting");
  assert.equal(voters.length, 3);
  assert.equal(voters[0].percent, 33);
  assert.equal(voters[0].complete, false);
  assert.equal(voters[1].percent, 100);
  assert.equal(voters[1].complete, true);
  assert.equal(voters[2].percent, 0);
  assert.equal(voters[2].complete, false);
});
test("results sort by votes and preserve ties with dense ranking", () => {
  const data = snapshot();
  data.room.candidates.push({
    id: 3,
    sequence: 3,
    name: "Carlos",
    total_votes: 99,
  });
  const model = projectionData(data, "results");
  assert.deepEqual(
    model.candidates.map((c) => c.id),
    [2, 3, 1],
  );
  assert.deepEqual(
    model.candidates.map((c) => c.position),
    [1, 1, 2],
  );
});
test("state from another room cannot reveal initial results", () => {
  const storage = memory();
  savePhase(2, "results", storage);
  assert.equal(observePhase(snapshot(), storage), "preparing");
});
test("deleted, inactive and malformed snapshots are rejected", () => {
  const data = snapshot();
  assert.equal(validSnapshot(data), true);
  data.room.is_active = 0;
  assert.equal(validSnapshot(data), false);
  data.room.is_active = 1;
  data.room.status = "deleted";
  assert.equal(validSnapshot(data), false);
  assert.equal(validSnapshot({}), false);
});
test("unavailable storage still supports observed open/close in current screen", () => {
  const storage = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  };
  assert.equal(observePhase(snapshot(), storage, "voting"), "results");
});
