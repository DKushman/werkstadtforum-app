/**
 * Partnerlogos für den beigen Hintergrund vorbereiten (Originale bleiben unverändert).
 * - Ränder beschneiden, damit alle Logos optisch gleich groß wirken
 * - Weiß auf Transparenz (AG City) → dunkler Text, sonst unsichtbar auf Beige
 * - Weißer Hintergrund (Werkbund) → transparent
 * Aufruf: bun scripts/prepare-logos.ts
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const dir = "src/assets/logos";
const out = `${dir}/web`;
mkdirSync(out, { recursive: true });

const INK = [38, 36, 32];

type Mode = "keep" | "white-to-ink" | "white-to-alpha";

const jobs: { file: string; name: string; mode: Mode }[] = [
  { file: "bezirk.png", name: "bezirk.png", mode: "keep" },
  { file: "logo-ag-city.webp", name: "ag-city.png", mode: "white-to-ink" },
  { file: "ihk-berlin.png", name: "ihk-berlin.png", mode: "keep" },
  { file: "vbki.png", name: "vbki.png", mode: "keep" },
  { file: "werbundberlin.png", name: "werkbund-berlin.png", mode: "white-to-alpha" },
];

for (const job of jobs) {
  const { data, info } = await sharp(`${dir}/${job.file}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Weiße Schrift im roten Kreis („city“) bleibt weiß: nur außerhalb der Kreis-Spalten umfärben.
  let redLeft = info.width;
  let redRight = -1;
  if (job.mode === "white-to-ink") {
    for (let y = 0; y < info.height * 0.6; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * 4;
        if (data[i + 3] > 128 && data[i] > 150 && data[i + 1] < 90 && data[i + 2] < 90) {
          if (x < redLeft) redLeft = x;
          if (x > redRight) redRight = x;
        }
      }
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const light = Math.min(r, g, b);
    const x = (i / 4) % info.width;
    const insideCircle = x >= redLeft && x <= redRight;
    if (job.mode === "white-to-ink" && !insideCircle && data[i + 3] > 0 && light > 200) {
      data[i] = INK[0];
      data[i + 1] = INK[1];
      data[i + 2] = INK[2];
    }
    if (job.mode === "white-to-alpha" && light > 235) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, { raw: info })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(`${out}/${job.name}`);

  const meta = await sharp(`${out}/${job.name}`).metadata();
  console.log(job.name, meta.width, meta.height);
}
