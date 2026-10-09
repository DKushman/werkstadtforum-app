# WerkStadtForum – Hero

Astro + TypeScript, gebaut mit Bun. Rein statisch, kein Framework-JS.

```bash
bun install
bun run dev      # Entwicklung
bun run build    # baut die Szene (scripts/build-scene.ts) und danach die Seite nach dist/
bun run preview  # gebaute Seite lokal ansehen
bun run check    # Typprüfung
```

## Aufbau

| Datei | Zweck |
| --- | --- |
| `src/components/Hero.astro` | Hero: Headline mit Wort-Rotation (reines CSS), Szene |
| `src/components/Nav.astro` | Navigation (Buttons ohne Ziel) |
| `src/components/Logo.astro` | **Platzhalter-Nachbau** des Logos – durch Original-SVG ersetzen |
| `src/styles/scene.css` | Alle Bewegungen der Illustration |
| `src/scripts/hero.ts` | Augen folgen dem Cursor + Pausieren per IntersectionObserver (~1 KB) |
| `scripts/build-scene.ts` | Zerlegt `src/assets/scene-original.svg` in Basis + animierte Ebenen → `src/assets/scene.json` |

## Illustration & Performance

- Die Original-SVG bleibt unverändert in `src/assets/scene-original.svg`. Nach einer Änderung `bun run scene` ausführen.
  Die Zuordnung der animierten Objekte läuft über die Element-Reihenfolge (Indizes in `build-scene.ts`) –
  wird die SVG neu exportiert, müssen die Indizes geprüft werden (das Skript bricht bei abweichender Elementanzahl ab).
- Jedes bewegte Objekt ist eine eigene kleine `<svg>`-Ebene. Dauer-Animationen nutzen nur `transform`
  und laufen damit komplett auf dem Compositor: im Leerlauf praktisch 0 ms Main-Thread-Arbeit.
- Elemente, die im Original über einem bewegten Objekt liegen (z. B. die Hand über dem Zirkel), werden als
  statische Abdeckung darübergelegt – die Zeichenreihenfolge bleibt exakt erhalten.
- Animationen pausieren, sobald der Hero nicht sichtbar ist; bei `prefers-reduced-motion` laufen nur noch die Augen.
- Touch-Geräte: keine Augenbewegung.

## Browser

Ziel: jeweils die letzten 2 Versionen von Chrome, Edge, Firefox, Safari, mindestens iOS Safari 15.
Die Bühne nutzt Container-Query-Einheiten (`cqw/cqh`, ab Safari 16); ältere Browser fallen auf volle Breite zurück.
