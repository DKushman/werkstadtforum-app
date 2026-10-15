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
  let near = false;
  let travel = 0;

  /* Scroll-Arbeit nur am Seitenende: ein 0-px-Marker am Ende des Inhalts meldet,
     wann der Footer in Reichweite ist. Davor kein Layout-Lesen pro Frame. */
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sheet.append(sentinel);
  const nearObserver = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near) onScroll();
    },
    { rootMargin: "0px 0px 100% 0px" },
  );

  const measure = () => {
    travel = parseFloat(getComputedStyle(sheet).marginBottom) || footer.offsetHeight || window.innerHeight;
  };

  const update = () => {
    queued = false;
    if (!desktop.matches || !near) return;

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

    const progress = Math.min(Math.max(revealed / travel, 0), 1);
    const next = Math.round((1 - progress) * lift * 2) / 2;
    if (next === shift) return;
    shift = next;
    footer.style.setProperty("--footer-shift", `${next}px`);
  };

  function onScroll() {
    if (queued || !near) return;
    queued = true;
    requestAnimationFrame(update);
  }

  const onResize = () => {
    measure();
    onScroll();
  };

  const teardownDesktop = () => {
    if (!listening) return;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    nearObserver.disconnect();
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
      measure();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      nearObserver.observe(sentinel);
      listening = true;
      return;
    }

    /* Kein Scroll-Tracking: Footer liegt fixed dahinter, Inhalt scrollt darüber */
    footer.inert = false;
    footer.classList.remove("is-revealed");
  };

  setup();
  desktop.addEventListener("change", setup);
  reduceMotion.addEventListener("change", update);
}
