/**
 * Bilder für die Orte-Karten auf „Was wird gebaut?“ von Pexels.
 * Env: PEXELS_API_KEY (in .env, nicht im Repo). Aufruf: bun scripts/fetch-orte-images.ts
 * Mit --list werden die Treffer nur angezeigt; mit --pick slug=id ein bestimmtes Foto gewählt.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(import.meta.dir, "../src/assets/orte");

type Job = { slug: string; queries: string[] };
type Photo = { id: number; alt: string; photographer: string; url: string; width: number; height: number };

const jobs: Job[] = [
  { slug: "breitscheidplatz", queries: ["Breitscheidplatz Berlin", "Kaiser Wilhelm Memorial Church Berlin"] },
  { slug: "hardenbergplatz", queries: ["Bahnhof Zoologischer Garten Berlin", "Berlin Zoo station"] },
  { slug: "kudamm", queries: ["Kurfürstendamm Berlin", "Kudamm Berlin street"] },
  { slug: "messe-icc", queries: ["ICC Berlin", "Messe Berlin Funkturm"] },
];

const apiKey = process.env.PEXELS_API_KEY?.trim();
if (!apiKey) throw new Error("PEXELS_API_KEY fehlt (.env)");

const listOnly = process.argv.includes("--list");
const picks = new Map<string, number>();
for (const arg of process.argv) {
  const m = arg.match(/^--pick=([a-z-]+)=(\d+)$/);
  if (m) picks.set(m[1], Number(m[2]));
}

async function search(query: string): Promise<Photo[]> {
  const params = new URLSearchParams({ query, per_page: "6", orientation: "landscape", locale: "de-DE" });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, { headers: { Authorization: apiKey! } });
  if (!res.ok) throw new Error(`Pexels ${res.status} für „${query}“`);
  const data = (await res.json()) as { photos?: Photo[] };
  return data.photos ?? [];
}

async function download(id: number, file: string) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${id}: ${res.status}`);
  await Bun.write(join(outDir, file), res);
}

await mkdir(outDir, { recursive: true });
const credits: Record<string, { id: number; photographer: string; url: string }> = {};

for (const job of jobs) {
  let chosen: Photo | undefined;
  const pick = picks.get(job.slug);
  for (const query of job.queries) {
    const photos = await search(query);
    if (listOnly) {
      console.log(`\n${job.slug} – „${query}“`);
      for (const p of photos) console.log(`  ${p.id}  ${p.width}×${p.height}  ${p.photographer}  ${p.alt}`);
    }
    if (pick) chosen = photos.find((p) => p.id === pick) ?? chosen;
    else if (!chosen && photos[0]) chosen = photos[0];
    if (chosen && !listOnly) break;
  }
  if (listOnly) continue;
  if (pick && !chosen) {
    chosen = { id: pick, alt: "", photographer: "", url: `https://www.pexels.com/photo/${pick}/`, width: 0, height: 0 };
  }
  if (!chosen) throw new Error(`Kein Foto für ${job.slug}`);
  await download(chosen.id, `${job.slug}.jpg`);
  credits[job.slug] = { id: chosen.id, photographer: chosen.photographer, url: chosen.url };
  console.log(`✓ ${job.slug}.jpg  (pexels ${chosen.id}, ${chosen.photographer})`);
}

if (!listOnly) {
  await writeFile(join(outDir, "credits.json"), JSON.stringify(credits, null, 2) + "\n");
  console.log("Orte-Bilder bereit.");
}
