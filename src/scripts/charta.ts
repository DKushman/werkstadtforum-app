/**
 * Charta: Count-up (IO). Desktop: gemeinsamer Lift 1:1 zum Scrollen (rAF).
 */
export {};

const section = document.getElementById("charta");
const flow = section?.querySelector<HTMLElement>(".charta__flow");
const runway = section?.querySelector<HTMLElement>(".charta__runway");

if (section) {
  const values = [...section.querySelectorAll<HTMLElement>(".charta__value")];
  const desktopMq = matchMedia("(min-width: 641px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const formatNum = (n: number, locale: boolean) =>
    locale ? n.toLocaleString("de-DE") : String(n);

  const runCount = (el: HTMLElement) => {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";
    const target = Number(el.dataset.value);
    const suffix = el.dataset.suffix ?? "";
    const useLocale = el.dataset.locale === "true";
    if (reduced) {
      el.textContent = `${formatNum(target, useLocale)}${suffix}`;
      return;
    }
    const t0 = performance.now();
    const dur = 1100;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = `${formatNum(Math.round(target * eased), useLocale)}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const countIo = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          runCount(e.target as HTMLElement);
          countIo.unobserve(e.target);
        }
      }
    },
    { threshold: 0.35 },
  );
  values.forEach((el) => countIo.observe(el));

  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const smooth = (t: number) => {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
  };

  let near = false;
  let rafId = 0;
  let headShow = 0;
  let liftShow = 0;

  const headTargets = () => {
    if (!flow || !runway) return { head: 0, lift: 0 };
    const vh = window.innerHeight;
    const runwayH = runway.offsetHeight;
    const flowTop = flow.getBoundingClientRect().top;
    const scrolled = Math.max(0, runwayH - flowTop);
    const travel = Math.max(1, flow.offsetHeight - vh * 0.35);
    const p = clamp01(scrolled / travel);
    const firstCardTop = flowTop + runwayH;
    const cardNear = clamp01((vh * 0.56 - firstCardTop) / (vh * 0.38));
    const stackLift = desktopMq.matches ? clamp01((p - 0.08) / 0.92) : clamp01(p * 1.05);
    const head = smooth(cardNear * 0.45 + stackLift * 0.38);
    const lift = desktopMq.matches ? stackLift * vh * 0.18 : 0;
    return { head, lift };
  };

  const stopLoop = () => {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const resetMotion = () => {
    stopLoop();
    headShow = 0;
    liftShow = 0;
    section.style.removeProperty("--head-p");
    section.style.removeProperty("--lift-y");
  };

  const tick = () => {
    rafId = 0;
    if (!near || reduced || !flow || !runway) return;

    const { head, lift } = headTargets();
    const blend = 0.12;
    headShow += (head - headShow) * blend;
    liftShow += (lift - liftShow) * blend;

    section.style.setProperty("--head-p", headShow.toFixed(4));
    if (desktopMq.matches) {
      section.style.setProperty("--lift-y", `${liftShow.toFixed(1)}px`);
    } else {
      section.style.removeProperty("--lift-y");
    }

    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (rafId || !near || reduced) return;
    rafId = requestAnimationFrame(tick);
  };

  new IntersectionObserver(
    (entries) => {
      near = entries[0].isIntersecting;
      if (!near) {
        stopLoop();
        return;
      }
      if (reduced) resetMotion();
      else startLoop();
    },
    { rootMargin: "50% 0px" },
  ).observe(section);

  if (reduced) resetMotion();
  else startLoop();

  window.addEventListener("scroll", startLoop, { passive: true });
  window.addEventListener("resize", startLoop, { passive: true });
  desktopMq.addEventListener("change", () => {
    if (reduced) resetMotion();
    else startLoop();
  });
}
