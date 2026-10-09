/**
 * Baut die Hero-Illustration aus der Original-SVG (src/assets/scene-original.svg).
 *
 * Performance-Konzept:
 *  - Alles Statische landet in einer Basis-SVG.
 *  - Jedes Objekt mit Dauer-Animation (Stifte, Münzen, Zirkel, Dampf, Wolken, Konfetti)
 *    wird zu einer eigenen, kleinen <svg>-Ebene, die absolut über der Basis liegt.
 *    Animiert wird nur translate/rotate/scale/transform dieser Ebenen -> läuft komplett
 *    auf dem Compositor (GPU), ohne Style-Recalc oder Repaint auf dem Main-Thread.
 *  - Liegen in der Original-SVG Elemente über einem animierten Objekt (z. B. die Hand
 *    über dem Zirkel), werden sie als statische "Abdeckung" darüber gelegt, damit die
 *    Zeichenreihenfolge exakt erhalten bleibt.
 *  - Die Pupillen bleiben in der Basis (werden nur bei Mausbewegung verschoben).
 *
 * Ausführen: bun run scene  ->  src/assets/scene.json
 */
import { optimize } from "svgo";
import { svgPathBbox } from "svg-path-bbox";

const SRC = new URL("../src/assets/scene-original.svg", import.meta.url);
const OUT = new URL("../src/assets/scene.json", import.meta.url);

const VB = { w: 950, h: 430 }; // unten beschnitten: Tischbeine liegen wie im Design außerhalb
const PAD = 2; // Rand um Ebenen (Strokes, Antialiasing)

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

type Box = { x: number; y: number; w: number; h: number };
type Item = {
  id: string;
  idx: number[];
  anim: "roll" | "wobble" | "hop" | "swing" | "steam" | "drift" | "float";
  /** Drehpunkt in SVG-Einheiten, Standard: Mitte */
  origin?: [number, number];
  /** CSS-Variablen; bekommt die Ebenen-Box (für die %-Umrechnung) */
  vars: (b: Box) => Record<string, string | number>;
};

/** SVG-Einheiten -> Prozent der eigenen Ebene (translate-% bezieht sich auf die eigene Box) */
const pctX = (v: number, b: Box) => `${round((v / b.w) * 100, 3)}%`;
const pctY = (v: number, b: Box) => `${round((v / b.h) * 100, 3)}%`;

// Pupillen (bleiben in der Basis, Klassen für src/scripts/hero.ts)
const EYES: Record<string, number[]> = {
  "eye eye--a": [354, 355], // Radfahrer
  "eye eye--b": [358, 359], // Blauer Typ mit Bauplan
  "eye eye--c": [293, 294], // Zylinder-Typ
  "eye eye--d": [253, 257], // Architektin
};

const CONFETTI = [462, 460, 468, 472, 474, 455, 477, 456, 466, 446, 454];
const CONFETTI_T = [3.4, 4.1, 3.7, 4.6, 3.9, 4.3, 3.5, 4.8, 3.8, 4.4, 3.6];
const CONFETTI_D = [-0.4, -2.1, -1.3, -3, -0.9, -2.6, -1.7, -0.2, -3.4, -1.1, -2.3];

