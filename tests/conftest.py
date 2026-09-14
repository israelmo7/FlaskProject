import sys
from pathlib import Path

LEARSI_PROJ = Path(__file__).resolve().parents[1] / "learsi-proj"
sys.path.insert(0, str(LEARSI_PROJ))
