export {};

const section = document.querySelector<HTMLElement>(".charta-process");
const steps = section ? [...section.querySelectorAll<HTMLElement>(".charta-process__step")] : [];

if (section && steps.length) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;

  const setActive = (index: number, opts?: { scroll?: boolean; focus?: boolean }) => {
    const next = Math.max(0, Math.min(index, steps.length - 1));
    activeIndex = next;
    const denom = Math.max(steps.length - 1, 1);
    section.style.setProperty("--rail-p", String(next / denom));

    steps.forEach((step, i) => {
      const on = i === next;
      step.classList.toggle("is-active", on);
      step.classList.toggle("is-passed", i < next);
      step.setAttribute("aria-current", on ? "step" : "false");
      step.tabIndex = on ? 0 : -1;
    });

    if (opts?.scroll && !reduce.matches) {
      steps[next].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (opts?.focus) steps[next].focus({ preventScroll: true });
  };

  const markSeen = (step: HTMLElement) => step.classList.add("is-seen");

  if (reduce.matches) {
    steps.forEach(markSeen);
    setActive(steps.length - 1);
    section.classList.add("is-ready");
  } else {
    section.classList.add("is-ready");
    setActive(0);

    const inZone: HTMLElement[] = [];
    let zoneObserver: IntersectionObserver | undefined;

    const syncFromScroll = () => {
      const picked = inZone[inZone.length - 1];
      if (!picked) return;
      const idx = steps.indexOf(picked);
      if (idx >= 0 && idx !== activeIndex) setActive(idx);
    };

    const watchZone = () => {
      zoneObserver?.disconnect();
      inZone.length = 0;
      const top = Math.round(innerHeight * 0.22);
      const bottom = Math.round(innerHeight * 0.32);
      zoneObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const step = entry.target as HTMLElement;
            const idx = inZone.indexOf(step);
            if (entry.isIntersecting) {
              markSeen(step);
              if (idx < 0) inZone.push(step);
            } else if (idx >= 0) {
              inZone.splice(idx, 1);
            }
          }
          syncFromScroll();
        },
        { rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: 0.08 },
      );
      steps.forEach((step) => zoneObserver!.observe(step));
    };

    watchZone();
    let resizeFrame = 0;
    addEventListener(
      "resize",
      () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(watchZone);
      },
      { passive: true },
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markSeen(entry.target as HTMLElement);
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.12 },
    );
    steps.forEach((step) => revealObserver.observe(step));
  }

  steps.forEach((step, i) => {
    step.addEventListener("click", () => setActive(i, { scroll: true }));
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(i, { scroll: true });
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        setActive(i + 1, { scroll: true, focus: true });
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(i - 1, { scroll: true, focus: true });
      }
      if (event.key === "Home") {
        event.preventDefault();
        setActive(0, { scroll: true, focus: true });
      }
      if (event.key === "End") {
        event.preventDefault();
        setActive(steps.length - 1, { scroll: true, focus: true });
      }
    });
  });
}