/**
 * Hero: Augen folgen dem Cursor (nur Maus/Stift, nur innerhalb des Heros)
 * und Idle-Animationen pausieren, sobald der Hero aus dem Viewport ist.
 * Schreibt pro Frame nur die CSS-Eigenschaft `translate` der Pupillen.
 */

import "./journey-line";

type Pupil = {
  el: SVGGraphicsElement;
  /** Ruheposition (Mittelpunkt) in SVG-Einheiten */
  x: number;
  y: number;
  /** maximale Auslenkung in SVG-Einheiten */
  max: number;
  /** optional: Brillenglas, in dem die Pupille bleiben muss */
  socket?: { x: number; y: number; r: number };
};

const MAX: Record<string, number> = { a: 2.4, b: 3, c: 2.2, d: 4.5 };

// Brillengläser der Architektin (Mittelpunkt, erlaubter Radius für den Pupillenmittelpunkt)
const LENSES = [
  { x: 791.9, y: 89.5, r: 9.4 },
  { x: 829.65, y: 84.15, r: 9.4 },
];

/** Volle Auslenkung ab dieser Distanz (SVG-Einheiten) */
const REACH = 140;

const hero = document.querySelector<HTMLElement>("[data-hero]");
const svg = hero?.querySelector<SVGSVGElement>(".scene__base");

if (hero && svg) {
  // --- Animationen pausieren, wenn außerhalb des Viewports ---
  let inView = true;
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    hero.classList.toggle("is-offscreen", !inView);
  }).observe(hero);

  // --- Augen ---
  let pupils: Pupil[] | null = null;
  let inverse: DOMMatrix | null = null;
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;

  const collect = (): Pupil[] =>
    Object.entries(MAX).flatMap(([key, max]) =>
      Array.from(svg.querySelectorAll<SVGGraphicsElement>(`.eye--${key}`), (el) => {
        const b = el.getBBox();
        const x = b.x + b.width / 2;
        const y = b.y + b.height / 2;
        const socket = key === "d" ? LENSES.reduce((a, l) => (Math.hypot(l.x - x, l.y - y) < Math.hypot(a.x - x, a.y - y) ? l : a)) : undefined;
        return { el, x, y, max, socket };
      }),
    );

  const invalidate = () => (inverse = null);

  const render = () => {
    frame = 0;
    if (!pointer || !inView) return;
    pupils ??= collect();
    inverse ??= svg.getScreenCTM()?.inverse() ?? null;
    if (!inverse) return;

    const p = new DOMPoint(pointer.x, pointer.y).matrixTransform(inverse);

    for (const pupil of pupils) {
      const dx = p.x - pupil.x;
      const dy = p.y - pupil.y;
      const dist = Math.hypot(dx, dy) || 1;
      const k = (pupil.max * Math.min(1, dist / REACH)) / dist;
      let ox = dx * k;
      let oy = dy * k;

      if (pupil.socket) {
        // im Brillenglas halten
        const s = pupil.socket;
        const cx = pupil.x + ox - s.x;
        const cy = pupil.y + oy - s.y;
        const d = Math.hypot(cx, cy);
        if (d > s.r) {
          ox = s.x + (cx / d) * s.r - pupil.x;
          oy = s.y + (cy / d) * s.r - pupil.y;
        }
      }

      pupil.el.style.translate = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
    }
  };

  const reset = () => {
    pointer = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pupils?.forEach((p) => (p.el.style.translate = ""));
  };

  hero.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return; // Touch: keine Augenbewegung
      pointer = { x: e.clientX, y: e.clientY };
      frame ||= requestAnimationFrame(render);
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", reset, { passive: true });

  addEventListener("scroll", invalidate, { passive: true });
  addEventListener("resize", invalidate, { passive: true });
  // Intro-Animation verschiebt die Szene – danach Matrix neu berechnen
  svg.closest(".scene")?.addEventListener("animationend", invalidate);
}

const processCards = document.querySelectorAll<HTMLElement>(".process-card");

if (processCards.length) {
  const cardReveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-inview");
        cardReveal.unobserve(entry.target);
      }
    },
    { threshold: 0.38, rootMargin: "0px 0px -8% 0px" },
  );
  processCards.forEach((card) => cardReveal.observe(card));
}

/* Forum-Zähler: zählt beim Einblenden einmalig von 0 hoch (Endwert steht im HTML) */
const counters = document.querySelectorAll<HTMLElement>(".forum-card__num[data-count]");
if (counters.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const countUp = (el: HTMLElement) => {
    const target = Number(el.dataset.count) || 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = String(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterReveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        countUp(entry.target as HTMLElement);
        counterReveal.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => {
    el.textContent = "0";
    counterReveal.observe(el);
  });
}

