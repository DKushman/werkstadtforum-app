/**
 * Lädt Bilder für „Was steht an?“ von Pexels (API oder Fallback-IDs).
 * Env: PEXELS_API_KEY
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(import.meta.dir, "../src/assets/upcoming");

type Job = { file: string; query: string; fallbackId: number; portrait?: boolean };

const jobs: Job[] = [
  { file: "termin.jpg", query: "berlin forum audience event", fallbackId: 7688336, portrait: true },
  { file: "feature.jpg", query: "berlin city west street", fallbackId: 325185 },
  { file: "news-podcast.jpg", query: "podcast studio microphone", fallbackId: 159888 },
  { file: "news-rueckblick.jpg", query: "community meeting discussion", fallbackId: 6770618 },
];

async function searchPhoto(query: string, apiKey: string, portrait?: boolean): Promise<number | null> {
  const params = new URLSearchParams({
    query,
    per_page: "8",
    orientation: portrait ? "portrait" : "landscape",
  });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { photos?: { id: number }[] };
  return data.photos?.[0]?.id ?? null;
}

async function download(id: number, file: string) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${id}: ${res.status}`);
  await Bun.write(join(outDir, file), res);
  console.log(`✓ ${file} (pexels ${id})`);
}

await mkdir(outDir, { recursive: true });
const apiKey = process.env.PEXELS_API_KEY?.trim();

for (const job of jobs) {
  let id = job.fallbackId;
  if (apiKey) {
    const found = await searchPhoto(job.query, apiKey, job.portrait);
    if (found) id = found;
  }
  await download(id, job.file);
}

console.log("Upcoming images ready.");