const ITEMS: Item[] = [
  {
    id: "pencil-a",
    idx: range(27, 34),
    anim: "roll",
    origin: [384, 326],
    vars: (b) => ({ "--tx": pctX(-1, b), "--ty": pctY(2.2, b), "--r": "-1.2deg", "--t": "5.6s", "--d": "0s", "--pd": "0.75s" }),
  },
  {
    id: "pencil-b",
    idx: range(19, 26),
    anim: "roll",
    origin: [368, 358],
    vars: (b) => ({ "--tx": pctX(1.4, b), "--ty": pctY(-1.6, b), "--r": "1deg", "--t": "6.4s", "--d": "-2.4s", "--pd": "0.85s" }),
  },
  {
    id: "pen",
    idx: [35, 36, 37, 54, 55, 56, 66],
    anim: "wobble",
    origin: [640, 344],
    vars: () => ({ "--t": "4.6s", "--d": "-1.2s", "--pd": "0.95s" }),
  },
  ...[range(7, 14), range(38, 44), range(45, 47), range(48, 53)].map(
    (idx, i): Item => ({
      id: `coin-${i + 1}`,
      idx,
      anim: "hop",
      // Stapel (coin-1) liegt an der hinteren Tischkante -> kleinerer Hüpfer
      vars: (b) => ({ "--hop": pctY(i === 0 ? 2 : 3.5, b), "--t": "5.2s", "--d": `${[1.4, 2.8, 4.1, 5.3][i]}s`, "--pd": `${round(1 + i * 0.06)}s` }),
    }),
  ),
  { id: "compass", idx: [83, 84, 108, 114, 115], anim: "swing", origin: [633.3, 209.7], vars: () => ({}) },
  { id: "steam-l", idx: [375, 379, 381], anim: "steam", origin: [206, 197], vars: () => ({ "--d": "0s" }) },
  { id: "steam-r", idx: [380, 400, 401], anim: "steam", origin: [212, 197], vars: () => ({ "--d": "-1.2s" }) },
  ...[464, 458, 407, 470].map(
    (i, n): Item => ({
      id: `cloud-${n + 1}`,
      idx: [i],
      anim: "drift",
      vars: (b) => ({ "--dx": pctX(6, b), "--t": `${[11, 13, 10, 8][n]}s`, "--d": `${[-3, -7, -1, -4][n]}s` }),
    }),
  ),
  ...CONFETTI.map(
    (i, n): Item => ({
      id: `confetti-${n + 1}`,
      idx: [i],
      anim: "float",
      vars: (b) => ({ "--fy": pctY(-4, b), "--t": `${CONFETTI_T[n]}s`, "--d": `${CONFETTI_D[n]}s`, "--pd": `${round(0.55 + n * 0.05)}s` }),
    }),
  ),
];

// ---------------------------------------------------------------------------

const original = await Bun.file(SRC).text();
const elementRe = /<(path|rect)\b[^>]*\/>/g;
const elements = original.match(elementRe) ?? [];
if (elements.length !== 487) {
  throw new Error(`Unerwartete Elementanzahl ${elements.length} – Original-SVG geändert? Indizes prüfen.`);
}

const attr = (el: string, name: string) => el.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

const bboxes: Box[] = elements.map((el) => {
  let x1: number, y1: number, x2: number, y2: number;
  if (el.startsWith("<rect")) {
    x1 = +attr(el, "x")!;
    y1 = +attr(el, "y")!;
    x2 = x1 + +attr(el, "width")!;
    y2 = y1 + +attr(el, "height")!;
  } else {
    [x1, y1, x2, y2] = svgPathBbox(attr(el, "d")!);
  }
  const s = attr(el, "stroke") ? 1 : 0;
  return { x: x1 - s, y: y1 - s, w: x2 - x1 + 2 * s, h: y2 - y1 + 2 * s };
});

const union = (boxes: Box[], pad = 0): Box => {
  const x1 = Math.min(...boxes.map((b) => b.x)) - pad;
  const y1 = Math.min(...boxes.map((b) => b.y)) - pad;
  const x2 = Math.max(...boxes.map((b) => b.x + b.w)) + pad;
  const y2 = Math.max(...boxes.map((b) => b.y + b.h)) + pad;
  const fx = Math.floor(x1);
  const fy = Math.floor(y1);
  return { x: fx, y: fy, w: Math.ceil(x2) - fx, h: Math.ceil(y2) - fy };
};

const intersects = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const eyeOf = new Map<number, string>();
for (const [cls, idxs] of Object.entries(EYES)) idxs.forEach((i) => eyeOf.set(i, cls));

const animated = new Set(ITEMS.flatMap((it) => it.idx));
if (animated.size !== ITEMS.reduce((n, it) => n + it.idx.length, 0)) throw new Error("Element doppelt zugeordnet");

const svgo = (svg: string) =>
  optimize(svg, {
    multipass: true,
    floatPrecision: 2,
    plugins: [
      {
        name: "preset-default",
        params: { overrides: { cleanupIds: false, inlineStyles: false, minifyStyles: false, mergePaths: { force: false } } },
      },
      "removeDimensions",
    ],
  }).data;

const withClass = (i: number) => {
  const cls = eyeOf.get(i);
  return cls ? elements[i].replace(/^<(path|rect)\b/, `<$1 class="${cls}"`) : elements[i];
};

