from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"
DB_DIR = DATA_DIR / "db"
DB_PATH = DB_DIR / "consultation.db"

DB_DIR.mkdir(parents=True, exist_ok=True)
