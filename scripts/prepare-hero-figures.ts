/**
 * Hero-Figuren vorrastern (WebP mit Transparenz). Die Original-SVGs (bis 115 KB, Masken)
 * werden in Safari bei jedem Repaint des Hero neu als Vektor gezeichnet – das ruckelt,
 * sobald der klebende Hero freigegeben wird. Originale bleiben unverändert.
 * Aufruf: bun scripts/prepare-hero-figures.ts
 */
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const out = "src/assets/hero";
const WIDTH = 1400; // 2× für Figuren bis 700 px Breite
mkdirSync(out, { recursive: true });

const jobs = [
  { file: "public/characters/WIRKLICHREALINVESTOR.svg", name: "investor.webp" },
  { file: "public/characters/ARCHITEKTEN.svg", name: "architektin.webp" },
  { file: "public/characters/finanziererin.svg", name: "finanziererin.webp" },
  { file: "public/characters/RADFAHRERRRR.svg", name: "radfahrer.webp" },
  { file: "public/characters/grandpa.svg", name: "grandpa.webp" },
  { file: "public/characters/student.svg", name: "student.webp" },
  { file: "public/characters/AKTIV.svg", name: "aktiv.webp" },
];

for (const job of jobs) {
  const svg = readFileSync(job.file);
  const meta = await sharp(svg).metadata();
  const density = (72 * WIDTH) / (meta.width ?? WIDTH);
  const info = await sharp(svg, { density })
    .resize({ width: WIDTH })
    .webp({ quality: 86, effort: 6, alphaQuality: 90 })
    .toFile(join(out, job.name));
  console.log(`${job.file} → ${out}/${job.name} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
