import os

# Shared with the KapitanChat Django backend so JWTs issued there can be verified here.
SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-n07b6t72v=yevg&*$=ghf3vm)wk1r@gi_&#cqhxedwvc1-y(yr")
ALGORYTHM = os.environ.get("JWT_ALGORITHM", "HS256")

PORT = int(os.environ.get("STORAGE_PORT", "8001"))
HOST = os.environ.get("STORAGE_HOST", "0.0.0.0")

ORIGINS = [origin.strip() for origin in os.environ.get("STORAGE_ORIGINS", "*").split(",") if origin.strip()]

# Persistent storage locations (overridden in containers to live on volumes).
FILES_DIR = os.environ.get("STORAGE_FILES_DIR", "files")
DB_PATH = os.environ.get("STORAGE_DB_PATH", "database.sqlite3")
