/**
 * Hintergrund „Mitmachen“ von Pexels. Env: PEXELS_API_KEY
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(import.meta.dir, "../src/assets/mitmachen");
const file = "hero.jpg";
const query = "berlin city street urban skyline";
const fallbackId = 325185;

async function searchPhoto(apiKey: string): Promise<number | null> {
  const params = new URLSearchParams({ query, per_page: "8", orientation: "landscape" });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { photos?: { id: number }[] };
  return data.photos?.[0]?.id ?? null;
}

async function download(id: number) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${id}: ${res.status}`);
  await Bun.write(join(outDir, file), res);
  console.log(`✓ ${file} (pexels ${id})`);
}

await mkdir(outDir, { recursive: true });
const apiKey = process.env.PEXELS_API_KEY?.trim();
let id = fallbackId;
if (apiKey) {
  const found = await searchPhoto(apiKey);
  if (found) id = found;
}
await download(id);
