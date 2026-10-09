/**
 * Verbindungslinie Karte 1 → 2 → 3 → Forum-Headline.
 * Mobil: unten/oben andocken. Desktop: seitlich an den Karten (wie zuvor).
 */

type Pt = { x: number; y: number };

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width: 640px)");

const root = document.getElementById("hero-follow");
const svg = root?.querySelector<SVGSVGElement>(".journey-line");

const GAP_MOBILE = 10;
const GAP_DESKTOP = 14;
const ARROW = 11;

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

function onCard(card: HTMLElement, dx: number, dy: number): Pt {
  const { x, y } = offsetIn(card, root!);
  const cx = x + card.offsetWidth / 2;
  const cy = y + card.offsetHeight / 2;
  const deg = parseFloat(getComputedStyle(card).getPropertyValue("--card-tilt")) || 0;
  const a = (deg * Math.PI) / 180;
  return {
    x: cx + dx * Math.cos(a) - dy * Math.sin(a),
    y: cy + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

const f = (n: number) => n.toFixed(1);

if (root && svg) {
  const segs = [...svg.querySelectorAll<SVGPathElement>(".journey-line__seg")];
  const dots = [...svg.querySelectorAll<SVGCircleElement>(".journey-line__dot")];
  const arrow = svg.querySelector<SVGPathElement>(".journey-line__arrow")!;
  const cards = [...root.querySelectorAll<HTMLElement>(".process-card")];
  const title = root.querySelector<HTMLElement>(".forum__title");

  let lengths: number[] = [];
  let startY = 0;
  let endY = 1;
  let ready = false;
  let queued = false;
  let dotMode: "mobile" | "desktop" = "desktop";

  const layout = () => {
    ready = false;
    if (cards.length < 3 || !title) return;

    const [c1, c2, c3] = cards;
    const w1 = c1.offsetWidth / 2;
    const w2 = c2.offsetWidth / 2;
    const w3 = c3.offsetWidth / 2;
    const h3 = c3.offsetHeight / 2;

    const t = offsetIn(title, root);
    const tip: Pt = { x: t.x + title.offsetWidth / 2, y: t.y - 16 };

    if (mobile.matches) {
      dotMode = "mobile";
      const h1 = c1.offsetHeight / 2;
      const h2 = c2.offsetHeight / 2;
      const edge = 0.12;

      const p1 = onCard(c1, w1 * edge, h1 + GAP_MOBILE);
      const p2in = onCard(c2, -w2 * edge, -(h2 + GAP_MOBILE));
      const p2out = onCard(c2, -w2 * edge, h2 + GAP_MOBILE);
      const p3in = onCard(c3, w3 * edge, -(h3 + GAP_MOBILE));
      const p4 = onCard(c3, 0, h3 + GAP_MOBILE);

      const sway1 = Math.max(36, Math.abs(p2in.x - p1.x) * 0.55);
      const sway2 = Math.max(36, Math.abs(p3in.x - p2out.x) * 0.55);
      const k3 = Math.max(48, (tip.y - p4.y) * 0.45);
      const midY = (a: number, b: number) => a + (b - a) * 0.48;

      segs[0].setAttribute(
        "d",
        `M${f(p1.x)} ${f(p1.y)} C ${f(p1.x + sway1)} ${f(midY(p1.y, p2in.y))}, ${f(p2in.x - sway1)} ${f(midY(p1.y, p2in.y))}, ${f(p2in.x)} ${f(p2in.y)}`,
      );
      segs[1].setAttribute(
        "d",
        `M${f(p2out.x)} ${f(p2out.y)} C ${f(p2out.x - sway2)} ${f(midY(p2out.y, p3in.y))}, ${f(p3in.x + sway2)} ${f(midY(p2out.y, p3in.y))}, ${f(p3in.x)} ${f(p3in.y)}`,
      );
      segs[2].setAttribute(
        "d",
        `M${f(p4.x)} ${f(p4.y)} C ${f(p4.x)} ${f(p4.y + k3)} ${f(tip.x)} ${f(tip.y - k3)} ${f(tip.x)} ${f(tip.y)}`,
      );

      [p1, p2in, p2out, p3in, p4].forEach((p, i) => {
        dots[i].style.display = "";
        dots[i].setAttribute("cx", f(p.x));
        dots[i].setAttribute("cy", f(p.y));
      });

      startY = p1.y;
    } else {
      dotMode = "desktop";
      const p1 = onCard(c1, w1 + GAP_DESKTOP, 0);
      const p2 = onCard(c2, -(w2 + GAP_DESKTOP), 0);
      const p3 = onCard(c3, w3 + GAP_DESKTOP, 0);
      const p4 = onCard(c3, 0, h3 + GAP_DESKTOP);

      const k1 = Math.max(90, Math.abs(p2.y - p1.y) * 0.55);
      const k2 = Math.max(90, Math.abs(p3.y - p2.y) * 0.55);
      const k3 = Math.max(40, (tip.y - p4.y) * 0.5);

      segs[0].setAttribute(
        "d",
        `M${f(p1.x)} ${f(p1.y)}C${f(p1.x + k1)} ${f(p1.y)} ${f(p2.x - k1)} ${f(p2.y)} ${f(p2.x)} ${f(p2.y)}`,
      );
      segs[1].setAttribute(
        "d",
        `M${f(p2.x)} ${f(p2.y)}C${f(p2.x - k2)} ${f(p2.y)} ${f(p3.x + k2)} ${f(p3.y)} ${f(p3.x)} ${f(p3.y)}`,
      );
      segs[2].setAttribute(
        "d",
        `M${f(p4.x)} ${f(p4.y)}C${f(p4.x)} ${f(p4.y + k3)} ${f(tip.x)} ${f(tip.y - k3)} ${f(tip.x)} ${f(tip.y)}`,
      );

      [p1, p2, p3, p4].forEach((p, i) => {
        dots[i].style.display = "";
        dots[i].setAttribute("cx", f(p.x));
        dots[i].setAttribute("cy", f(p.y));
      });
      dots[4].style.display = "none";

      startY = p1.y;
    }

    arrow.setAttribute(
      "d",
      `M${f(tip.x - ARROW)} ${f(tip.y - ARROW)}L${f(tip.x)} ${f(tip.y)}L${f(tip.x + ARROW)} ${f(tip.y - ARROW)}`,
    );

    svg.setAttribute("viewBox", `0 0 ${root.offsetWidth} ${root.offsetHeight}`);
    lengths = segs.map((s) => s.getTotalLength());
    endY = tip.y;
    ready = true;
    update();
  };

  const update = () => {
    queued = false;
    if (!ready) return;

    let p = 1;
    if (!reduceMotion.matches) {
      const top = root.getBoundingClientRect().top;
      const line = innerHeight * 0.72;
      p = Math.min(Math.max((line - (top + startY)) / (endY - startY), 0), 1);
    }

    const total = lengths.reduce((a, b) => a + b, 0);
    let drawn = p * total;
    const local = lengths.map((len) => {
      const v = Math.min(Math.max(drawn / len, 0), 1);
      drawn -= len;
      return v;
    });

    segs.forEach((s, i) => (s.style.strokeDashoffset = String(1 - local[i])));
    dots[0].classList.toggle("is-on", p > 0);

    if (dotMode === "mobile") {
      dots[1].classList.toggle("is-on", local[0] >= 1);
      dots[2].classList.toggle("is-on", local[0] >= 1);
      dots[3].classList.toggle("is-on", local[1] >= 1);
      dots[4].classList.toggle("is-on", local[1] >= 1);
    } else {
      dots[1].classList.toggle("is-on", local[0] >= 1);
      dots[2].classList.toggle("is-on", local[1] >= 1);
      dots[3].classList.toggle("is-on", local[1] >= 1);
      dots[4].classList.remove("is-on");
    }

    arrow.classList.toggle("is-on", local[2] >= 0.995);
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  new ResizeObserver(layout).observe(root);
  mobile.addEventListener("change", layout);
  reduceMotion.addEventListener("change", update);
  addEventListener("scroll", onScroll, { passive: true });
  document.fonts?.ready.then(layout);
}
