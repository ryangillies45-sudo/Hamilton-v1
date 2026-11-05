"""Contact sheet of chosen frames from out/frames (review tool)."""
import sys
from pathlib import Path
from PIL import Image
frames = [int(x) for x in sys.argv[2].split(',')]
d = Path('out/frames')
files = sorted(d.glob('*.png'))
ims = [Image.open(files[f]) for f in frames]
w, h = ims[0].size
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows))
for i, im in enumerate(ims):
    S.paste(im, ((i % cols) * w, (i // cols) * h))
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 1
if scale != 1:
    S = S.resize((int(S.width * scale), int(S.height * scale)), Image.NEAREST)
S.save(sys.argv[1])
