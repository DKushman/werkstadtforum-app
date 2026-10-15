/**
 * Brückenlinie FAQ → Mitmachen. Geometrie und Strichstärke sind der letzte
 * Abschnitt der People-Linie auf der Startseite (people.ts, buildDesktopTail):
 * unten aus der Scheibe heraus, Bogen zur rechten Karte, Schwung zur linken.
 * Nur ab 640 px – die Startseite hat auf Mobil ebenfalls keinen Tail.
 */
export {};

type Point = { x: number; y: number };
type CardPt = { x: number; y: number };

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const smoothstep = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const bridge = document.querySelector<HTMLElement>("[data-worum-bridge]");
const svg = bridge?.querySelector<SVGSVGElement>(".forum-bridge__line");
const path = svg?.querySelector<SVGPathElement>(".forum-bridge__path");
const disc = bridge?.querySelector<HTMLElement>("[data-bridge-disc]");
const grid = bridge?.querySelector<HTMLElement>("#mitmachen .mitmachen__grid");
const desktop = matchMedia("(min-width: 640px)");

if (bridge && svg && path && disc && grid) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lineStart = Number(bridge.dataset.lineStart) || 0.78;
  let strokeW = 64;

  const lineTo = (b: Point) => ` L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

  /** Desktop-Tail: sanfte Bögen zu den Mitmachen-Karten (identisch zur Startseite). */
  const buildDesktopTail = (from: Point, cards: CardPt[]) => {
    const tailPts: Point[] = [];
    if (!cards.length) {
      return lineTo({ x: from.x, y: from.y + strokeW * 1.35 });
    }

    const row = [...cards].sort((a, b) => a.x - b.x);
    const stacked = row.length < 2 || Math.abs(row[1].y - row[0].y) > 80;
    if (stacked) {
      for (const card of [...cards].sort((a, b) => a.y - b.y)) {
        tailPts.push({ x: card.x, y: card.y });
      }
    } else {
      const y = row.reduce((sum, card) => sum + card.y, 0) / row.length;
      tailPts.push({ x: row[row.length - 1].x, y });
      tailPts.push({ x: row[0].x, y });
    }

    let d = "";
    let cur = from;
    for (const pt of tailPts) {
      const midY = (cur.y + pt.y) / 2;
      d += ` C ${cur.x.toFixed(1)} ${midY.toFixed(1)}, ${pt.x.toFixed(1)} ${midY.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      cur = pt;
    }
    return d;
  };

  const layout = () => {
    if (!desktop.matches) {
      path.removeAttribute("d");
      return;
    }
    const w = bridge.clientWidth;
    const h = bridge.clientHeight;
    if (w < 8 || h < 8) return;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const frame = bridge.getBoundingClientRect();
    const box = disc.getBoundingClientRect();
    const r = box.width / 2;
    const x = box.left - frame.left + r;
    const y = box.top - frame.top + box.height / 2;
    const bottom = y + r;

    strokeW = Math.max(64, Math.min(box.width * 0.62, 240));

    const cards: CardPt[] = [...grid.querySelectorAll<HTMLElement>(".mitmachen__tile")].map((card) => {
      const b = card.getBoundingClientRect();
      return { x: b.left - frame.left + b.width / 2, y: b.top - frame.top + b.height / 2 };
    });

    const exit = { x, y: bottom };
    const d = `M ${x.toFixed(1)} ${y.toFixed(1)}` + lineTo(exit) + buildDesktopTail(exit, cards);
    path.setAttribute("d", d);
    path.setAttribute("stroke-width", String(strokeW));
  };

  /** Zeichnen beim Scrollen: ab der Scheibe, im Takt mit den Karten (wie lastLegDraw). */
  const updateDraw = () => {
    if (reduced) {
      path.style.setProperty("--draw", "0");
      return;
    }
    const vh = window.innerHeight;
    const box = disc.getBoundingClientRect();
    // Start, wenn der Ankerpunkt (42 % der Scheibe) die Linie bei data-line-start × vh
    // (Standard 0,78) unterschreitet; kleinere Werte lassen die Linie später beginnen.
    const anchor = box.top + box.height * 0.42;
    const discP = clamp((vh * lineStart - anchor) / Math.max(1, vh * 0.9));
    const gridBox = grid.getBoundingClientRect();
    const gridP = clamp((vh * 0.84 - gridBox.top) / Math.max(1, gridBox.height + vh * 0.42));
    path.style.setProperty("--draw", (1 - smoothstep(Math.max(discP, gridP))).toFixed(4));
  };

  let layoutQueued = false;
  const scheduleLayout = () => {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(() => {
      layoutQueued = false;
      layout();
      updateDraw();
    });
  };

  layout();
  new ResizeObserver(scheduleLayout).observe(bridge);
  new ResizeObserver(scheduleLayout).observe(grid);
  desktop.addEventListener("change", scheduleLayout);
  document.fonts?.ready.then(scheduleLayout);
  requestAnimationFrame(scheduleLayout);

  if (reduced) {
    path.style.setProperty("--draw", "0");
  } else {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateDraw();
      });
    };
    updateDraw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleLayout, { passive: true });
  }
}
