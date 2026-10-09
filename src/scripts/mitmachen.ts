/** Parallax in den Spalten: eine Variable, rAF + IO, nur transform. */
export {};

const section = document.querySelector<HTMLElement>("[data-mitmachen]");
if (section && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let scheduled = false;
  let near = false;
  let last = "";

  const update = () => {
    scheduled = false;
    if (!near) return;
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const mid = r.top + r.height * 0.55;
    const y = ((mid - vh * 0.5) / vh) * 10;
    const val = `${y.toFixed(2)}%`;
    if (val !== last) {
      section.style.setProperty("--para-y", val);
      last = val;
    }
  };

  const onScroll = () => {
    if (scheduled || !near) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  new IntersectionObserver(
    (entries) => {
      near = entries[0].isIntersecting;
      if (near) onScroll();
      else {
        last = "";
        section.style.removeProperty("--para-y");
      }
    },
    { rootMargin: "35% 0px" },
  ).observe(section);

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
