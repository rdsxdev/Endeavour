"""Compatibility entrypoint: uvicorn backend.main:app still works if cwd is repo root."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.main import app

__all__ = ["app"]
