/**
 * Köpfe für das Sticky-Panel in „Wir bringen alle an einen Tisch“ vorrastern.
 * Die Charakter-SVGs (bis 150 KB, hunderte Pfade, Masken) werden als <img> in Safari
 * bei jedem Repaint neu als Vektor gezeichnet – im Sticky-Panel ruckelt dann das Scrollen.
 * Hier wird jeder Kopf einmal als quadratischer Ausschnitt (object-fit: cover,
 * object-position: 50 % 18 %) nach WebP gerendert. Originale bleiben unverändert.
 * Aufruf: bun scripts/prepare-heads.ts
 */
import sharp from "sharp";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const src = "public/characters";
const out = `${src}/heads`;
const SIZE = 360; // 2× für Kreise bis 180 px
const FOCUS_Y = 0.18; // wie object-position: 50% 18%

mkdirSync(out, { recursive: true });

const slug = (name: string) =>
  name
    .replace(/\.svg$/i, "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const files = readdirSync(src).filter((f) => f.endsWith(".svg"));

for (const file of files) {
  const svg = readFileSync(join(src, file));
  const meta = await sharp(svg).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error(`${file}: keine Größe im SVG`);

  // Breite füllt das Quadrat; Höhe wird gemäß Fokuspunkt beschnitten.
  const density = (72 * SIZE) / w;
  const scaledH = Math.round((h * SIZE) / w);
  const top = Math.round(FOCUS_Y * Math.max(scaledH - SIZE, 0));

  const name = `${slug(file)}.webp`;
  await sharp(svg, { density })
    .resize({ width: SIZE })
    .extract({ left: 0, top, width: SIZE, height: Math.min(SIZE, scaledH) })
    .webp({ quality: 82, effort: 6 })
    .toFile(join(out, name));
  console.log(`${file} → heads/${name}`);
}