const wrap = (b: Box, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" fill="none">${body}</svg>`;

/** Ebene als absolut positionierte <svg> in % der Bühne */
const place = (b: Box) => ({
  left: `${round((b.x / VB.w) * 100, 4)}%`,
  top: `${round((b.y / VB.h) * 100, 4)}%`,
  width: `${round((b.w / VB.w) * 100, 4)}%`,
  height: `${round((b.h / VB.h) * 100, 4)}%`,
});

const toStyle = (o: Record<string, string | number>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

const layerSvg = (svg: string, cls: string, style: string) =>
  svg.replace(/^<svg\b/, `<svg class="${cls}" style="${style}" aria-hidden="true" focusable="false"`);

// --- Basis ---
const baseBody = elements.map((_, i) => (animated.has(i) ? "" : withClass(i))).join("");
const base = svgo(wrap({ x: 0, y: 0, w: VB.w, h: VB.h }, baseBody)).replace(
  /^<svg\b[^>]*>/,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB.w} ${VB.h}" fill="none" class="scene__base" role="img" aria-labelledby="scene-title"><title id="scene-title">Vier Menschen planen gemeinsam an einem Tisch mit Bauplänen, Stiften und Münzen</title>`,
);

// --- Ebenen ---
// Alle animierten Elemente plus die statischen Elemente, die in der Original-SVG über einem
// animierten Objekt liegen, werden in Original-Reihenfolge durchlaufen. Aufeinanderfolgende
// Elemente desselben Objekts bilden eine animierte Ebene, statische Elemente dazwischen eine
// Abdeckungs-Ebene. So bleibt die Zeichenreihenfolge auch bei verschachtelten Objekten exakt.
const owner = new Map<number, Item>();
ITEMS.forEach((it) => it.idx.forEach((i) => owner.set(i, it)));

const itemBox = new Map(ITEMS.map((it) => [it, union(it.idx.map((i) => bboxes[i]), PAD)]));
const reach = new Map(ITEMS.map((it) => [it, union([itemBox.get(it)!], 5)]));
const firstIdx = new Map(ITEMS.map((it) => [it, Math.min(...it.idx)]));

const servedBy = (i: number) => ITEMS.filter((it) => i > firstIdx.get(it)! && intersects(bboxes[i], reach.get(it)!));

const sequence = elements
  .map((_, i) => i)
  .filter((i) => owner.has(i) || (!eyeOf.has(i) && servedBy(i).length > 0));

for (const i of elements.keys()) {
  if (eyeOf.has(i) && servedBy(i).length) throw new Error(`Pupille ${i} liegt über einem animierten Objekt`);
}

type Run = { item?: Item; idx: number[] };
const runs: Run[] = [];
for (const i of sequence) {
  const it = owner.get(i);
  const last = runs.at(-1);
  if (last && last.item === it) last.idx.push(i);
  else runs.push({ item: it, idx: [i] });
}

const layers: string[] = [];
let parts = 0;
let covers = 0;

for (const run of runs) {
  const body = run.idx.map((i) => elements[i]).join("");

  if (run.item) {
    const item = run.item;
    const box = union(run.idx.map((i) => bboxes[i]), PAD);
    const ib = itemBox.get(item)!;
    const [ox, oy] = item.origin ?? [ib.x + ib.w / 2, ib.y + ib.h / 2];
    const style = toStyle({
      ...place(box),
      "transform-origin": `${round(((ox - box.x) / box.w) * 100, 3)}% ${round(((oy - box.y) / box.h) * 100, 3)}%`,
      ...item.vars(box),
    });
    layers.push(layerSvg(svgo(wrap(box, body)), `fx fx--${item.anim}`, style));
    parts++;
  } else {
    // je bedientem Objekt eine Abdeckung, auf dessen Bewegungsbereich begrenzt (nur dort ist sie vollständig)
    for (const it of new Set(run.idx.flatMap(servedBy))) {
      const idx = run.idx.filter((i) => servedBy(i).includes(it));
      const ebox = union(idx.map((i) => bboxes[i]));
      const area = reach.get(it)!;
      const x1 = Math.max(ebox.x, area.x);
      const y1 = Math.max(ebox.y, area.y);
      const x2 = Math.min(ebox.x + ebox.w, area.x + area.w);
      const y2 = Math.min(ebox.y + ebox.h, area.y + area.h);
      const clip = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
      const cbody = idx.map((i) => elements[i]).join("");
      layers.push(layerSvg(svgo(wrap(clip, cbody)), "fx-cover", toStyle(place(clip))));
      covers++;
    }
  }
}

const report = [`${parts} animierte Ebenen, ${covers} Abdeckungs-Ebenen`];

const json = { base, layers: layers.join("") };
await Bun.write(OUT, JSON.stringify(json));

const kb = (s: string) => (s.length / 1024).toFixed(1);
console.log(`Basis ${kb(base)} KB, Ebenen ${kb(json.layers)} KB (${ITEMS.length} animierte Objekte)`);
report.forEach((r) => console.log("  " + r));
