// The API uses "closed" before and after voting. Track the lifecycle in this
// administrator's browser; initial manual votes must not reveal a result.
export const phaseKey = (roomId) => `projection-phase:${roomId}`;
export function savePhase(roomId, phase, storage = localStorage) {
  try {
    if (storage.getItem(phaseKey(roomId)) !== phase)
      storage.setItem(phaseKey(roomId), phase);
  } catch {
    /* Restricted storage must not interrupt polling. */
  }
  return phase;
}
export function readPhase(roomId, storage = localStorage) {
  try {
    return storage.getItem(phaseKey(roomId));
  } catch {
    return null;
  }
}
export function observePhase(data, storage = localStorage, previous = null) {
  const room = data.room;
  const known = readPhase(room.id, storage) || previous;
  let phase = "preparing";
  if (room.status === "open") phase = "voting";
  else if (room.status === "closed") {
    // The API consolidates user_votes only on closing.
    const counted = room.candidates.some((c) => Number(c.user_votes) > 0);
    if (known === "voting" || known === "results" || counted) phase = "results";
  }
  return savePhase(room.id, phase, storage);
}
export function projectionData(data, phase) {
  const showResults = data.room.status === "closed" && phase === "results";
  const limit = Math.max(
    1,
    Math.floor(Number(data.configs?.votes?.items?.num_candidates?.value) || 1),
  );
  const candidates = data.room.candidates.map((c) => ({
    id: c.id,
    name: c.name,
    sequence: Number(c.sequence) || 0,
    ...(showResults ? { total: Math.max(0, Number(c.total_votes) || 0) } : {}),
  }));
  candidates.sort(
    (a, b) =>
      (showResults ? b.total - a.total : 0) ||
      a.sequence - b.sequence ||
      a.id - b.id,
  );
  let position = 0;
  let lastTotal;
  if (showResults)
    for (const candidate of candidates) {
      if (candidate.total !== lastTotal) position++;
      candidate.position = position;
      lastTotal = candidate.total;
    }
  const voters = data.room.devices
    .filter((d) => d.status !== "disapproved")
    .flatMap((device) =>
      (device.users || []).map((user) => {
        const approved = device.status === "approved";
        const count = Math.min(
          limit,
          Math.max(0, Number(user.votes_count) || 0),
        );
        return {
          id: user.id,
          name: user.name,
          approved,
          count,
          limit,
          percent: approved ? Math.round((count / limit) * 100) : 0,
          complete: approved && count >= limit,
        };
      }),
    )
    .sort((a, b) => a.id - b.id);
  return { candidates, voters, showResults };
}
export function validSnapshot(data) {
  return Boolean(
    data?.room?.id &&
    ["open", "closed"].includes(data.room.status) &&
    (data.room.is_active === true || data.room.is_active === 1) &&
    Array.isArray(data.room.candidates) &&
    Array.isArray(data.room.devices),
  );
}
