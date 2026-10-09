/**
 * „Wo und was wird gebaut?“
 * Desktop: Akkordeon (erster Ort offen, immer genau einer), Höhe = Karte.
 * Mobil: Aktiv nur durch Aufklappen oder Klick auf Karten-Punkt.
 */
const section = document.getElementById("orte");

if (section) {
  const desktop = matchMedia("(min-width: 641px)");
  const tiles = [...section.querySelectorAll<HTMLElement>(".place[data-ort]")];
  const details = tiles.map((t) => t.querySelector("details")!);
  let pinned = tiles[0]?.dataset.ort ?? "";

  const show = (id: string) => {
    if (id) section.dataset.active = id;
    else delete section.dataset.active;
  };

  const ortOf = (el: EventTarget | null) =>
    (el instanceof Element ? el.closest<HTMLElement>("[data-ort]") : null)?.dataset.ort ?? "";

  const setDesktopAccordion = (index: number) => {
    details.forEach((d, j) => {
      d.open = j === index;
    });
    pinned = tiles[index]?.dataset.ort ?? "";
    show(pinned);
  };

  const layout = () => {
    if (desktop.matches) setDesktopAccordion(0);
    else {
      details.forEach((d) => {
        d.open = false;
      });
      pinned = "";
      show("");
    }
  };
  layout();
  desktop.addEventListener("change", layout);

  section.addEventListener(
    "pointerover",
    (e) => {
      if (!desktop.matches || e.pointerType !== "mouse") return;
      const id = ortOf(e.target);
      if (id) show(id);
    },
    { passive: true },
  );

  section.addEventListener(
    "pointerout",
    (e) => {
      if (!desktop.matches || e.pointerType !== "mouse") return;
      const id = ortOf(e.target);
      if (id && ortOf(e.relatedTarget) !== id) show(pinned);
    },
    { passive: true },
  );

  section.addEventListener("focusin", (e) => {
    const id = ortOf(e.target);
    if (id) show(id);
  });

  section.addEventListener("click", (e) => {
    const spot = (e.target as Element).closest<HTMLElement>(".spot");
    if (desktop.matches) {
      if (!spot) return;
      e.preventDefault();
      const idx = tiles.findIndex((t) => t.dataset.ort === spot.dataset.ort);
      if (idx >= 0) setDesktopAccordion(idx);
    } else if (spot) {
      const idx = tiles.findIndex((t) => t.dataset.ort === spot.dataset.ort);
      if (idx >= 0) details[idx].open = true;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && desktop.matches) setDesktopAccordion(0);
  });

  details.forEach((el, i) => {
    el.addEventListener("toggle", () => {
      if (desktop.matches) {
        if (el.open) {
          details.forEach((d, j) => {
            if (j !== i) d.open = false;
          });
          pinned = tiles[i].dataset.ort ?? "";
          show(pinned);
        } else if (!details.some((d) => d.open)) {
          setDesktopAccordion(i);
        }
        return;
      }

      if (el.open) show(tiles[i].dataset.ort ?? "");
      else if (!details.some((d) => d.open)) show("");
    });
  });
}
