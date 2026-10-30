import assert from "node:assert/strict";
import { test } from "node:test";
import { reminderMessageIndex, startMascotReminders } from "./mascot-reminder.ts";

function fakeClock() {
  let now = 0, sequence = 0;
  const tasks = new Map();
  return {
    get now() { return now; },
    setTimeout(callback, delay) { const id = ++sequence; tasks.set(id, { at: now + delay, callback }); return id; },
    clearTimeout(id) { tasks.delete(id); },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...tasks].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        tasks.delete(next[0]); now = next[1].at; next[1].callback();
      }
      now = end;
    },
  };
}

test("first reminder waits 20 seconds, hides after 10, and repeats every 90", () => {
  const clock = fakeClock(), events = [];
  const stop = startMascotReminders(clock, () => events.push(["show", clock.now]), () => events.push(["hide", clock.now]));
  clock.advance(19999); assert.deepEqual(events, []);
  clock.advance(1); assert.deepEqual(events, [["show", 20000]]);
  clock.advance(10000); assert.deepEqual(events.at(-1), ["hide", 30000]);
  clock.advance(80000); assert.deepEqual(events.at(-1), ["show", 110000]);
  clock.advance(90000); assert.deepEqual(events.slice(-2), [["hide", 120000], ["show", 200000]]);
  stop();
});

test("leaving the page cancels both pending appearances and auto-dismissals", () => {
  for (const leaveAt of [0, 21000]) {
    const clock = fakeClock(), events = [];
    const stop = startMascotReminders(clock, () => events.push("show"), () => events.push("hide"));
    clock.advance(leaveAt); stop();
    const before = [...events]; clock.advance(300000);
    assert.deepEqual(events, before);
  }
});

test("randomized reminders use all three messages without consecutive repeats", () => {
  assert.deepEqual([0, 0.4, 0.99].map(value => reminderMessageIndex(3, null, () => value)), [0, 1, 2]);
  for (const previous of [0, 1, 2]) {
    const choices = [0, 0.99].map(value => reminderMessageIndex(3, previous, () => value));
    assert.equal(new Set(choices).size, 2);
    assert.ok(!choices.includes(previous));
  }
});
