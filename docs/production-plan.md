# Hamilton Pixel Documentary — Production Plan v2

**Status:** awaiting your approval. Nothing has been built.
**Revised:** 5 Nov 2026, from the Claude Desktop plan of the same date (v1).
**Kept from v1:** the eight gated stages, the Remotion architecture, the 20-car catalogue, the reusable animation rigs, the 900-frame / 30 fps / 1920×1080 timeline, and the approval gates.

---

## 1. What changed from v1

| # | Your adjustment | How v2 handles it |
|---|---|---|
| 1 | Hamilton recognisable, not a generic driver; 2026 most detailed | v1's "helmet only, no face" rule is removed. A likeness rig at three scales; the 2026 head is the first asset made and has its own approval gate (§8) |
| 2 | No 126 BPM assumption | All timing reads a beat map produced by analysing your audio file. 126 BPM survives only as a placeholder grid until the file arrives (§4) |
| 3 | Authentic liveries with sponsor details | v1's "no logos" rule is removed. Sponsor marks are hand-drawn at pixel scale; a second, larger "feature" car scale makes them recognisable (§7) |
| 4 | Research all 20 cars individually | A research dossier per car with two or more text sources, an openly licensed photo, and a Getty search link for your check. Getty blocks this cloud machine, so the Getty photo check is yours (§10) |
| 5 | Rwanda 2030 explicitly imagined | Kept and strengthened: IMAGINED tag on every imagined frame, and no words or official branding attributed to anyone (§12) |
| 6 | Facts vs imagined kept distinct | Three content types (FACT, SYMBOLIC, IMAGINED), enforced in code by a check that fails the build (§12) |

---

## 2. Where the project lives

### What I could and could not inspect

| Place | Finding |
|---|---|
| **Your PC** | **Not inspected. It isn't reachable from this session.** No folders are shared with it through Remote Control. I assume nothing from Claude Desktop exists on it |
| **GitHub repo** `ryangillies45-sudo/Hamilton-v1` | Exists, **public**, and was completely empty (no commits, no branches). This plan is its first commit, on branch `claude/hamilton-pixel-doc-plan-ka0wwj` |
| **This cloud session** | A fresh container with the repo cloned at `/home/user/Hamilton-v1`. Ubuntu 24.04, 4 CPU cores, 15 GB RAM, 31 GB free. Node 22.23.4, npm 10.9.9, pnpm 10.28.0, bun 1.4.4, TypeScript 6.0.2, ffmpeg/ffprobe 6.1.1, Python 3.13.18 with Pillow 12.3 and numpy 2.5.3, Playwright Chromium. No audio-analysis libraries yet (PyPI is reachable, librosa 1.0.0 available). Remotion 4.0.540 on npm |
| **Claude Desktop workspace (v1)** | `/home/claude`, 2 cores, Chrome for Testing 153. **A different machine.** Its environment table does not describe your PC or this session; disregard it |
| **Web access from here** | Getty Images: blocked (HTTP 403, Cloudflare). Wikimedia Commons: reachable, but rate-limits bursts |

### Recommendation

1. **The GitHub repo is the project's home, with the Remotion project at the repo root.** The repo is dedicated to this film, so it needs no `hamilton-pixel-doc/` subfolder. Cloud sessions and your PC both work from it. Cloud containers are deleted after a while, so anything not pushed is lost.
2. **The repo is public.** The music, any photographs and any licensed reference material must never be committed. `.gitignore` will exclude `audio/`, `reference/cache/` and `out/` from Stage 1. Consider making the repo private, especially if you want me to take the music through it.
3. **On your PC,** clone to a short path with no spaces, outside OneDrive or iCloud-synced folders: `C:\dev\Hamilton-v1` on Windows, `~/dev/Hamilton-v1` on Mac. Synced folders and `node_modules` conflict, and Windows has path-length limits. Your PC needs only **Node 20 or newer** and **Git**. Remotion 4 bundles its own ffmpeg and downloads its own headless browser.
4. **Before I rely on any detail of your PC**, do one of these:
   - **(a)** In the Claude desktop app, open Settings → Claude Code → Remote Control and add the folder. A cloud session can then ask to use it.
   - **(b)** Run this read-only check in PowerShell and paste the output:
     ```powershell
     node -v; npm -v; git --version
     (Get-CimInstance Win32_Processor).Name; (Get-CimInstance Win32_Processor).NumberOfLogicalProcessors
     [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)
     Get-PSDrive C | Select-Object Used,Free; $env:OneDrive
     ```
   - **(c)** Run Claude Code on the PC itself, in the cloned folder.

Renders run wherever is faster. Stage 1 measures the speed in the cloud, and on your PC once it is connected.

---

## 3. Review findings

### 3a. Factual corrections

