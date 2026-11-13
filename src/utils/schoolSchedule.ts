// Weekly timetable from the 2026–27 S1 schedule. All times are Asia/Shanghai.
export const SCHOOL_TIMEZONE = "Asia/Shanghai";

const periods = [
  [480, 490], // Assembly 08:00–08:10
  [495, 535],
  [540, 580],
  [590, 630],
  [635, 675],
  [680, 720],
  [720, 760],
  [765, 805],
  [810, 860],
  [860, 900],
  [905, 945],
  [950, 990],
  [1000, 1060],
] as const;

const subjects = {
  assembly: "Class Assembly",
  economics: "AP Microeconomics",
  colloquy: "Colloquy",
  english: "Advanced English",
  physics: "AP Physics C: Mechanics",
  calculus: "Multivariable Calculus",
  chinese: "Chinese II",
  counseling: "College Counseling",
  pe: "PE",
};
type Subject = keyof typeof subjects;

// Each key is a period number; empty periods are free time.
const timetable: Record<string, Partial<Record<number, Subject>>> = {
  Mon: {
    2: "economics",
    3: "economics",
    4: "colloquy",
    5: "colloquy",
    7: "english",
    8: "english",
  },
  Tue: { 1: "physics", 2: "physics", 4: "calculus", 5: "calculus", 9: "pe" },
  Wed: { 1: "chinese", 2: "chinese", 7: "counseling", 8: "calculus" },
  Thu: {
    1: "colloquy",
    2: "colloquy",
    3: "english",
    4: "pe",
    5: "pe",
    7: "economics",
    8: "economics",
    9: "physics",
    10: "physics",
  },
  Fri: {
    3: "english",
    4: "english",
    5: "physics",
    8: "calculus",
    9: "calculus",
  },
};

const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: SCHOOL_TIMEZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function getSchoolStatus(now = new Date()) {
  const parts = clock.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value ?? "";
  const day = part("weekday");
  const minute = Number(part("hour")) * 60 + Number(part("minute"));
  const today = timetable[day];
  const localTime = `local time (shanghai): ${day} ${part("hour")}:${part("minute")}`;
  const status = (title: string, detail: string) => ({
    title,
    detail,
    localTime,
  });

  if (!today) return status("weekend :3", "no classes today!");

  const lastClassEnd = Math.max(
    ...Object.keys(today).map(period => periods[Number(period)][1]),
  );
  if (day === "Fri" && minute >= lastClassEnd) {
    return status("its weekend!!", "");
  }

  for (const [period, title] of [
    [6, "lunch break"],
    [11, "flex period"],
    [12, "dinner break"],
  ] as const) {
    const [start, end] = periods[period];
    if (minute >= start && minute < end) {
      return status(title, `${formatTime(start)}–${formatTime(end)}`);
    }
  }

  const classes = [{ start: 480, end: 490, title: subjects.assembly }];
  for (const [period, subject] of Object.entries(today)) {
    if (!subject) continue;
    const [start, end] = periods[Number(period)];
    classes.push({ start, end, title: subjects[subject] });
  }
  const current = classes.find(
    (item) => minute >= item.start && minute < item.end,
  );
  if (current) {
    return status(
      current.title,
      `${formatTime(current.start)}–${formatTime(current.end)}`,
    );
  }
  const next = classes.find((item) => item.start > minute);
  if (!next) return status("done with classes :3", "");
  const detail = `next: ${next.title} at ${formatTime(next.start)}`;
  if (minute < 480) return status("before school :3", detail);
  const inPeriod = periods.some(
    ([start, end], index) => index !== 6 && minute >= start && minute < end,
  );
  return status(inPeriod ? "free period :3" : "break time :3", detail);
}
