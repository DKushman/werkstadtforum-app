const DAY_MS = 86_400_000;
const TZ = "Europe/Berlin";

/** "YYYY-MM-DD" → Tage seit Epoch (UTC, ohne Sommerzeit-Versatz). */
export const dayNumber = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
};

/** Heutiges Datum in Berlin als "YYYY-MM-DD". */
export const todayIso = (now = new Date()) =>
  now.toLocaleDateString("sv-SE", { timeZone: TZ });

const longDate = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** „6. Oktober 2026“ */
export const longDateLabel = (iso: string) => longDate.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
