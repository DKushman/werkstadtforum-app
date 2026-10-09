/**
 * Gerade Linie ab der Heute-Pill. Sie wächst beim Scrollen nach unten,
 * die Karten erscheinen der Reihe nach daneben.
 */
import { dayNumber, longDateLabel, todayIso } from "../lib/timeline";

type Pt = { x: number; y: number };

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

const root = document.querySelector<HTMLElement>("#termine");
const svg = root?.querySelector<SVGSVGElement>(".upcoming-line");
const nowEl = root?.querySelector<HTMLElement>("[data-tl-today]");
const dotEl = root?.querySelector<HTMLElement>("[data-tl-dot]");

const f = (n: number) => n.toFixed(1);

function offsetIn(el: HTMLElement, ancestor: HTMLElement): Pt {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

if (root && svg && nowEl && dotEl) {
  const iso = todayIso();
  const today = dayNumber(iso);
  const time = root.querySelector<HTMLTimeElement>("[data-tl-today]");
  const todayLabel = root.querySelector("[data-tl-today-label]");
  if (time) time.dateTime = iso;
  if (todayLabel) todayLabel.textContent = longDateLabel(iso);

  const cards = [...root.querySelectorAll<HTMLElement>(".upcoming-card")];
  let nextSet = false;
  for (const card of cards) {
    const diff = dayNumber(card.dataset.date ?? iso) - today;
    card.classList.toggle("is-past", diff < 0);
    const isNext = !nextSet && diff >= 0;
    card.classList.toggle("is-next", isNext);
    if (isNext) nextSet = true;
  }

  const seg = svg.querySelector<SVGPathElement>(".upcoming-line__seg");
  const dots = [...svg.querySelectorAll<SVGCircleElement>(".upcoming-line__dot")];

  let startY = 0;
  let endY = 1;
  let cardY: number[] = [];
  let ready = false;
  let queued = false;

  const layout = () => {
    ready = false;
    if (!seg || dots.length !== cards.length || !cards.length) return;

    const dot = offsetIn(dotEl, root);
    const x = dot.x + dotEl.offsetWidth / 2;
    const y0 = dot.y + dotEl.offsetHeight / 2;
    const node = dotEl.offsetWidth / 2;
    cardY = cards.map((card) => {
      const box = offsetIn(card, root);
      return box.y + card.offsetHeight * 0.42;
    });
    const y1 = cardY[cardY.length - 1];

    seg.setAttribute("d", `M${f(x)} ${f(y0)}L${f(x)} ${f(y1)}`);
    dots.forEach((dot, i) => {
      dot.setAttribute("r", f(node));
      dot.setAttribute("cx", f(x));
      dot.setAttribute("cy", f(cardY[i]));
    });

    root.style.setProperty("--rail", `${Math.ceil(x + node + 28)}px`);
    svg.setAttribute("viewBox", `0 0 ${root.offsetWidth} ${root.offsetHeight}`);
    startY = y0;
    endY = y1;
    ready = true;
    update();
  };

  const update = () => {
    queued = false;
    if (!ready || !seg) return;

    let p = 1;
    if (!reduceMotion.matches) {
      const top = root.getBoundingClientRect().top;
      const span = Math.max(endY - startY, 1);
      p = Math.min(Math.max((innerHeight * 0.58 - (top + startY)) / span, 0), 1);
    }

    seg.style.strokeDashoffset = String(1 - p);
    const drawn = startY + (endY - startY) * p;
    cards.forEach((card, i) => {
      const on = reduceMotion.matches || drawn >= cardY[i] - 8;
      dots[i]?.classList.toggle("is-on", on);
      if (on) card.classList.add("is-inview");
    });
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  if (reduceMotion.matches) cards.forEach((card) => card.classList.add("is-inview"));

  new ResizeObserver(layout).observe(root);
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) cards.forEach((card) => card.classList.add("is-inview"));
    update();
  });
  addEventListener("scroll", onScroll, { passive: true });
  document.fonts?.ready.then(layout);
  layout();
}
