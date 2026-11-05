"""Rebuild every sprite: python3 tools/art/build_all.py (needs Pillow + numpy)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cars, hamilton  # noqa: E402

cars.build_all()
hamilton.build_all()
print("sprites rebuilt")