| # | v1 said | Correction | Status |
|---|---|---|---|
| F1 | 2025: "his first such season since 2007" | 2025 was **his first season ever without a GP podium**. He had at least one podium every season 2007–2024 | Verified against the fact sheet |
| F2 | "Barcelona-Catalunya GP" (correct), but some sources call it the Spanish GP | In 2026 the **Spanish GP moved to Madring, Madrid** (round 14, 13 Sep, Hamilton DNF). The 14 Jun race is the **Barcelona-Catalunya GP** (round 7). Captions say BARCELONA, never "Spanish GP" | F1.com results page |
| F3 | Stamp "AS OF 5 NOV 2026" | Use **"AFTER ROUND 19 · MEXICO CITY"**, which stays accurate whatever the render date. He is **P3 on 259, two points behind Verstappen (261)**, so Brazil on 8 Nov could change the position | F1.com standings, RacingNews365 |
| F4 | 2026: P3, 7 podiums | **Confirmed.** Win: Barcelona. P2: Canada, Monaco, Mexico City. P3: China, Great Britain, Bahrain. The Mexico City post-race penalties did not affect him. Antonelli clinched the title in Mexico City on 1 Nov. Four rounds left: Brazil 8 Nov, Las Vegas 21/22 Nov, Qatar 29 Nov, Abu Dhabi 6 Dec | F1.com, Al Jazeera/Reuters |
| F5 | 106 wins, 105 poles, 209 podiums | Wins **106** confirmed. Podiums **209** worked out as 202 at the end of 2025 plus 7. Poles **105** match Reuters' "105th" pole in Mexico City. All three re-checked at Stage 7 | Partly derived |
| F6 | "Mercedes W07 Hybrid", "Mercedes F1 W15" | **Mercedes F1 W07 Hybrid**; **Mercedes-AMG F1 W15 E Performance** | Official names |
| F7 | Suits: "silver then black Mercedes" | Reference 1 shows **dark suits in every Mercedes year (2013–2024)** and light silver/white McLaren suits. Suit colours are verified per season, not assumed | To verify, Stage 3 |
| F8 | No 2026 suit detail | **2026 Ferrari suit:** mainly red, white collar and neck, white side panels, white lines between the chest and shoulder panels, blue HP logo. The 2025 suit's horizontal stripe is gone | Search summaries; re-open at Stage 3 |
| F9 | SF-26: "red and white; white engine cover" | Adds: **gloss** paint (the first gloss since 2018; 2019–2025 were matte); a brighter Rosso Scuderia inspired by the 2025 Monza special; white engine cover, a nod to the 1975 312T; **black on the chassis sides and front wing**; HP branding; a serrated top edge on the engine-cover fin; **#44** | Search summaries; re-open at Stage 3 |
| F10 | Open check: Barcelona livery | **No special livery found for Barcelona.** The 2026 one-off "blueprint" livery ran in Austin in October. Bar 13 uses the standard SF-26 livery, pending your photo check | Search; photo check at Stage 3 |
| F11 | Rwanda | **Confirmed:** a 10-year deal announced 13 Oct 2026 for the **African Grand Prix**, presented by Visit Rwanda, at a new circuit in Bugesera about 40 km south of Kigali, next to the new airport. First race "early 2030s", once the circuit is finished. **No date exists, so "2030" stays imagined** | F1.com, Nairametrics |
| F12 | Car numbers "from memory" | Working list: 2007 #2, 2008 #22, 2009 #1, 2010 #2, 2011 #3, 2012 #4, 2013 #10, 2014–2026 #44. Only 2026 #44 is confirmed so far | Stage 3 |

### 3b. Technical problems

| # | Problem | Fix |
|---|---|---|
| T1 | The beat grid is a 126 BPM formula. Beats fall on fractional frames (14.29), and the storyboard assumes exactly 15¾ bars | Timing comes from an **analysed beat list**: each beat's exact time, its nearest frame, and a bar/beat label. The storyboard is fitted to the real number of bars (§4–5) |
| T2 | Five start lights on four beats | Lights on beats 1–4 plus the "and" of 4 (or the subdivision the music offers), then all out together on the next downbeat, as in a real start |
| T3 | Flip-book captions are on screen about 0.48 s each, which is unreadable | **Minimum caption hold of 1 s (30 frames).** In fast bars only the large year changes on each beat; one summary caption holds for the whole bar, e.g. "2009–2012 · 12 WINS" (2+3+3+4) |
| T4 | Drawing 1920×1080 in the browser wastes 15/16 of the render work and risks smoothing | Remotion renders lossless PNG frames at **480×270**, then ffmpeg scales them 4× with **nearest-neighbour**, giving exact pixels and much faster renders. A separate 4× composition is used only for previewing in Remotion Studio |
| T5 | Colour shift (Ferrari red, Petronas teal) under the wrong colour matrix | Tag and convert **BT.709** explicitly. The 4×4 art pixels sit on multiples of 4, so they align with H.264's 2×2 colour blocks and colours don't bleed. Checked with frame comparisons at Stage 1 |
| T6 | A fuse-bead finish can't read at 4×: a 4 px bead is just a dot | Beads need about 8 screen px each, which means a **240×135 grid at 8×** with half the detail. Decide before Stage 2 |
| T7 | At 70–85 px car length, a sidepod logo is 8–12 px wide: colour blocks only | Add **feature-scale cars** (about 2×, 150–170 px) for the hero shots, where sponsor wordmarks become recognisable. Fleet cars keep sponsor colour blocks in the correct positions |
| T8 | A face can't read at 24 px (about 3×4 px) | Three likeness scales: portrait card, hero bust, hero full body (§8). At car scale, recognisability comes from his helmet designs and hair silhouette |
| T9 | One wheel rule for all 20 cars is wrong | Wheel sets per era: 13-inch rims with tall sidewalls (2007–21); 18-inch low-profile with wheel covers (2022–25); narrower in 2026. Tyre markings also changed by era: Bridgestone grooved tyres 2007–08, slicks from 2009, Pirelli coloured sidewalls from 2011. Each detail verified per car |
| T10 | Era templates hide the shapes that make each car recognisable | Each car gets its own silhouette pass and an "as raced" spec, tied to the race shown. For example: 2014 low noses differ from 2015–16; the W13/W14 had "zero-pod" sidepods and the W15 conventional ones; the W14 changed its sidepods mid-season at Monaco |
| T11 | Car length | Real cars grew from about 4.7 m (2007) to about 5.6 m (2022–25); 2026 cars are shorter. At one scale the sprites run from about 70 to 85 px. Exact lengths come from published dimensions at Stage 3 |
| T12 | Three start-grid rear views, but only 2007 is on the grid | **One** rear view (MP4-22) |
| T13 | v1 environment table is from another machine | See §2 |
| T14 | Remotion licence | Free for individuals and companies of three people or fewer; larger companies need a company licence |
| T15 | Public repo | Never commit audio, photos or licensed references |
| T16 | Grids written in code are slow to iterate for faces | `art/` also accepts **indexed PNGs**, which you can edit in LibreSprite, Piskel or Aseprite. The build checks that every pixel uses the palette |

