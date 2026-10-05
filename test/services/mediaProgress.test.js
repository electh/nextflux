import test from "node:test";
import assert from "node:assert/strict";
import { createMediaProgressService } from "../../src/services/mediaProgressFactory.js";
import { createMediaProgressController } from "../../src/domain/articles/mediaProgressController.js";

function fixture(overrides = {}) {
  const records = new Map();
  const writes = [];
  const service = createMediaProgressService({
    read: (id) => records.get(id),
    write: (id, value) => records.set(id, value),
    fetch: async () => ({ media_progression: 42 }),
    update: async (id, position) => writes.push([id, position]),
    onError: () => {},
    ...overrides,
  });
  return { service, records, writes };
}

test("restores server progress, throttles writes, flushes on pause and resets completed audio", async () => {
  const { service, writes } = fixture();
  let time = 0;
  const controller = createMediaProgressController(
    { id: 1 },
    service,
    () => time,
  );
  const media = { currentTime: 0, duration: 100 };
  await controller.restore(media);
  assert.equal(media.currentTime, 42);
  controller.record(media, true);
  assert.deepEqual(writes, []);
  controller.interact();
  media.currentTime = 43.8;
  controller.record(media);
  assert.deepEqual(writes, []);
  time = 10000;
  media.currentTime = 53.1;
  controller.record(media);
  await service.flush(1);
  assert.deepEqual(writes, [[1, 53]]);
  media.currentTime = 55;
  controller.record(media, true);
  await service.flush(1);
  controller.record({ ...media, currentTime: 100, ended: true }, true, true);
  await service.flush(1);
  controller.dispose();
  assert.deepEqual(writes, [
    [1, 53],
    [1, 55],
    [1, 0],
  ]);
});

test("late restoration never interrupts playback or seeks a disposed player", async () => {
  let finish;
  const { service } = fixture({
    fetch: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  const controller = createMediaProgressController({ id: 1 }, service);
  const media = { currentTime: 5, duration: 100 };
  const restoration = controller.restore(media);
  controller.interact();
  finish({ media_progression: 42 });
  await restoration;
  assert.equal(media.currentTime, 5);
  const disposed = createMediaProgressController({ id: 2 }, service);
  const pending = disposed.restore(media);
  disposed.dispose();
  finish({ media_progression: 42 });
  await pending;
  assert.equal(media.currentTime, 5);
});

test("failed writes survive reopening and retry, including backward seeking to zero", async () => {
  let fail = true;
  const { service, records } = fixture({
    update: async () => {
      if (fail) throw new Error("offline");
    },
  });
  service.remember(1, 75);
  await service.flush(1);
  assert.deepEqual(records.get(1), { position: 75, pending: true });
  assert.equal(await service.load({ id: 1, media_progression: 20 }), 75);
  service.remember(1, 0);
  fail = false;
  await service.flush(1);
  assert.deepEqual(records.get(1), { position: 0, pending: false });
});

test("writes remain ordered across reopening while a request is in flight", async () => {
  const completions = [];
  const { service, records, writes } = fixture({
    update: (id, position) => {
      writes.push([id, position]);
      return new Promise((resolve) => completions.push(resolve));
    },
  });
  service.remember(1, 80);
  const first = service.flush(1);
  service.remember(1, 10);
  assert.equal(service.flush(1), first);
  completions.shift()();
  await Promise.resolve();
  assert.deepEqual(writes, [
    [1, 80],
    [1, 10],
  ]);
  completions.shift()();
  await first;
  assert.deepEqual(records.get(1), { position: 10, pending: false });
});

test("fresh server progress wins over acknowledged cache; offline uses cached progress", async () => {
  let offline = false;
  const { service, records } = fixture({
    fetch: async () => {
      if (offline) throw new Error("offline");
      return { media_progression: 25 };
    },
  });
  records.set(1, { position: 80, pending: false });
  assert.equal(await service.load({ id: 1 }), 25);
  offline = true;
  assert.equal(await service.load({ id: 1 }), 25);
  assert.equal(await service.load({ id: 2, media_progression: 13 }), 13);
});

test("completed progress restores at zero and unmount flushes the last observed time", async () => {
  const { service, writes } = fixture({
    fetch: async () => ({ media_progression: 100 }),
  });
  const controller = createMediaProgressController({ id: 1 }, service);
  const media = { currentTime: 0, duration: 100 };
  await controller.restore(media);
  assert.equal(media.currentTime, 0);
  controller.interact();
  media.currentTime = 3.5;
  controller.record(media);
  controller.dispose();
  await service.flush(1);
  assert.deepEqual(writes, [[1, 3]]);
});
