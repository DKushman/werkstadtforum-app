import Lenis from "lenis";

const desktopHero = matchMedia("(min-width: 641px)");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

/** Scroll-Fortschritt (0–1) für Desktop-Hero in CSS (`--p`). */
function syncHeroPin() {
  if (!desktopHero.matches) return;
  const pin = document.querySelector<HTMLElement>("#hero-pin");
  if (!pin) return;
  const travel = pin.offsetHeight - window.innerHeight;
  const scrolled = Math.min(Math.max(-pin.getBoundingClientRect().top, 0), Math.max(travel, 0));
  pin.style.setProperty("--p", travel > 0 ? String(scrolled / travel) : "0");
}

if (!reduceMotion.matches && desktopHero.matches) {
  document.documentElement.classList.add("lenis", "lenis-smooth");

  const lenis = new Lenis({
    lerp: 0.055,
    smoothWheel: true,
    touchMultiplier: 1.15,
  });

  lenis.on("scroll", syncHeroPin);

  const frame = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  window.addEventListener("resize", syncHeroPin, { passive: true });
  syncHeroPin();
} else if (!reduceMotion.matches) {
  desktopHero.addEventListener("change", syncHeroPin);
} else {
  window.addEventListener("scroll", syncHeroPin, { passive: true });
  window.addEventListener("resize", syncHeroPin, { passive: true });
  syncHeroPin();
}