### 3c. Visual inconsistencies

| # | Issue | Fix |
|---|---|---|
| V1 | "Black only for tyres and shadow", yet the W11, W12 and W14 are black cars and the W15 is half black | Pure black stays reserved for tyres, openings and shadow. Black liveries use a separate **3-step carbon ramp**, so those bodies don't merge with the tyres |
| V2 | "One accent hue per era" conflicts with authentic liveries | Each team keeps one dominant accent; sponsor colours (Vodafone red, Petronas teal, HP blue, Shell yellow/red and so on) appear as small, accurate marks |
| V3 | The IMAGINED tag "fades in", but the style bans soft fades | It dithers in |
| V4 | Bar 14 warms to "dusk", but the finale is "dawn" | One palette: **dawn gold** |
| V5 | A black W14 "in low light" would be unreadable | Rim-light it |
| V6 | 2008: "chequered flag, trophy", but he finished **P5** in Brazil | The title is shown with the counter and a symbolic celebration. No first-place finish is shown (§12) |

---

## 4. Music and beat map

1. **Intake.** I read the file's duration, sample rate and channels, then confirm with you that the Edit is 30.0 s, or which 30 s window to use. The file stays out of git (§2).
2. **Analysis.** Two independent trackers are cross-checked: librosa (beats and tempo curve) and *Beat This!* (a neural beat and downbeat tracker). Onset strength and spectral novelty locate hits, drops, risers and section changes. Tempo is **measured, not assumed**, along with whether it is constant.
3. **Output.** The analysis writes `src/config/beatmap.json` with:
   - every beat: exact time, nearest frame, bar, beat number and confidence;
   - the downbeats;
   - named hits (e.g. `DROP_1`);
   - the measured tempo, or tempo curve.

   Frame rounding is at most ±16.7 ms.
4. **What you check:**
   - a **click-track mix**: your audio plus a click on every beat and an accent on each downbeat;
   - a **beat-strip image**: waveform with beats, bars and hits marked;
   - a **table of hits** with timestamps.
5. **Lock.** You confirm by ear and the beat map is frozen. A global sync offset (±1–2 frames) is available if hits feel late.
6. **Fitting the storyboard.** A timeline compiler places the story slots (§5) on the real bars. Below about 124 BPM there are fewer than ~15½ bars in 30 s, so I propose which slots to merge. Faster tracks give slots extra beats. You approve the fitted table before the animatic.

Until the audio arrives, a placeholder grid (126 BPM, labelled PLACEHOLDER) lets the engine be built. No timing-dependent creative work happens on it.

---

## 5. Storyboard: 16 story slots (lengths provisional)

Frames are assigned only after analysis. Content types are explained in §12.

