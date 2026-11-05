# Hamilton Pixel Documentary

A 30-second pixel-art tribute to Lewis Hamilton's 20 Formula 1 seasons, 2007–2026. Fan-made, for personal use. Built with Remotion.

**Master:** [`renders/hamilton-pixel-doc_1080p30_silent.mp4`](renders/hamilton-pixel-doc_1080p30_silent.mp4)
- 1920×1080, 16:9, 30 fps
- exactly 900 frames, 30.0 s
- H.264, silent

The film is timed to 126 BPM ("We Do What We Want - Edit", Alan Fitzpatrick). The music is not included; add it in CapCut with bar 1 beat 1 at 0:00.

## Running it on your PC (Windows)

You need [Node.js 20+](https://nodejs.org) and Git. Clone to a short path outside OneDrive, for example `C:\dev\Hamilton-v1`.

```powershell
git clone https://github.com/ryangillies45-sudo/Hamilton-v1.git C:\dev\Hamilton-v1
cd C:\dev\Hamilton-v1
npm install
npm run studio        # live preview in the browser (pick "Preview4x")
npm run render        # renders out\hamilton-pixel-doc_1080p30_silent.mp4 and checks it
```

`npm run render` uses Git Bash and ffmpeg. Remotion downloads its own browser on first run. `npm run check` runs the fact check: totals and the 2026 wording, plus the IMAGINED tag on every imagined scene.

To rebuild the sprites after editing the generators: `python tools/art/build_all.py` (needs Python 3 with Pillow and numpy). The compiled PNGs are committed, so this is optional.

## How it is built

| Part | Where |
|---|---|
| Beat clock: 126 BPM; every scene is placed in bars and beats | `src/config/beatmap.ts` |
| Scene list (16 one-bar slots) and per-frame compositor | `src/timeline.ts` |
| Scenes | `src/scenes/scenes.ts` |
| Facts (every caption comes from here, with sources) | `src/data/seasons.ts` |
| Imagined content (finale only, always under the IMAGINED tag) | `src/data/imagined.ts` |
| Pixel engine: framebuffer, bitmap font, effects, venues, car rig | `src/engine/` |
| Sprite generators: 20 cars plus hero MP4-22 and SF-26, Hamilton portraits | `tools/art/` → `public/sprites/` |
| Render and verify (480×270 → 4× nearest-neighbour → H.264, ffprobe check) | `tools/render.sh`, `tools/verify.mjs` |

The planning document is in [docs/production-plan.md](docs/production-plan.md).

## Facts vs imagined

- Everything up to bar 14 beat 3 (25.7 s) is historical, from the sourced records in `src/data/seasons.ts`.
- The 2026 position is shown as **P3\*** with **\*AS OF MEXICAN GP** underneath.
- From 25.7 s to the end, the film is an **imagined scenario**: WHAT IF… RWANDA 2030. Every one of those frames carries the IMAGINED tag. No words are attributed to Lewis Hamilton.
- Real context: on 13 Oct 2026 F1 agreed a 10-year deal for an African Grand Prix in Rwanda from the early 2030s. No date is set.

All art is original pixel art drawn by code, not traced from photographs. Team liveries and sponsor marks are simplified pixel-scale depictions for a personal fan tribute and belong to their owners.
