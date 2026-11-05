"""Contact sheets for review gates: cars with wheels composited."""
import json, sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
SP = ROOT / "public" / "sprites"

def car_image(key, open_=False):
    meta = json.loads((ROOT / "src/data/generated/cars.json").read_text())[key]
    body = Image.open(SP / f"cars/{key}{'_open' if open_ else ''}.png")
    img = Image.new("RGBA", body.size, (0, 0, 0, 0))
    for (wx, wy) in meta["wheels"]:
        w = Image.open(SP / f"wheels/{key}_0.png")
        img.alpha_composite(w, (wx - meta["r"], wy - meta["r"]))
    out = Image.new("RGBA", body.size, (0, 0, 0, 0))
    out.alpha_composite(body)
    out.alpha_composite(img)
    return out

def sheet(keys, out, scale=3, cols=2, bg=(205, 214, 222, 255)):
    ims = [car_image(k) for k in keys]
    cw = max(i.width for i in ims) + 8; ch = max(i.height for i in ims) + 8
    rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGBA", (cw * cols, ch * rows), bg)
    for n, im in enumerate(ims):
        S.alpha_composite(im, ((n % cols) * cw + 4, (n // cols) * ch + 4))
    S = S.resize((S.width * scale, S.height * scale), Image.NEAREST)
    S.save(out)

if __name__ == "__main__":
    keys = sys.argv[2].split(",")
    sheet(keys, sys.argv[1])