| Slot | Bars* | Scene | Key visual | Caption (from data) | Type |
|---|---|---|---|---|---|
| 1 | 1 | Lights out | MP4-22 rear view on a silhouetted grid; 5 lights on beats 1–4 plus "4-and", all out on the next downbeat; "2007" types on | — | SYMBOLIC |
| 2 | 1 | 2007 rookie | Feature-scale MP4-22 tracking shot; 2007 portrait card | 2007 · ROOKIE · P2 · 4 WINS | FACT |
| 3 | 1 | 2008 first title | MP4-23 in rain on a dusk circuit; helmet-off celebration; counter → 1 | 2008 · WORLD CHAMPION | FACT + SYMBOLIC |
| 4 | 1 | 2009–2012 | MP4-24 → MP4-27, one per beat; big year flips each beat | 2009–2012 · 12 WINS (holds for the bar) | FACT |
| 5 | 1 | 2013 move | Pit-lane team-swap wipe; helmet off; W04 | 2013 · FIRST MERCEDES WIN · HUNGARY | FACT + SYMBOLIC |
| 6 | 1 | 2014–15 | W05, W06; counter 2, 3 | 2014 · TITLE 2 / 2015 · TITLE 3 | FACT |
| 7 | 1 | 2016–17 | W07, W08 (wide cars, shark fin); counter 4 | 2016 · P2 · 10 WINS / 2017 · TITLE 4 | FACT |
| 8 | 1 | 2018–19 | W09, W10 (halo); counter 5, 6; riser | 2018 · TITLE 5 / 2019 · TITLE 6 | FACT |
| 9 | 1 | 2020 | Silver-to-black flip on the hit; W11; counter 7; confetti; portrait card | 2020 · CHAMPION · TITLE 7 | FACT |
| 10 | 1 | 2021–23 | W12; W13, then a rim-lit W14 | 2021 · P2 · 8 WINS / 2022–23 · NO WINS | FACT |
| 11 | 1 | 2024 farewell | W15 crosses the line; helmet-off wave to the garage | 2024 · 2 WINS · SILVERSTONE · SPA | FACT + SYMBOLIC |
| 12 | 1 | 2025 red reveal | Garage door rises on the SF-25; 2025 suit | 2025 · P6 · SPRINT WIN · CHINA | FACT |
| 13 | 1 | 2026 Barcelona | Feature-scale SF-26 pass; active-aero wing switches | FIRST FERRARI GP WIN · BARCELONA · WIN 106 | FACT |
| 14 | 1 | 2026 so far, then the line | *Option:* 20 portrait cards snap into a 5×4 grid (a pixel homage to Reference 1's layout, not a copy); rule reads HISTORY ENDS HERE; IMAGINED tag dithers in at the crossover | 2026 · P3 · 7 PODIUMS · AFTER ROUND 19 | FACT → IMAGINED |
| 15 | 1 | Finale I | 2026 hero Hamilton beside the SF-26 at dawn over green hills; visor glint | — | IMAGINED |
| 16 | rest | Finale II | WHAT IF… card holds to the last frame | WHAT IF… RWANDA 2030 (wording: your choice, §15) | IMAGINED |

\* Placeholder lengths. Which bar carries the biggest hit (v1 assumed bar 9) is set from the real track's structure.

---

## 6. Architecture (kept; changes in bold)

```
Hamilton-v1/                     ← repo root
├─ package.json · tsconfig.json · remotion.config.ts · .gitignore (audio/, out/, reference/cache/)
├─ docs/production-plan.md       ← this file
├─ src/
│  ├─ Root.tsx                   Main: 900 frames, 30 fps, **480×270 logical**; Preview4x for Studio; dev comps
│  ├─ config/  video.ts · **beatmap.json (generated) + beatmap.ts (loader, placeholder fallback)** · timeline.ts
│  ├─ data/    seasons.ts (**+ carNumber, sponsors, helmet, look, suit, depictedRace; each with source + status**)
│  │           imagined.ts (renders only inside ImaginedFrame)
│  ├─ engine/  PixelStage · Sprite · useClip · beats · camera · Parallax · PixelText · fx/ (seeded)
│  ├─ sprites/ palette.ts · cars/ (**fleet + feature scales**) · **likeness/** (head rig, looks, portraits, hero)
│  │           driver/ (body rig, suits, helmets) · props/ · environments/
│  ├─ scenes/ · transitions/ · overlays/ (SeasonCaption, TitleCounter, ImaginedFrame, SafeArea)
├─ art/                          indexed grids **or indexed PNGs** (editable in any pixel editor)
├─ public/sprites/               compiled sheets (generated)
├─ research/cars/2007.md … 2026.md   **per-car dossiers: text, links, attribution; no photos**
├─ tools/
│  ├─ build-sprites.ts · contact-sheet.ts
│  ├─ **beatmap/analyse.py · clicktrack.py · strip.py**   (replaces the 126 BPM click script)
│  ├─ **check-facts.ts**         fails the build on unsourced FACT captions or untagged IMAGINED frames
│  └─ **render.sh**              480×270 PNGs → ffmpeg 4× nearest → H.264 / ProRes 4444 / PNG; ffprobe 900-frame check
└─ reference/                    notes and links only; reference/cache/ is git-ignored
```

---

## 7. Pixel-art visual language (changes only; the rest of v1 stands)

| Rule | v2 standard |
|---|---|
| Canvas | 480×270, rendered at that size, then 4× nearest-neighbour. One pixel size for the whole film |
| Car scales | **Fleet** about 70–85 px (era-accurate lengths) · **Feature** about 150–170 px for hero shots · SF-26 three-quarter view about 200 px |
| Sponsor marks | Hand-drawn at pixel scale from references, simplified and in the correct positions (nose, sidepod, engine cover, wing endplates). Never traced and never imported from logo files. Checked at Stage 3 |
| Wheels | Per era (T9) |
| Black | Pure black for tyres, openings and shadow; black liveries use the carbon ramp (V1) |
| Palette | About 48 colours (v1 had about 32). Adds sponsor colours, the carbon ramp, a 5-step skin ramp, and hair and beard ramps. Locked at Stage 2 |
| Master reference | The MP4-22 bead pattern's rules stand: side profile, value steps, sparse black, details suggested. The pattern itself is not copied |

---

## 8. Hamilton likeness

**Approach.** A respectful, recognisable pixel caricature, drawn by eye from reference photos and never traced. It is used only in a tribute context, never in anything presented as real that isn't, and no words are put in his mouth.

**Identity anchors,** constant at every age: head and face shape, brow line, eyes, nose, mouth, ears and ear studs, skin tone, build and posture.

**Look variants** (hair and facial hair). The groupings below are read from Reference 1, which is too small to rely on, so each season is confirmed against dated photos at Stage 4:
- 2007–09: short cropped dark hair, clean-shaven, youthful
- 2010–14: short hair, beard growing in
- 2015: bleached blond top
- 2016–19: changing styles (twists, curls, short cuts) with a beard
- 2020–26: braids and cornrows pulled back, fuller beard and moustache

**Three scales:**

| Scale | Size | Used for |
|---|---|---|
| Portrait card | about 40×48 px bust (face about 20 px wide) | Each season's caption card, 20 cards built from look and suit layers; the optional slot-14 grid |
| Hero bust | up to about 200 px tall (face about 80 px wide) | Finale I close-up |
| Hero full body | about 140 px standing | Finale I beside the SF-26; idle breathing, head turn, visor up and down, glint, raised fist |
| Car scale | about 26 px | Helmet on. Recognisability comes from **his helmet design for each season** (researched) and, with the helmet off, his hair silhouette |

**2026 hero (priority asset):**
- Braids pulled back tight from the hairline, full beard and moustache, ear studs. Jewellery is checked against photos.
- 2026 Ferrari suit as sourced in F8.
- 2026 helmet: the yellow base with red detail from his 2025 Ferrari design is confirmed. Its 2026 form is reported only by retail listings, and a pink one-off was reported at Monaco. To verify.

**Process.** At Stage 2 the 2026 head is made at all three scales and shown beside the reference photos. Up to three revision rounds, then your sign-off, before any other Hamilton art is made.

**References.** Reference 1's faces are about 70 px wide, too small to work from. Better sources:
- your own photos, or photos you have rights to;
- openly licensed photos on Wikimedia Commons, credited, kept out of the repo and never traced;
- Getty search links, for you to view.

---

## 9. Asset list v2 (about 100 assets; v1 had about 60)

| Group | Assets |
|---|---|
| Cars | Era base shapes (about 9) · 20 fleet-scale season cars · 6 feature-scale cars (2007, 2008, 2013, 2020, 2024, 2025) plus the SF-26 side view · SF-26 three-quarter hero · 1 rear view (MP4-22) |
| Hamilton | Head rig with about 8 look layers · 20 portrait cards · body rig in about 6 suits (McLaren; Mercedes variants as verified; Ferrari 2025; Ferrari 2026) · 20 season helmets at small scale · 2026 hero bust and full body |
| Props | Start lights, title-counter stars, chequered flag, podium, garage door, pit wall, confetti |
| Environments | 6 generic venues (not replicas) plus the imagined dawn hills |
| Overlays and fonts | Season caption card with portrait slot, title counter, ImaginedFrame and IMAGINED tag, round stamp; original 5×7 and 8×12 bitmap fonts |
| Effects | Speed lines, sparks, spray, rain, confetti, flash, dither wipes, heat haze, shake (seeded) |

The extra assets mostly lengthen Stages 3 and 4.

---

## 10. Car catalogue v2 and research method

**Each dossier (`research/cars/YYYY.md`) records:**
- the official name and Hamilton's number;
- the **race depicted** and the spec "as raced" there;
- livery colours, with named palette entries;
- **sponsor marks and their placement**;
- shape cues: nose, sidepods, engine cover and fin, front and rear wings, halo, wheels and tyres;
- length and wheelbase;
- his helmet that season;
- sources: two or more text sources, plus at least one openly licensed photo or your Getty check.

**Verification status** goes text-verified → photo-verified by me (licensed photo) → photo-checked by you (Getty). No sprite is final until a car is photo-verified.

† = from memory, not yet verified. Links: **G** = Getty search, for your check. **C** = Wikimedia Commons image search (openly licensed).

| Year | Car | No. | Livery and anchor sponsors | Shape cues | Links |
|---|---|---|---|---|---|
| 2007 | McLaren MP4-22 | 2† | Chrome silver, red swoosh (Ref 3); Vodafone, Mobil 1, Santander† | High nose, bridge front wing, many winglets; grooved tyres | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+McLaren+MP4-22+2007) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=McLaren+MP4-22+Hamilton) |
| 2008 | McLaren MP4-23 | 22† | As 2007† | High nose, fin on the engine cover†; grooved tyres | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+McLaren+MP4-23+2008) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=McLaren+MP4-23+Hamilton) |
| 2009 | McLaren MP4-24 | 1† | Silver, red† | 2009 rules: wide low front wing, tall narrow rear wing, slicks; KERS | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+McLaren+MP4-24+2009) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=McLaren+MP4-24+Hamilton) |
| 2010 | McLaren MP4-25 | 2† | Silver, red† | F-duct; long fin on the engine cover† | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+McLaren+MP4-25+2010) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=McLaren+MP4-25+Hamilton) |
| 2011 | McLaren MP4-26 | 3† | Silver, red† | U-shaped sidepods†; first Pirelli year | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+McLaren+MP4-26+2011) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=McLaren+MP4-26+Hamilton) |
| 2012 | McLaren MP4-27 | 4† | Silver, red† | Low smooth nose, no step (unlike rivals) | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+McLaren+MP4-27+2012) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=McLaren+MP4-27+Hamilton) |
| 2013 | Mercedes F1 W04 | 10† | Silver, Petronas teal; Petronas | Stepped nose† | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W04+2013) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+F1+W04+Hamilton) |
| 2014 | Mercedes F1 W05 Hybrid | 44 | Silver, teal; Petronas | 2014 low nose; hybrid era | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W05+2014) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+F1+W05+Hamilton) |
| 2015 | Mercedes F1 W06 Hybrid | 44 | Silver, teal; Petronas | Shorter nose† | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W06+2015) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+F1+W06+Hamilton) |
| 2016 | Mercedes F1 W07 Hybrid | 44 | Silver, teal; Petronas | Slim nose† | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W07+2016) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+F1+W07+Hybrid+Hamilton) |
| 2017 | Mercedes-AMG F1 W08 EQ Power+ | 44 | Silver, teal; Petronas | Wider car and tyres, shark fin, T-wing | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W08+2017) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W08+Hamilton) |
| 2018 | Mercedes-AMG F1 W09 EQ Power+ | 44 | Silver, teal; Petronas | Halo arrives; fin removed | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W09+2018) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W09+Hamilton) |
| 2019 | Mercedes-AMG F1 W10 EQ Power+ | 44 | Silver, teal; Petronas | Simpler front wing, taller rear wing | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W10+2019) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W10+Hamilton) |
| 2020 | Mercedes-AMG F1 W11 EQ Performance | 44 | **Black**, teal; Petronas, INEOS† | Halo era | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W11+2020) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W11+Hamilton) |
| 2021 | Mercedes-AMG F1 W12 E Performance | 44 | Black, teal† | Cut-down floor | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W12+2021) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W12+Hamilton) |
| 2022 | Mercedes-AMG F1 W13 E Performance | 44 | **Silver**, teal | Ground-effect car; **zero-pod** sidepods; 18" wheels with covers | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W13+2022) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W13+Hamilton) |
| 2023 | Mercedes-AMG F1 W14 E Performance | 44 | Black: exposed raw carbon plus matte black paint | Zero-pod sidepods, **new sidepods from Monaco** (pick one spec) | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W14+2023) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W14+Hamilton) |
| 2024 | Mercedes-AMG F1 W15 E Performance | 44 | Silver top, black lower half | Conventional downwash sidepods | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Mercedes+W15+2024) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Mercedes+W15+Hamilton) |
| 2025 | Ferrari SF-25 | 44 | Darker **matte** red, angled white band, thin red and white stripes, red rims, white numbers; HP title sponsor | Pull-rod front suspension | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Ferrari+SF-25+2025) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Ferrari+SF-25+Hamilton) |
| 2026 | Ferrari SF-26 | **44 ✓** | **Gloss** brighter red, white engine cover, black on the chassis sides and front wing; HP (F9). Standard livery at Barcelona (F10) | 2026 rules: smaller, about 30 kg lighter, active front and rear wings; serrated fin | [G](https://www.gettyimages.co.uk/search/2/image?phrase=Lewis+Hamilton+Ferrari+SF-26+Barcelona) · [C](https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=Ferrari+SF-26+Hamilton) |

Commons already has per-driver categories for some of these cars, for example "Ferrari SF-26 of Lewis Hamilton" and "Mercedes AMG F1 W08 EQ Power+ of Lewis Hamilton".

---

## 11. Season fact sheet v2

The per-season figures from v1 are unchanged and correct. Captions now come only from these records.

| Year | Team | Champ. | Wins | Podiums | Caption |
|---|---|---|---|---|---|
| 2007 | McLaren | P2 | 4 | 12 | 2007 · ROOKIE · P2 · 4 WINS |
| 2008 | McLaren | **Champion** | 5 | 10 | 2008 · WORLD CHAMPION |
| 2009 | McLaren | P5 | 2 | 5 | ↘ |
| 2010 | McLaren | P4 | 3 | 9 | 2009–2012 · 12 WINS |
| 2011 | McLaren | P5 | 3 | 6 | (years flip per beat) |
| 2012 | McLaren | P4 | 4 | 7 | ↗ |
| 2013 | Mercedes | P4 | 1 | 5 | 2013 · FIRST MERCEDES WIN · HUNGARY |
| 2014 | Mercedes | **Champion** | 11 | 16 | 2014 · CHAMPION · TITLE 2 |
| 2015 | Mercedes | **Champion** | 10 | 17 | 2015 · CHAMPION · TITLE 3 |
| 2016 | Mercedes | P2 | 10 | 17 | 2016 · P2 · 10 WINS |
| 2017 | Mercedes | **Champion** | 9 | 13 | 2017 · CHAMPION · TITLE 4 |
| 2018 | Mercedes | **Champion** | 11 | 17 | 2018 · CHAMPION · TITLE 5 |
| 2019 | Mercedes | **Champion** | 11 | 17 | 2019 · CHAMPION · TITLE 6 |
| 2020 | Mercedes | **Champion** | 11 | 14 | 2020 · CHAMPION · TITLE 7 |
| 2021 | Mercedes | P2 | 8 | 17 | 2021 · P2 · 8 WINS |
| 2022 | Mercedes | P6 | 0 | 9 | 2022–23 · NO WINS |
| 2023 | Mercedes | P3 | 0 | 6 | (shared with 2022) |
| 2024 | Mercedes | P7 | 2 | 5 | 2024 · 2 WINS · SILVERSTONE · SPA |
| 2025 | Ferrari | P6 | 0 | 0 | 2025 · P6 · SPRINT WIN · CHINA |
| 2026 | Ferrari | P3 after R19 | 1 | 7 | FIRST FERRARI GP WIN · BARCELONA · WIN 106 → 2026 · P3 · 7 PODIUMS · AFTER ROUND 19 |

**Career totals after round 19, 2026:** 7 titles · 106 wins · 105 poles · 209 podiums (F5).

---

## 12. Facts vs imagined content

**Content types** in the data:

| Type | Meaning | Rule |
|---|---|---|
| **FACT** | A sourced historical claim | Needs a source and a verified status, or the build fails |
| **SYMBOLIC** | A visual metaphor: title counter, team-swap wipe, helmet-off celebration | Must never imply a specific result that didn't happen. For example, 2008 never shows him finishing first in Brazil (he was P5) |
| **IMAGINED** | Future or fiction | Renders only inside `ImaginedFrame`, which always draws the IMAGINED tag in a fixed corner. A missing tag fails the build |

**Finale rules:**
- WHAT IF… framing.
- No quotes or words attributed to Hamilton.
- No announcement-style graphics.
- No F1, Visit Rwanda or news branding.
- "2030" is part of the imagined content.

The real context (the 13 Oct 2026 deal, early 2030s, Bugesera) may appear as a sourced FACT line **before** the "HISTORY ENDS HERE" rule, never inside the imagined section.

---

## 13. Production stages (eight, each ending in a gate)

1. **Scaffold, engine, beat map.**
   - Work: repo-root Remotion 4 + TypeScript; `.gitignore`; 480×270 pixel stage with the 4× output path; beat clock reading `beatmap.json` (placeholder until the audio arrives); sprite build; fonts; render and fact-check scripts; beat-analysis tools. Render speed measured.
   - **Gate:** a 5-second test clip on the beat grid plus a click-track version; your PC setup confirmed; the beat map confirmed by ear once the audio is in.
2. **Style bible, likeness test, first art.**
   - Work: palette v2; the MP4-22 at fleet and feature scale with sponsor detail; the **2026 Hamilton head at three scales**; base body rig; one environment.
   - **Gate:** contact sheet and loop. Your sign-off locks **the look and the 2026 likeness**.
3. **Car research and fleet.**
   - Work: 20 dossiers; 20 fleet cars; 6 feature cars; SF-26 hero and rear view. Numbers, helmets and sponsors verified.
   - **Gate:** a catalogue sheet showing each car beside its facts, sponsor list and links. You tick the photo check per car.
4. **Hamilton, props, environments, effects.**
   - Work: all looks and 20 portrait cards, suits, helmets and clips; the 2026 hero bust and full body animated; props; 6 + 1 environments; effects.
   - **Gate:** contact sheets and animated previews.
5. **Animatic on the real beat map.**
   - **Gate:** timing sign-off with your audio playing.
6. **Scene production,** era by era: McLaren, Mercedes, Ferrari, finale.
   - **Gate:** a preview after each era.
7. **Polish and fact check.**
   - Work: 2026 figures re-verified on the cut-off date; every caption checked against §11; imagined labels checked.
   - **Gate:** a full-length review render.
8. **Final render.**
   - Work: 1920×1080, 30 fps, 900 frames. H.264 (silent) plus ProRes 4444 or a PNG sequence; an audio copy if you want one; a beat-to-frame cue sheet.
   - **Gate:** ffprobe confirms 900 frames and 30.0 s; you approve the master.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Likeness falls short at pixel scale | Stage 2 likeness gate; up to three rounds; better reference photos |
| Audio arrives late | The engine is built on the placeholder grid; the animatic waits for the real beat map |
| Getty is blocked from the cloud | You do the Getty check from the links; I use openly licensed Commons photos plus text sources |
| Third-party rights: sponsor marks, team liveries, his likeness, the music | Fine for a personal or fan tribute. **Get clearance before any monetised or commercial use** |
| Public repo | Nothing licensed is committed; consider making it private |
| 2026 figures change (P2 and P3 are two points apart) | "After round N" stamp, re-checked at Stage 7 |
| More art than v1 (about 100 assets) | Longer Stages 3–4; feature-scale cars limited to 6 |
| An imagined clip shared out of context | Tag on every imagined frame; no words attributed; no official branding |

---

## 15. Questions for you (these unblock Stage 1)

1. **Audio.** Please send the Edit: attach it in the session if the app allows, but **don't commit it to the public repo**. If it is longer than 30 s, which 30 s should I use?
2. **Your PC.** Windows or Mac? Share the folder through Remote Control, or paste the §2 check output. Is `C:\dev\Hamilton-v1` OK?
3. **2026 cut-off.** Lock "AFTER ROUND 19 · MEXICO CITY" now, or wait for Abu Dhabi on 6 Dec?
4. **Finale wording.** WHAT IF… RWANDA 2030, or WHAT IF… AFRICAN GRAND PRIX · RWANDA 2030?
5. **Pixel finish.** Square pixels (recommended), or beads (8× grid, half the detail)?
6. **Final files.** Silent master only, or also a copy with your audio?
7. **Use.** Personal or fan, or commercial? This affects clearance only (§14).
8. **Optional.** The year-by-year car image (Reference 2) that never arrived, and any higher-resolution Hamilton photos you have rights to.

---

## 16. Sources

**Opened this session (5 Nov 2026):**
- [Lewis Hamilton 2026 results — Formula1.com](https://www.formula1.com/en/results/2026/drivers/LEWHAM01/lewis-hamilton)
- [2026 drivers' standings — Formula1.com](https://www.formula1.com/en/results/2026/drivers)
- [Adjusted 2026 standings after Mexico City — RacingNews365](https://racingnews365.com/adjusted-2026-f1-championship-standings-after-the-mexico-city-grand-prix-penalty)
- [Mexico City GP 2026 results — PlanetF1](https://www.planetf1.com/news/f1-results-mexico-city-grand-prix-2026-race)
- [Antonelli becomes youngest champion — Al Jazeera](https://www.aljazeera.com/sports/2026/11/2/kimi-antonelli-becomes-formula-ones-youngest-world-champion-in-mexico-city)

**From search results, to be re-opened at Stage 3 or 7:**
- [Hamilton's maiden Ferrari win in Barcelona — Formula1.com](https://www.formula1.com/en/latest/article/hamilton-claims-stellar-maiden-grand-prix-victory-for-ferrari-in-barcelona-as-antonelli-survives-shock-retirement.4yCXiPLHUdcnl2BwNpqUIa)
- [Win 106 in a Ferrari — GrandPrix247](https://www.grandprix247.com/formula-1-news/barcelona-catalunya-grand-prix-welcome-back-sir-lewis-hamilton-win-106-and-in-a-ferrari)
- [F1 returns to Africa with 10-year Rwanda agreement — Formula1.com](https://www.formula1.com/en/latest/article/formula-1-returns-africa-with-10-year-agreement-to-race-in-rwanda.13xs9VMK7cGFiBd2IplyES)
- [Rwanda deal, 13 Oct 2026 — Nairametrics](https://nairametrics.com/2026/10/13/formula-1-returns-to-africa-after-33-years-with-10-year-rwanda-grand-prix-deal/)
- [Ferrari unveils the SF-26 — Ferrari](https://www.ferrari.com/en-EN/formula1/articles/ferrari-unveils-the-sf-26)
- [SF-26 livery first look — PlanetF1](https://www.planetf1.com/news/ferrari-unveils-sf-26-livery-as-hamilton-and-leclerc-prepare-for-fiorano-shakedown)
- [SF-26 design and livery — The Race](https://www.the-race.com/formula-1/ferrari-2026-f1-car-serrated-shark-fin-engine-cover/)
- [Ferrari SF-26 — Wikipedia](https://en.wikipedia.org/wiki/Ferrari_SF-26)
- [Ferrari special livery for the US GP — Formula1.com](https://www.formula1.com/en/latest/article/gallery-ferrari-become-latest-team-to-unveil-special-livery-for-united-states-grand-prix.4EbG3ECmHt6RxHQYeFPkvD)
- [Ferrari 2026 race suits — f1i](https://f1i.com/news/557669-red-white-and-ready-ferrari-unveil-2026-f1-race-suits.html)
- [2026 race suit reaction — Motorsport.com](https://www.motorsport.com/f1/news/ferrari-f1-fans-love-the-2026-race-suit-but-one-detail-is-causing-outrage/10791159/)
- [2026 driver helmets — PlanetF1](https://www.planetf1.com/news/f1-driver-helmets-2026-season)

**Kept from v1 for the per-season figures:** the RacingNews365 statistics pages, Motorsport Magazine "Every Lewis Hamilton F1 car", F1 DataWeb chassis list, Formula1.com (W14 livery), RACER (W15), Ferrari (SF-25).

**References supplied by you:**
- Ref 1: F1's "20 Years of Hamilton" grid, used for era cues only, not traced.
- Ref 3: McLaren MP4-22 fuse-bead pattern by mrbanana (Kandi Pad), used for its style rules only, not copied.
