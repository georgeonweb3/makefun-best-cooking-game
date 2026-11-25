// Mama's Buka Rush — hand-in entrypoint (Node 22, standard library only).
//
// The playable game lives in game/ next to this file: plain static files
// (game/index.html plus its ES modules) that a desktop browser loads
// offline, with no libraries and no network requests. Running this file
// stages a submission directory: it copies game/ and screenshots/ into
// the output directory and writes dossier.json there, the summary the
// judge reads, using the vendored make.fun library.
//
// Locally, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');

if (!existsSync(gameSource)) {
  throw new Error('main.ts: game/ is missing next to this file — nothing to hand in');
}

mkdirSync(outputDir, { recursive: true });
cpSync(gameSource, join(outputDir, 'game'), { recursive: true });

const shotsTarget = join(outputDir, 'screenshots');
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// The scorer's caps from the competition's gate: only text_max_bytes
// shapes the dossier bytes. The rest make this program refuse exactly
// where the scorer would refuse an entry: more than 4 screenshots, one
// over 256 KiB, more than 993 files under game/, more than 48 MiB of
// game files in total, or a game path over 1000 bytes.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierCaps));
