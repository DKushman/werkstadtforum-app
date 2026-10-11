/** Footer freigeben und den Inhalt auf Desktop leicht nachziehen. Mobil: statisch, ohne Scroll-JS. */
export {};

const footer = document.querySelector<HTMLElement>("[data-footer]");
const sheet = document.querySelector<HTMLElement>(".page-sheet");

if (footer && sheet) {
  const desktop = matchMedia("(min-width: 720px)");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const lift = 72;
  let queued = false;
  let open = false;
  let shift = -1;
  let listening = false;

  const update = () => {
    queued = false;
    if (!desktop.matches) return;

    const vh = window.innerHeight;
    const bottom = sheet.getBoundingClientRect().bottom;
    const revealed = vh - bottom;
    const nextOpen = revealed >= vh * 0.08;

    if (nextOpen !== open) {
      open = nextOpen;
      footer.inert = !nextOpen;
      footer.classList.toggle("is-revealed", nextOpen);
    }

    if (reduceMotion.matches) {
      if (shift !== 0) {
        shift = 0;
        footer.style.removeProperty("--footer-shift");
      }
      return;
    }

    const travel = parseFloat(getComputedStyle(sheet).marginBottom) || footer.offsetHeight || vh;
    const progress = Math.min(Math.max(revealed / travel, 0), 1);
    const next = Math.round((1 - progress) * lift * 2) / 2;
    if (next === shift) return;
    shift = next;
    footer.style.setProperty("--footer-shift", `${next}px`);
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  const teardownDesktop = () => {
    if (!listening) return;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    listening = false;
  };

  const setup = () => {
    teardownDesktop();
    footer.style.removeProperty("--footer-shift");
    shift = -1;
    open = false;

    if (desktop.matches) {
      footer.inert = true;
      footer.classList.remove("is-revealed");
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      listening = true;
      update();
      return;
    }

    footer.inert = false;
    footer.classList.remove("is-revealed");
  };

  setup();
  desktop.addEventListener("change", setup);
  reduceMotion.addEventListener("change", update);
}
