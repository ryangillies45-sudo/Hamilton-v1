"""QC sheet: each season sprite beside its licensed reference photo (photos stay
in the scratchpad and are never committed)."""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
import contact
ref_dir = Path(sys.argv[1]); out = sys.argv[2]; years = sys.argv[3].split(',')
rows = []
for y in years:
    car = contact.car_image(y)
    car = car.resize((car.width * 2, car.height * 2), Image.NEAREST)
    bg = Image.new('RGBA', car.size, (205, 214, 222, 255)); bg.alpha_composite(car)
    p = ref_dir / f'{y}.jpg'
    ref = Image.open(p).convert('RGB') if p.exists() else Image.new('RGB', (400, 250), (60, 0, 0))
    ref.thumbnail((360, 200))
    rows.append((y, ref, bg.convert('RGB')))
W = 360 + 10 + max(r[2].width for r in rows); H = sum(max(r[1].height, r[2].height) + 8 for r in rows)
S = Image.new('RGB', (W, H), (25, 25, 30)); d = ImageDraw.Draw(S); yy = 0
for y, ref, car in rows:
    S.paste(ref, (0, yy)); S.paste(car, (370, yy)); d.text((4, yy + 2), y, fill=(255, 255, 0))
    yy += max(ref.height, car.height) + 8
S.save(out, quality=85)
