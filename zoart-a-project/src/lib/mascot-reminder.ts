export const FIRST_REMINDER_MS = 20_000;
export const REMINDER_INTERVAL_MS = 90_000;
export const REMINDER_VISIBLE_MS = 10_000;

type TimerClock = {
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
};

// Recursive timers preserve the interval from one appearance to the next.
export function startMascotReminders(clock: TimerClock, show: () => void, hide: () => void) {
  let showTimer: number;
  let hideTimer: number | undefined;
  function appear() {
    show();
    hideTimer = clock.setTimeout(hide, REMINDER_VISIBLE_MS);
    showTimer = clock.setTimeout(appear, REMINDER_INTERVAL_MS);
  }
  showTimer = clock.setTimeout(appear, FIRST_REMINDER_MS);
  return () => {
    clock.clearTimeout(showTimer);
    if (hideTimer !== undefined) clock.clearTimeout(hideTimer);
  };
}

export function reminderMessageIndex(count: number, previous: number | null, random = Math.random): number {
  if (count <= 1) return 0;
  if (previous === null) return Math.floor(random() * count);
  return (previous + 1 + Math.floor(random() * (count - 1))) % count;
}
