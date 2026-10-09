/** Burger-Menü: Panel von links, Kurve animiert (Desktop), Fokus & Scroll-Lock. */
export {};

const drawer = document.querySelector<HTMLElement>("[data-nav-drawer]");
const panelWrap = drawer?.querySelector<HTMLElement>(".nav__panel-wrap");
const closeBtn = drawer?.querySelector<HTMLButtonElement>(".nav__close");
const backdrop = drawer?.querySelector<HTMLElement>(".nav__drawer-backdrop");
const curvePath = drawer?.querySelector<SVGPathElement>("#nav-curve-path");
const burgers = [...document.querySelectorAll<HTMLButtonElement>(".nav__burger")];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileMq = matchMedia("(max-width: 640px)");

const CURVE_OPEN_MS = 640;
const CURVE_CLOSE_MS = 520;
const CLOSE_MS = 520;

const EDGE_ROUND = 0.76;
const BULGE_ROUND = 1.09;
const HANDLE_Y = 0.26;

const curveEnabled = () => !mobileMq.matches;

/** t=0: Rechteck; t=1: saubere Bezier-Rundung (symmetrische Handles). */
const curveAt = (t: number) => {
  const p = Math.max(0, Math.min(1, t));
  if (p <= 0) return "M 0,0 L 1,0 L 1,1 L 0,1 Z";
  const edge = 1 + (EDGE_ROUND - 1) * p;
  const bulge = 1 + (BULGE_ROUND - 1) * p;
  const y1 = HANDLE_Y;
  const y2 = 1 - HANDLE_Y;
  return `M 0,0 L ${edge.toFixed(4)},0 C ${bulge.toFixed(4)},${y1} ${bulge.toFixed(4)},${y2} ${edge.toFixed(4)},1 L 0,1 Z`;
};

let curveRaf = 0;
let curveT = 0;
let closing = false;

const setCurve = (t: number) => {
  curveT = t;
  if (!curvePath) return;
  if (!curveEnabled()) {
    curvePath.setAttribute("d", "M 0,0 L 1,0 L 1,1 L 0,1 Z");
    curveT = 0;
    return;
  }
  curvePath.setAttribute("d", curveAt(t));
};

const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
const easeInCubic = (p: number) => p * p * p;

const animateCurve = (to: number, duration: number, easing: (p: number) => number) => {
  cancelAnimationFrame(curveRaf);
  if (!curveEnabled() || reducedMotion) {
    setCurve(to >= 0.5 ? 1 : 0);
    return;
  }
  if (!curvePath) return;

  const from = curveT;
  const target = to >= 0.5 ? 1 : 0;
  const t0 = performance.now();

  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    const eased = easing(p);
    const t = from + (target - from) * eased;
    setCurve(t);
    if (p < 1) curveRaf = requestAnimationFrame(step);
    else setCurve(target);
  };
  requestAnimationFrame(step);
};

setCurve(0);
mobileMq.addEventListener("change", () => setCurve(curveT));

if (drawer && closeBtn && panelWrap) {
  let lastTrigger: HTMLButtonElement | null = null;

  const finishClose = () => {
    closing = false;
    drawer.classList.remove("is-closing");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    document.documentElement.classList.remove("nav-open");
    setCurve(0);
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  };

  const open = (trigger: HTMLButtonElement) => {
    lastTrigger = trigger;
    closing = false;
    drawer.classList.remove("is-closing");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.removeAttribute("inert");
    document.documentElement.classList.add("nav-open");
    for (const btn of burgers) btn.setAttribute("aria-expanded", "true");
    setCurve(0);
    animateCurve(1, CURVE_OPEN_MS, easeOutCubic);
    closeBtn.focus();
  };

  const close = () => {
    if (!drawer.classList.contains("is-open") || closing) return;
    closing = true;
    drawer.classList.remove("is-open");
    drawer.classList.add("is-closing");
    for (const btn of burgers) btn.setAttribute("aria-expanded", "false");
    animateCurve(0, CURVE_CLOSE_MS, easeInCubic);

    const onEnd = (e: TransitionEvent) => {
      if (e.target !== panelWrap || e.propertyName !== "transform") return;
      panelWrap.removeEventListener("transitionend", onEnd);
      finishClose();
    };
    panelWrap.addEventListener("transitionend", onEnd);
    window.setTimeout(() => {
      if (closing) {
        panelWrap.removeEventListener("transitionend", onEnd);
        finishClose();
      }
    }, CLOSE_MS + 120);
  };

  for (const btn of burgers) {
    btn.setAttribute("aria-controls", drawer.id);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      if (drawer.classList.contains("is-open")) close();
      else open(btn);
    });
  }

  closeBtn.addEventListener("click", close);
  backdrop?.addEventListener("click", close);

  drawer.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    link.addEventListener("click", () => close());
  });

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        e.preventDefault();
        close();
      }
    },
    { passive: false },
  );
}
