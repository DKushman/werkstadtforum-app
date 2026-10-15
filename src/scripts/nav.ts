/** Burger-Menü: Panel von links (Bogen federt per CSS), Fokus & Scroll-Lock. */
export {};

const drawer = document.querySelector<HTMLElement>("[data-nav-drawer]");
const panelWrap = drawer?.querySelector<HTMLElement>(".nav__panel-wrap");
const closeBtn = drawer?.querySelector<HTMLButtonElement>(".nav__close");
const backdrop = drawer?.querySelector<HTMLElement>(".nav__drawer-backdrop");
const burgers = [...document.querySelectorAll<HTMLButtonElement>(".nav__burger")];

const CLOSE_MS = 520;
let closing = false;

if (drawer && closeBtn && panelWrap) {
  let lastTrigger: HTMLButtonElement | null = null;

  const finishClose = () => {
    closing = false;
    drawer.classList.remove("is-closing");
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("inert", "");
    document.documentElement.classList.remove("nav-open");
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
    closeBtn.focus();
  };

  const close = () => {
    if (!drawer.classList.contains("is-open") || closing) return;
    closing = true;
    drawer.classList.remove("is-open");
    drawer.classList.add("is-closing");
    for (const btn of burgers) btn.setAttribute("aria-expanded", "false");

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

  /* Wechsel auf eine andere Seite: Menü NICHT zuklappen – es bleibt offen stehen und wird vom
     Seitenwechsel (View Transition) überdeckt. Nur bei Ankern auf derselben Seite, neuem Tab
     o. Ä. klappt es normal zu. */
  drawer.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const otherPage =
        link.origin === location.origin &&
        link.pathname !== location.pathname &&
        !link.target &&
        !link.hasAttribute("download") &&
        !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
      if (!otherPage) close();
    });
  });

  /* Zurück-Taste (bfcache): Seite kommt mit offenem Menü zurück – sofort geschlossen herstellen */
  addEventListener("pageshow", (e) => {
    if (!e.persisted || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open", "is-closing");
    for (const btn of burgers) btn.setAttribute("aria-expanded", "false");
    lastTrigger = null;
    finishClose();
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
