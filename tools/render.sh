#!/usr/bin/env bash
# Render the 70 s vertical master: Remotion draws 2,100 lossless 360x640
# frames, ffmpeg scales them exactly 3x with nearest-neighbour to 1080x1920 and
# encodes a silent H.264 MP4 (BT.709). Then ffprobe verifies the result.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${OUT:-out}
NAME=${NAME:-hamilton-pixel-doc_1080x1920_30fps_silent.mp4}
rm -rf "$OUT/frames"
npx remotion render src/index.ts Main "$OUT/frames" --sequence --image-format=png --concurrency="${CONCURRENCY:-4}"
ffmpeg -hide_banner -loglevel error -y -framerate 30 -start_number 0 -i "$OUT/frames/element-%04d.png" \
  -frames:v 2100 \
  -vf "scale=1080:1920:flags=neighbor,scale=out_color_matrix=bt709:out_range=tv:flags=neighbor,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -tune animation -profile:v high -level 4.2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -r 30 -an -movflags +faststart "$OUT/$NAME"
node tools/verify.mjs "$OUT/$NAME"
