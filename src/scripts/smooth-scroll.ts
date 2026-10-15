import Lenis from "lenis";

const desktopHero = matchMedia("(min-width: 641px)");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const nativeScroll = document.documentElement.hasAttribute("data-native-scroll");

let aboutPinLive = false;

function bindAboutPinGate() {
  const pin = document.querySelector<HTMLElement>("#about-pin");
  if (!pin) return;
  aboutPinLive = true;
  const hero = pin.querySelector<HTMLElement>(".about-hero") ?? pin;
  const observer = new IntersectionObserver(
    ([entry]) => {
      aboutPinLive = entry.isIntersecting;
      if (!entry.isIntersecting) pin.classList.remove("is-live");
    },
    { rootMargin: "0px 0px 0px 0px", threshold: 0 },
  );
  observer.observe(hero);
}

/** Dokument-Oberkante über offsetTop – unabhängig von transforms (z. B. Seitenwechsel-Animation). */
function docTop(el: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/** Scroll-Fortschritt (0–1) für einen Pin-Block in CSS (`--p`). */
function syncPin(id: string, query: MediaQueryList) {
  if (!query.matches || reduceMotion.matches) return;
  const pin = document.querySelector<HTMLElement>(id);
  if (!pin) return;
  const travel = pin.offsetHeight - window.innerHeight;
  const scrolled = Math.min(Math.max(window.scrollY - docTop(pin), 0), Math.max(travel, 0));
  const p = travel > 0 ? scrolled / travel : 0;
  pin.style.setProperty("--p", String(p));

  if (id === "#hero-pin" && p > 0.12) {
    document.getElementById("hero-sheet")?.classList.add("is-revealed");
  }
}

/** About-Pin läuft auf allen Breiten; der Startseiten-Hero nur ab Desktop. */
function syncAboutPin() {
  if (reduceMotion.matches || !aboutPinLive) return;
  const pin = document.querySelector<HTMLElement>("#about-pin");
  if (!pin) return;
  // Der Hero klebt oben; die Fläche dahinter hat ihn nach einer Hero-Höhe komplett überdeckt.
  const hero = pin.querySelector<HTMLElement>(".about-hero");
  const travel = hero ? hero.offsetHeight : pin.offsetHeight - window.innerHeight;
  const scrolled = Math.min(Math.max(window.scrollY - docTop(pin), 0), Math.max(travel, 0));
  const p = travel > 0 ? scrolled / travel : 0;
  pin.style.setProperty("--p", String(p));
  // will-change nur, solange Figur und Text tatsächlich skaliert werden (p < 1)
  pin.classList.toggle("is-live", p < 1);
}

function syncPins() {
  syncPin("#hero-pin", desktopHero);
  syncAboutPin();
}

bindAboutPinGate();

if (!reduceMotion.matches && desktopHero.matches && !nativeScroll) {
  document.documentElement.classList.add("lenis", "lenis-smooth");

  const lenis = new Lenis({
    lerp: 0.055,
    smoothWheel: true,
    touchMultiplier: 1.15,
    // Anker-Links sanft über Lenis (CSS scroll-behavior ist unter Lenis abgeschaltet)
    anchors: true,
  });

  lenis.on("scroll", syncPins);

  const frame = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  window.addEventListener("resize", syncPins, { passive: true });
  syncPins();
} else if (!reduceMotion.matches) {
  window.addEventListener("scroll", syncPins, { passive: true });
  window.addEventListener("resize", syncPins, { passive: true });
  desktopHero.addEventListener("change", syncPins);
  syncPins();
} else {
  window.addEventListener("scroll", syncPins, { passive: true });
  window.addEventListener("resize", syncPins, { passive: true });
  syncPins();
}
