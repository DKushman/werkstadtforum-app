/**
 * People: Kreis poppt, Linie wächst zum nächsten Punkt, Fakt rechts daneben.
 */
export {};

type Point = { x: number; y: number; clear?: number };

type CardPt = {
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

const root = document.querySelector<HTMLElement>("[data-people]");
if (root) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const trail = root.querySelector<HTMLElement>("[data-people-trail]");
  const stops = [...root.querySelectorAll<HTMLElement>(".stop")];
  const bridge = root.closest<HTMLElement>(".forum-bridge");
  const line = root.querySelector<SVGSVGElement>(".people__line");
  const legs = [...(line?.querySelectorAll<SVGPathElement>(".people__line-path") ?? [])];
  const mitmachenGrid = document.querySelector<HTMLElement>("#mitmachen .mitmachen__grid");
  const n = stops.length;

  type Disc = {
    x: number;
    y: number;
    r: number;
    left: number;
    top: number;
    bottom: number;
    clear: number;
    w: number;
  };

  const lineTo = (b: Point) => ` L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

  const arc = (
    a: Point,
    b: Point,
    arrive: "left" | "right" | "top",
  ) => {
    const gapX = b.x - a.x;
    const gapY = Math.max(strokeW, b.y - a.y);
    const drop = Math.min(gapY * 0.46, Math.max(gapY * 0.28, strokeW * (mobileLayout ? 0.65 : 0.8)));
    const lead = Math.min(Math.abs(gapX) * 0.42, Math.max(Math.abs(gapX) * 0.22, strokeW * (mobileLayout ? 0.55 : 0.7)));
    const c1x = a.x;
    const c1y = a.y + drop;
    let c2x = b.x;
    let c2y = b.y;
    if (arrive === "top") {
      c2y = b.y - drop;
    } else if (arrive === "left") {
      c2x = b.x - Math.sign(gapX || 1) * lead;
    } else {
      c2x = b.x + Math.sign(gapX || -1) * lead;
    }
    return ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  };

  const edge = (node: Disc) => Math.min(node.r * 0.07, strokeW * 0.1);

  let mobileLayout = false;
  let strokeW = 56;

  const smoothstep = (t: number) => {
    const x = clamp(t);
    return x * x * (3 - 2 * x);
  };

  /** Desktop-Tail: sanfte Bögen zu den Mitmachen-Karten (wie zuvor). */
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

  const dockSide = (node: Disc, side: "left" | "right" | "top"): Point => {
    const inset = Math.min(node.r * 0.35, strokeW * 0.48);
    if (side === "left") return { x: node.left + inset, y: node.y };
    if (side === "right") return { x: node.left + node.r * 2 - inset, y: node.y };
    return { x: node.x, y: node.top + inset };
  };

  const arriveSide = (from: Disc, to: Disc, hint: "left" | "top"): "left" | "right" | "top" => {
    if (hint === "top") return "top";
    const dx = to.x - from.x;
    if (dx > strokeW * 0.3) return "left";
    if (dx < -strokeW * 0.3) return "right";
    return "top";
  };

  const legThrough = (from: Disc, to: Disc | null, hint: "left" | "top") => {
    const outBottom = { x: from.x, y: from.bottom - edge(from) };
    let d = `M ${from.x.toFixed(1)} ${from.y.toFixed(1)}` + lineTo(outBottom);
    if (!to) return d;
    const side = arriveSide(from, to, hint);
    const entry = dockSide(to, side);
    d += arc(outBottom, entry, side);
    d += lineTo({ x: to.x, y: to.y });
    return d;
  };

  const dock = (node: Disc, side: "left" | "top"): Point => {
    const inset = Math.min(node.r * 0.42, strokeW * 0.55);
    if (side === "left") return { x: node.left + inset, y: node.y };
    return { x: node.x, y: node.top + inset };
  };

  const buildLegsMobile = (nodes: Disc[]) => {
    const [a, b, c, d] = nodes;
    const out = ["", "", "", ""];
    if (a) out[0] = b ? legThrough(a, b, "left") : legThrough(a, null, "left");
    if (b) out[1] = c ? legThrough(b, c, "top") : legThrough(b, null, "top");
    if (c) out[2] = d ? legThrough(c, d, "left") : legThrough(c, null, "left");
    if (d) out[3] = "";
    return out;
  };

  const buildLegsDesktop = (nodes: Disc[], tail: CardPt[]) => {
    const [a, b, c, d] = nodes;
    const out = ["", "", "", ""];
    const legFrom = (node: Disc, next: Point | null, arrive: "left" | "top") => {
      let dPath = `M ${node.x.toFixed(1)} ${node.y.toFixed(1)}` + lineTo({ x: node.x, y: node.bottom });
      if (next) dPath += arc({ x: node.x, y: node.bottom }, next, arrive);
      return dPath;
    };
    if (a) out[0] = legFrom(a, b ? dock(b, "left") : null, "left");
    if (b) out[1] = legFrom(b, c ? dock(c, "top") : null, "top");
    if (c) out[2] = legFrom(c, d ? dock(d, "left") : null, "left");
    if (d) {
      const exit = { x: d.x, y: d.bottom };
      out[3] =
        `M ${d.x.toFixed(1)} ${d.y.toFixed(1)}` + lineTo(exit) + buildDesktopTail(exit, tail);
    }
    return out;
  };

  const layoutLine = () => {
    if (!bridge || !line || !legs.length) return;
    const orbs = [...root.querySelectorAll<HTMLElement>(".stop__orb")];
    if (orbs.length < 1 || bridge.clientWidth < 8) return;

    const w = bridge.clientWidth;
    const h = bridge.clientHeight;
    line.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const frame = bridge.getBoundingClientRect();
    const nodes = [...root.querySelectorAll<HTMLElement>(".stop")].map((stop) => {
      const discEl = stop.querySelector<HTMLElement>(".stop__disc");
      const fact = stop.querySelector<HTMLElement>(".stop__fact");
      const orb = stop.querySelector<HTMLElement>(".stop__orb");
      if (!discEl || !orb) return null;
      const discBox = discEl.getBoundingClientRect();
      const factBox = fact?.getBoundingClientRect();
      const r = discBox.width / 2;
      const x = discBox.left - frame.left + r;
      const y = discBox.top - frame.top + discBox.height / 2;
      const top = y - r;
      const bottom = y + r;
      const left = x - r;
      const factBottom = factBox ? factBox.bottom - frame.top : bottom;
      return { x, y, r, left, top, bottom, clear: Math.max(bottom, factBottom), w: discBox.width };
    }).filter((node): node is Disc => node !== null);
    if (!nodes.length) return;

    mobileLayout = w < 640;
    strokeW = mobileLayout
      ? Math.max(26, Math.min(nodes[0].w * 0.48, 68))
      : Math.max(64, Math.min(nodes[0].w * 0.62, 240));

    const tailPts: CardPt[] = [...document.querySelectorAll<HTMLElement>(".mitmachen__tile")].map(
      (card) => {
        const box = card.getBoundingClientRect();
        return {
          x: box.left - frame.left + box.width / 2,
          y: box.top - frame.top + box.height / 2,
          left: box.left - frame.left,
          right: box.right - frame.left,
          top: box.top - frame.top,
          bottom: box.bottom - frame.top,
        };
      },
    );

    const pieces = mobileLayout ? buildLegsMobile(nodes) : buildLegsDesktop(nodes, tailPts);
    legs.forEach((leg, i) => {
      leg.setAttribute("d", pieces[i] || "");
      leg.setAttribute("stroke-width", String(strokeW));
    });
  };

  let layoutQueued = false;
  const scheduleLayout = () => {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(() => {
      layoutQueued = false;
      layoutLine();
      updateProgress();
    });
  };

  const revealStop = (index: number) => {
    const stop = stops[index];
    if (!stop || stop.classList.contains("is-on")) return;
    stop.classList.add("is-on");
  };

  const scrollProgress = (span: number, startRatio = 0.64) => {
    const first = stops[0]?.querySelector<HTMLElement>(".stop__orb") ?? stops[0];
    if (!first) return 0;
    const box = first.getBoundingClientRect();
    const anchor = box.top + box.height * 0.42;
    const start = window.innerHeight * startRatio;
    return clamp((start - anchor) / Math.max(1, span));
  };

  const lastLegDraw = (lineFrom: number, lineP: number) => {
    if (lineP < lineFrom) return 0;
    const scrollP = clamp((lineP - lineFrom) / Math.max(0.001, 1 - lineFrom));
    if (!mitmachenGrid) return smoothstep(scrollP);

    const vh = window.innerHeight;
    const gridBox = mitmachenGrid.getBoundingClientRect();
    const gridP = clamp((vh * 0.84 - gridBox.top) / Math.max(1, gridBox.height + vh * 0.42));
    return smoothstep(Math.max(scrollP, gridP));
  };

  const updateProgress = () => {
    if (reduced) return;
    const p = scrollProgress(trail?.offsetHeight ?? 1);
    const lineP = scrollProgress((trail?.offsetHeight ?? 1) * 1.55, 0.78);
    const step = 1 / (n + 1);
    const lastLineFrom = (n - 1 + 0.28) * step;

    for (let i = 0; i < n; i++) {
      const popAt = (i + 0.12) * step;
      const lineFrom = (i + 0.28) * step;
      const lineTo = i === n - 1 ? 1 : (i + 1) * step;
      if (p >= popAt) revealStop(i);
      const local =
        i === n - 1 && !mobileLayout
          ? lastLegDraw(lastLineFrom, lineP)
          : clamp((lineP - lineFrom) / Math.max(0.001, lineTo - lineFrom));
      legs[i]?.style.setProperty("--draw", (1 - local).toFixed(4));
    }
  };

  layoutLine();
  if (bridge) new ResizeObserver(scheduleLayout).observe(bridge);
  const stopsList = root.querySelector(".stops");
  if (stopsList) new ResizeObserver(scheduleLayout).observe(stopsList);
  if (mitmachenGrid) new ResizeObserver(scheduleLayout).observe(mitmachenGrid);
  document.fonts?.ready.then(scheduleLayout);
  requestAnimationFrame(scheduleLayout);

  if (reduced) {
    stops.forEach((_, i) => revealStop(i));
    for (const leg of legs) leg.style.setProperty("--draw", "0");
  } else {
    root.classList.add("is-armed");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateProgress();
      });
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleLayout, { passive: true });
  }
}

const sponsors = document.querySelector<HTMLElement>("[data-sponsors]");
const track = sponsors?.querySelector<HTMLElement>(".sponsors__track");
const marqueeSet = sponsors?.querySelector<HTMLElement>(
  ".sponsors__logos:not(.sponsors__logos--clone)",
);

const syncMarquee = () => {
  if (!track || !marqueeSet) return;
  const w = marqueeSet.getBoundingClientRect().width;
  if (w > 0) track.style.setProperty("--marquee-shift", `${w}px`);
};

if (sponsors && track && marqueeSet) {
  syncMarquee();
  window.addEventListener("resize", syncMarquee, { passive: true });
  for (const img of sponsors.querySelectorAll<HTMLImageElement>("img")) {
    if (img.complete) continue;
    img.addEventListener("load", syncMarquee, { once: true });
  }
  requestAnimationFrame(syncMarquee);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    sponsors.classList.add("is-seen", "is-inview");
  } else {
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          sponsors.classList.toggle("is-inview", entry.isIntersecting);
          if (entry.isIntersecting) {
            sponsors.classList.add("is-seen");
            syncMarquee();
          }
        }
      },
      { threshold: 0.15 },
    ).observe(sponsors);
  }
}
