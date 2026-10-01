// Keep object identities when a live query returns an unchanged record.
export function sameRecord(left, right) {
  if (left === right) return true;
  if (!left || !right) return false;
  if (typeof left !== "object" || typeof right !== "object") return false;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && sameRecord(left[key], right[key]),
    )
  );
}

export function reconcileRecords(previous, incoming) {
  const byId = new Map(previous.map((record) => [record.id, record]));
  const next = incoming.map((record) => {
    const existing = byId.get(record.id);
    return sameRecord(existing, record) ? existing : record;
  });
  return next.length === previous.length &&
    next.every((record, i) => record === previous[i])
    ? previous
    : next;
}

export function changedRecords(previous, incoming) {
  const byId = new Map(previous.map((record) => [record.id, record]));
  return incoming.filter((record) => !sameRecord(byId.get(record.id), record));
}
