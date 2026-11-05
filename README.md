# Hamilton Pixel Documentary

A 70-second vertical pixel-art documentary of Lewis Hamilton's 20 Formula 1 seasons, 2007–2026, made for TikTok. Fan-made, for personal use. Built with Remotion.

**Master:** [`renders/hamilton-pixel-doc_1080x1920_30fps_silent.mp4`](renders/hamilton-pixel-doc_1080x1920_30fps_silent.mp4)
- 1080×1920, 9:16, 30 fps
- exactly 2,100 frames, 70.0 s
- H.264, silent

The film is timed to 126 BPM ("We Do What We Want - Edit", Alan Fitzpatrick). The music is not included; add it in CapCut with the first downbeat at 0:00.

**Contents:** start lights; every season with a stats panel (championship result, wins, podiums, poles); seven championship celebrations; the 2026 card (P3\*, 259 points, 1 win, 7 podiums, \*AS OF MEXICAN GP); seven all-time records; the imagined Rwanda 2030 finale.

## Running it on your PC (Windows)

You need [Node.js 20+](https://nodejs.org) and Git. Clone to a short path outside OneDrive, for example `C:\dev\Hamilton-v1`.

```powershell
git clone https://github.com/ryangillies45-sudo/Hamilton-v1.git C:\dev\Hamilton-v1
cd C:\dev\Hamilton-v1
npm install
npm run studio        # live preview in the browser (pick "Preview3x")
npx remotion render src/index.ts Preview3x out/hamilton-1080x1920.mp4 --codec=h264 --crf=16
```

The `Preview3x` render is pixel-identical to the master and needs nothing beyond Node; Remotion downloads its own browser and ffmpeg on first run. The original pipeline is `npm run render`: 360×640 frames, then ffmpeg 3× nearest-neighbour, then an ffprobe check. It needs Bash (Git Bash) and ffmpeg on your PATH. `npm run check` runs the fact check: totals and the 2026 wording, plus the IMAGINED tag on every imagined scene.

To rebuild the sprites after editing the generators: `python tools/art/build_all.py` (needs Python 3 with Pillow and numpy). The compiled PNGs are committed, so this is optional.

## How it is built

| Part | Where |
|---|---|
| Beat clock: 126 BPM | `src/config/beatmap.ts` |
| Segments in beats (147 beats = 70 s) and scenes | `src/scenes/film.ts` |
| HUD: header, stats panel, tables, champion banner, IMAGINED tag | `src/overlays/hud.ts` |
| Per-frame compositor | `src/timeline.ts` |
| Facts (every caption comes from here, with sources) | `src/data/seasons.ts` |
| Imagined content (finale only, always under the IMAGINED tag) | `src/data/imagined.ts` |
| All-time records with outright/joint status | `src/data/records.ts` |
| Car reference photos used for checking | `research/references.md` |
| Pixel engine: framebuffer, bitmap font, effects, venues, car rig | `src/engine/` |
| Sprite generators: 20 season cars, hero MP4-22 and SF-26, Hamilton portraits, celebrating figures, trophy | `tools/art/` → `public/sprites/` |
| Render and verify (360×640 → 3× nearest-neighbour → H.264, ffprobe check) | `tools/render.sh`, `tools/verify.mjs` |

The planning document is in [docs/production-plan.md](docs/production-plan.md).

## Facts vs imagined

- Everything before the "HISTORY ENDS HERE" card (63.3 s) is historical, from the sourced records in `src/data/seasons.ts` and `src/data/records.ts`.
- The 2026 position is shown as **P3\*** with **\*AS OF MEXICAN GP** underneath.
- From 64.8 s to the end, the film is an **imagined scenario**: WHAT IF… RWANDA 2030. Every one of those frames carries the IMAGINED tag. No words are attributed to Lewis Hamilton.
- Real context: on 13 Oct 2026 F1 agreed a 10-year deal for an African Grand Prix in Rwanda from the early 2030s. No date is set.

All art is original pixel art drawn by code, not traced from photographs. Team liveries and sponsor marks are simplified pixel-scale depictions for a personal fan tribute and belong to their owners.
