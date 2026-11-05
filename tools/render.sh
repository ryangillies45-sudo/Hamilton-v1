#!/usr/bin/env bash
# Render the 30 s master: Remotion draws 900 lossless 480x270 frames, ffmpeg
# scales them exactly 4x with nearest-neighbour to 1920x1080 and encodes a
# silent H.264 MP4 (BT.709). Then ffprobe verifies 900 frames / 30.0 s.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${OUT:-out}
NAME=${NAME:-hamilton-pixel-doc_1080p30_silent.mp4}
rm -rf "$OUT/frames"
npx remotion render src/index.ts Main "$OUT/frames" --sequence --image-format=png --concurrency="${CONCURRENCY:-4}"
ffmpeg -hide_banner -loglevel error -y -framerate 30 -start_number 0 -i "$OUT/frames/element-%03d.png" \
  -frames:v 900 \
  -vf "scale=1920:1080:flags=neighbor,scale=out_color_matrix=bt709:out_range=tv:flags=neighbor,format=yuv420p" \
  -c:v libx264 -preset slow -crf 14 -tune animation -profile:v high -level 4.1 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -r 30 -an -movflags +faststart "$OUT/$NAME"
node tools/verify.mjs "$OUT/$NAME"
